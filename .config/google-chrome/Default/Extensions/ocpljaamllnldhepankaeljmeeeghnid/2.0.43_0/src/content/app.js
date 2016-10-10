//
//
//
//
//
//
//
// Mixmax (mixmax.com) is venture-backed company focused on bring powerful email and productivity
// tools to Gmail.
//
// LINKS:
//  Mixmax Homepage: https://mixmax.com
//  Investors & funding: https://www.crunchbase.com/organization/mixmax
//  Product review: http://fieldguide.gizmodo.com/supercharge-your-email-with-mixmax-1711351820
//
// A TECHNICAL NOTE:
//
// Mixmax injects a third party library (hosted on Mixmax servers and under the complete control
// of Mixmax) in order to quickly deploy new features and fix bugs. Using an external script (that
// isn't a content script) also gives Mixmax the ability to access global Javascript variables
// that exist in the web pages this script is injected into. This is a very common practice
// implemented by many other extensions that enhance Gmail (necessary to keep up with Gmail updates).
//
//
//
//
//
//
//

chrome.storage.local.get(null  , function(storage) {
  var domain;

  // Inject the real extension into Gmail.
  if (storage.environment === 'local') {
    domain = 'https://extension-local.mixmax.com';
  } else if (storage.environment === 'staging') {
    console.warn('Mixmax extension is running from staging.');
    domain = 'https://dzdsh0uck5hox.cloudfront.net';
  } else {
    domain = 'https://d1j5o6e2vipffp.cloudfront.net';
  }

  if (storage.environment === 'local') {
        loadCSS(storage.environment, domain, 0  )
      .then(function() {
        return loadScript(storage.environment, domain, 0  , false  );
      })
      .fail(function() {
        alert('Failed to load extension locally. See README.');
      });

  } else {
        loadCSS(storage.environment, domain, 6  )
      .then(function done() {
                return loadScript(storage.environment, domain, 3  , true  );
      }, function fail() {
                throw new Error('Failed to load Mixmax CSS');
      })
      .fail(function() {
                loadScript(storage.environment, domain, 3  , false  )
          .done(function() {
                        error.captureMessage('Blocked by CSP when loading the extension', {
              tags: {
                user: getLikelyUserEmail(),
                domain: window.location.hostname
              }
            });
          })
          .fail(function() {
                        error.captureMessage('Loaded CSS but could not load JS', {
              tags: {
                user: getLikelyUserEmail(),
                domain: window.location.hostname
              }
            });
          });
      });
  }
});


function loadCSS(environment, domain, numRetries, retryCount  ) {
  var deferred = $.Deferred();

  retryCount = retryCount || 0;

  var cssPath = domain + '/src/styles.css';
  var css = document.createElement('link');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('type', 'text/css');
  css.setAttribute('href', cssPath);

  css.onerror = function(e) {
    if (++retryCount < numRetries) {
      setTimeout(function() {
        loadCSS(environment, domain, numRetries, retryCount)
          .done(deferred.resolve)
          .fail(deferred.reject);
      }, 250 * retryCount  );
    } else {
      deferred.reject(e);
    }
  };

  css.onload = function() {
    deferred.resolve();
  };

  document.head.appendChild(css);

  return deferred.promise();
}


function loadScript(environment, domain, numRetries, withCors, retryCount  ) {
  var deferred = $.Deferred();

  retryCount = retryCount || 0;

  var script = document.createElement('script');
  script.setAttribute('src', domain + '/src/build.js');

  if (withCors) {
    script.setAttribute('crossorigin', 'anonymous');
  }

  script.onload = function() {
    deferred.resolve();
  };

  script.onerror = function(e) {
    if (++retryCount < numRetries) {
      setTimeout(function() {
        loadScript(environment, domain, numRetries, withCors, retryCount)
          .done(deferred.resolve)
          .fail(deferred.reject);
      }, 250 * retryCount  );
    } else {
      deferred.reject(e);
    }
  };

  document.head.appendChild(script);

  return deferred.promise();
}

function getLikelyUserEmail() {
  var emailRegex = /[a-z0-9\._+\-]+@[a-z0-9\.\-]+\.[a-z]{2,20}/i;
  var messageElement = document.querySelector('.msg');
  if (messageElement && emailRegex.test(messageElement.textContent)) {
    return messageElement.textContent.match(emailRegex)[0];
  } else {
    var titleMatch = document.title.match(emailRegex);
    if (titleMatch) return titleMatch[0];
  }
}
