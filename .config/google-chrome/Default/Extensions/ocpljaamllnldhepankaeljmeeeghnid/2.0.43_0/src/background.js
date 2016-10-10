var ExtensionMessageBus = (function() {
    var listeners = {};

    var tabQueryRedirects = {};

    function redirectKeyForQuery(tabQuery) {
    return JSON.stringify(tabQuery);
  }

    var pendingSends = {};

  // Listen to events from the extension source (by way of the content script).
  chrome.runtime.onMessage.addListener(function(request, sender) {
    $(listeners).trigger(request.method, {
      invocationId: request.invocationId,
      payload: request.payload,
      sender: {
        id: sender.tab.id,
        url: sender.tab.url,
        canonicalUrl: request.canonicalUrl
      }
    });
  });

  // This function exists only because `chrome.tabs`' query APIs are asynchronous.
  function sendToTabs(method, payload, tabs, tabQuery, options) {
    // Send the message if the query yielded results.
    if (tabs && tabs.length) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          method: method,
          payload: payload
        });
      });

      // If the query yielded a single tab and the sender specified to activate the tab, do so.
      if ((tabs.length === 1) && options.activateAfterSending) {
        chrome.tabs.update(tabs[0].id, {
          active: true
        });
      }
    } else if (tabQuery.canonicalUrl || tabQuery.url) {
      // If no tabs were found, open a tab for the query. We'll resend the message when the tab's
      // listeners are ready.
      var redirectKey = redirectKeyForQuery(tabQuery);

      // It's possible that a tab has already been opened, since this function is executed
      // asynchronously after `send`.
      var redirectedQuery = tabQueryRedirects[redirectKey];
      if (redirectedQuery) {
        var pendingSendsForTab = pendingSends[redirectedQuery.id];
        if (pendingSendsForTab) {
          pendingSendsForTab.push([method, payload, redirectedQuery]);
        } else {
          // The pending sends have already been cleared. Try re-sending.
          send(method, payload, redirectedQuery, options);
        }
        return;
      }

      chrome.tabs.create({
        url: tabQuery.canonicalUrl || tabQuery.url
      }, function(tab) {
        redirectedQuery = {
          id: tab.id,
          // Include the URL/canonical URL in the redirect so that if this _new_ tab is closed
          // we'll be able to redirect again.
          url: tabQuery.url,
          canonicalUrl: tabQuery.canonicalUrl
        };
        tabQueryRedirects[redirectKey] = redirectedQuery;
        var pendingSendsForTab = pendingSends[redirectedQuery.id] = [];
        pendingSendsForTab.push([method, payload, redirectedQuery]);
      });
    }
  }

  function send(method, payload, tabQuery , options ) {
    tabQuery = tabQuery || {};     options = _.defaults({}, options, { activateAfterSending: false });

    var redirectedQuery = tabQueryRedirects[redirectKeyForQuery(tabQuery)];
    if (redirectedQuery) {
      while (redirectedQuery) {
        tabQuery = redirectedQuery;
        redirectedQuery = tabQueryRedirects[redirectKeyForQuery(tabQuery)];
      }
      var pendingSendsForTab = pendingSends[tabQuery.id];
      if (pendingSendsForTab) {
        // Resend when the tab's listeners are ready.
        pendingSendsForTab.push([method, payload, tabQuery]);
        return;
      }
      // Otherwise, the tab's ready; let the message send.
    }

    if (tabQuery.id) {
      chrome.tabs.get(tabQuery.id, function(tab) {
        if (chrome.runtime.lastError) {
          // If no tab is found with the specified ID, `lastError` will be set and we need to check
          // it or Chrome will complain. But, we don't consider this an error since we expect that
          // the tab might have been closed.
        }
        sendToTabs(method, payload, tab && [tab], tabQuery, options);
      });
    } else {
      chrome.tabs.query({ url: tabQuery.url }, function(tabs) {
        if (!_.isUndefined(tabQuery.notId)) {
          tabs = _.reject(tabs, function(tab) {
            return tab.id === tabQuery.notId;
          });
        }
        sendToTabs(method, payload, tabs, tabQuery, options);
      });
    }
  }

  function on(method, callback) {
    $(listeners).on(method, function(evt, context) {
      if (context.invocationId) {
        callback(context.payload, context.sender, function(response) {
          send('_IN_REPLY_TO_' + context.invocationId, response);
        });
        delete context.invocationId;  // Only one response can be sent.
      } else {
        callback(context.payload, context.sender);
      }
    });
  }

  // When tab listeners become ready, flush pending message sends.
  on('listenerReady', function(method, sender) {
    var pendingSendsForTab = pendingSends[sender.id];
    if (pendingSendsForTab) {
      var completedSends = [];
      pendingSendsForTab.forEach(function(sendArguments) {
        if (sendArguments[0] === method) {
          send.apply(null, sendArguments);
          completedSends.push(sendArguments);
        }
      });
      // Filter the completed sends from the pending sends.
      pendingSendsForTab = pendingSendsForTab.filter(function(sendArguments) {
        return completedSends.indexOf(sendArguments) === -1;
      });
      if (pendingSendsForTab.length) {
        pendingSends[sender.id] = pendingSendsForTab;
      } else {
                delete pendingSends[sender.id];
      }
    }

      });

  return {
        send: send,

        on: on
  };
})();

var doubleClickTimer;
var wasDoubleClick;

chrome.browserAction.onClicked.addListener(function(tab) {
  if (doubleClickTimer) {
    wasDoubleClick = true;
    return;
  }

  doubleClickTimer = setTimeout(function() {
    chrome.windows.get(tab.windowId, function(win) {
      chrome.storage.local.get(null  , function(storage) {
        var body = (urlShouldBeShared(tab.url) && !wasDoubleClick) ? tab.url : null;
        var opened = openNewWindowToAccount(win, tab, storage, {
          body: body
        });

        // If they haven't onboarded an account, just bring gmail up.
        if (!opened) refreshGmail(true);

        wasDoubleClick = false;
        doubleClickTimer = null;
      });
    });
  }, 250);
});


// Returns true if the url should be put into the body of the message.
function urlShouldBeShared(url) {
  if (!url) return false;

  // Must start with http.
  if (!/^http/.test(url)) return false;

  // Gmail links are handled internally.
  if (/(mail|inbox).google.com/.test(url)) return false;

  return true;
}


function preferredOnboardedAccount(storage) {
  var preferred = storage['account_last_used_in_popup_' + Environment.get()];
  if (!preferred) return;

  // It must have been onboarded.
  var hasBeenOnboarded = storage['onboarded_' + preferred + '_' + Environment.get()];
  if (!hasBeenOnboarded) return;

  return preferred;
}


function getOnboardedAccounts(storage) {
  var onboardedAccounts = [];

  Object.keys(storage).some(function(key) {
        var matches = key.match(new RegExp('^onboarded_(.+)_' + Environment.get() + '$'));
    if (matches && storage[key]) onboardedAccounts.push(matches[1]);
  });

  return onboardedAccounts;
}


function openNewWindowToAccount(win, tab, storage, emailParams) {
  var onboardedAccounts = getOnboardedAccounts(storage);
  if (onboardedAccounts.length === 0) return false;

  var preferredAccount = preferredOnboardedAccount(storage) || onboardedAccounts[0];

  var messageId = generateMessageId();
  var url = Environment.getComposeUrl() + '/message/' + messageId + '?user=' + encodeURIComponent(preferredAccount);

  // Only show the accounts bar if there's more than one account to choose from.
  if (onboardedAccounts.length > 1) {
    url += '&showAccounts=true';
  }

  if (!_.isEmpty(emailParams)) {
        url += '&' + $.param(emailParams).replace(/\+/g, '%20');
  }

  if (win.state === 'fullscreen') {
    // If the source window is in fullscreen mode, create a new tab.
    chrome.tabs.create({
      windowId: win.id,
      url: url,
      index: tab.index + 1 // Create this tab right after the source tab.
    });

  } else {
    var windowRightEdge = win.left + win.width;
    var windowTop = win.top;
    // Match Gmail compose mole size.
    var width = 615;
    var height = 533;

    chrome.windows.create({
      url: url,
      width: width,
      height: height,
      top: windowTop + 70,
      left: windowRightEdge - width - 20,
      type: 'popup'
    });
  }

  return true; // Success
}

function generateMessageId() {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz';
  var length = 17; // Not a requirement that it's 17 characters long, but that's what Random.id() uses.
  var buffer = new Uint16Array(length);
  // Don't use Math.random() since there's risk of collisions: http://devoluk.com/google-chrome-math-random-issue.html
  window.crypto.getRandomValues(buffer);
  var randomstring = '';
  for (var i = 0; i < buffer.length; i++) {
    randomstring += chars[buffer[i] % chars.length];
  }
  return randomstring;
}

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.method !== 'mailTo') return;

  openMailtoLink(sender.tab, request.payload.href);
});

chrome.tabs.onCreated.addListener(function(tab) {
  if (!/^mailto:/.test(tab.url)) return;

  chrome.storage.local.get(null  , function(storage) {
    var hasAtLeastOneAccount = getOnboardedAccounts(storage).length > 0;
    if (hasAtLeastOneAccount) {
      openMailtoLink(tab, tab.url);
      chrome.tabs.remove(tab.id);
    }
  });
});

function openMailtoLink(tab, href) {
  var to = href.match(/mailto:([^\?]+)/);
  if (to) to = decodeURIComponent(to[1]);

  var cc = getParameterByName(href, 'cc');
  var bcc = getParameterByName(href, 'bcc');
  var subject = getParameterByName(href, 'subject');
  var body = getParameterByName(href, 'body');

  var payload = {};
  if (to) payload.to = to;
  if (cc) payload.cc = cc;
  if (bcc) payload.bcc = bcc;
  if (subject) payload.subject = subject;
  if (body) payload.body = body;

  chrome.windows.get(tab.windowId, function(win) {
    chrome.storage.local.get(null  , function(storage) {
      openNewWindowToAccount(win, tab, storage, payload);
    });
  });
}


// Helper gets a URL parameter by name.
function getParameterByName(href, name) {
  var match = RegExp('[?&]' + name + '=([^&]*)', 'i').exec(href);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

var LAST_SEEN_NOTIFICATIONS = [];
var MAXIMUM_RETAINED_NOTIFICATIONS = 100;

ExtensionMessageBus.on('postNotification', function(notificationOptions, notificationSender) {
  // Debounce notifications in case the same Gmail account is open in multiple tabs.
  var notificationId = notificationOptions.id;
  if (LAST_SEEN_NOTIFICATIONS.indexOf(notificationId) !== -1) {
    return;
  } else {
    LAST_SEEN_NOTIFICATIONS.unshift(notificationId);
    if (LAST_SEEN_NOTIFICATIONS.length > MAXIMUM_RETAINED_NOTIFICATIONS) {
      LAST_SEEN_NOTIFICATIONS.pop();
    }
  }

  // Use the notification's ID to pass the notification context through to the click handlers,
  // making this API stateless (for simplicity and also to future-proof this if it were to become
  // an event page).
  var handlerOptionKeys = ['activateOnClick'];
  var context = {
    id: notificationId,
    clientContext: notificationOptions.context,
    sender: notificationSender,
    handlerOptions: _.map(notificationOptions.buttons, function(button) {
      return _.pick(button, handlerOptionKeys);
    })
  };
  var id = JSON.stringify(context);

  chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: 'src/assets/img/icon.png',
    title: notificationOptions.title,
    message: notificationOptions.message,
    buttons: _.map(notificationOptions.buttons, function(button) {
      // The Chrome API will freak out if we pass a non-standard key.
      return _.omit(button, handlerOptionKeys);
    }),
        isClickable: notificationOptions.showClickable
  }, function(notificationId) {
    var err = chrome.runtime.lastError;
    if (err) {
      error('Could not post notification:', err);
    }
  });
});

function onNotificationClicked(notificationId, buttonIndex) {
  if (buttonIndex === undefined) {
    // This was called from 'onClicked' (the body of the notification was clicked, vs. a button).
    // `null` is expected in this case below and by the 'notificationClicked' handler in `extension-source`.
    buttonIndex = null;
  }

  // Chrome does not clear notifications when you click on them (tested 1/17/2015).
  chrome.notifications.clear(notificationId, function() {});

  var context;
  try {
    context = JSON.parse(notificationId);
  } catch (e) {
    error('Notification ID is malformed:', notificationId);
  }
  if (!context) return;


  var notificationOptions = {
    activateAfterSending: true
  };

  if (buttonIndex !== null) {
    var handlerOptions = context.handlerOptions[buttonIndex];
    notificationOptions.activateAfterSending = handlerOptions.activateOnClick;
  }

  ExtensionMessageBus.send('notificationClicked', {
    id: context.id,
    context: context.clientContext,
    buttonIndex: buttonIndex
  }, context.sender, notificationOptions);
}
chrome.notifications.onClicked.addListener(onNotificationClicked);
chrome.notifications.onButtonClicked.addListener(onNotificationClicked);

ExtensionMessageBus.on('ping', function(payload, sender, callback) {
    if (callback) callback('pong');
});

// If an gmail tab is open, reload it and focus it. Otherwise, open a new tab. This needs to be a
// global function because it's called directly from the options page.
refreshGmail = function(bringToForeground) {
  chrome.windows.getAll({
    populate: true
  }, function(windows) {
    var foundExisting = false;

    windows.forEach(function(win) {
      win.tabs.forEach(function(tab) {
        // Ignore non-gmail tabs.
        if (!/https:\/\/(mail|inbox)\.google\.com/.test(tab.url)) return;

        // Reload all gmail tabs.
        chrome.tabs.reload(tab.id);

        // If this is the first one found, activate it.
        if (bringToForeground && !foundExisting) {
          chrome.tabs.update(tab.id, {
            active: true
          });
        }

        foundExisting = true;
      });
    });

    // If no gmail tab found, just open a new one.
    if (bringToForeground && !foundExisting) {
      chrome.tabs.create({
        // TODO(brad): Handle inbox?
        url: 'https://mail.google.com',
        active: true
      });
    }
  });
};

// Refresh on install.
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    refreshGmail(true  );
  }
});

// Refresh gmail (for deactivating).
ExtensionMessageBus.on('refreshGmail', function(payload, sender, callback) {
  refreshGmail(payload  );
  if (callback) callback();
});

var hosts = [
    'https://d1j5o6e2vipffp.cloudfront.net',
    'https://dzdsh0uck5hox.cloudfront.net',
    'https://extension-local.mixmax.com',
    'https://livereload-extension-local.mixmax.com',
  // For Segment.io that we inject locally.
  'https://api.keen.io/',

    'https://' + '*.intercom.io/',
  'https://' + '*.intercomcdn.com/',
  // For the extension source sharing link at the top of gmail.
  'https://' + '*.facebook.net',
  'https://' + '*.facebook.com',
  'https://' + '*.twitter.com'
].join(' ');

var iframeHosts = [
  'https://' + '*.mixmax.com',
  'http://' + '*.mixmax.com',
  // For the extension source sharing link at the top of gmail.
  'https://' + '*.facebook.net',
  'https://' + '*.facebook.com',
  'https://' + '*.twitter.com'
].join(' ');

chrome.webRequest.onHeadersReceived.addListener(function(details) {
  for (var i = 0; i < details.responseHeaders.length; i++) {
    var isCSPHeader = /content-security-policy|^x-webkit-csp(-report-only)?$/i.test(details.responseHeaders[i].name);
    if (isCSPHeader) {
      var csp = details.responseHeaders[i].value;
      csp = csp.replace('script-src', 'script-src ' + hosts);
      csp = csp.replace('style-src', 'style-src ' + hosts);
      csp = csp.replace('frame-src', 'frame-src ' + iframeHosts);
      details.responseHeaders[i].value = csp;
    }
  }

  return {
    responseHeaders: details.responseHeaders
  };
}, {
    urls: ['https://mail.google.com/' + '*', 'https://inbox.google.com/' + '*'],
  types: ['main_frame']
}, ['blocking', 'responseHeaders']);

// Modify storage.
ExtensionMessageBus.on('setStorage', function(payload, sender, callback) {
  chrome.storage.local.set(payload);
  // Sync storage with the other tabs.
  ExtensionMessageBus.send('setStorage', payload, {
    notId: sender.id
  });
  if (callback) callback();
});

function setUninstallUrl() {
  // Not on Chrome 41 yet.
  if (!chrome.runtime.setUninstallURL) return;

  chrome.storage.local.get(null  , function(storage) {
    var allAccounts = [];
    var loggedInAccounts = [];

    Object.keys(storage).forEach(function(key) {
      var matches = key.match(/^onboarding_started_(.+)_[a-z]+$/);
      if (matches) allAccounts.push(matches[1]);

            matches = key.match(/^has_been_onboarded_(.+)_[a-z]+$/);
      if (matches && !_.contains(allAccounts, matches[1])) allAccounts.push(matches[1]);

      matches = key.match(/^onboarded_(.+)_[a-z]+$/);
      if (matches) loggedInAccounts.push(matches[1]);
    });

        allAccounts = _.unique(allAccounts);
    loggedInAccounts = _.unique(loggedInAccounts).map(function(account) {
      return allAccounts.indexOf(account);
    });

    var url = Environment.getWwwUrl() + '/sosad' +
            '?a2=' + LZString.compressToEncodedURIComponent(allAccounts.join(',')) +
      '&l2=' + LZString.compressToEncodedURIComponent(loggedInAccounts.join(','));

    chrome.runtime.setUninstallURL(url);
  });
}

// Set now.
setUninstallUrl();

// Set on every key change so we update the url when accounts get onboarded.
chrome.storage.onChanged.addListener(setUninstallUrl);

chrome.webRequest.onBeforeRequest.addListener(function(details) {
  // We don't need to check for `localhost` requests because those will fail anyway.
  if (details.url.indexOf('mixmax.com/api/track') !== -1) {
    return {
            redirectUrl: 'data:image/gif;base64,R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
    };
  }
  return {};
}, {
  urls: ['*://*.googleusercontent.com/proxy*'],
  types: ['image']
}, ['blocking']);
