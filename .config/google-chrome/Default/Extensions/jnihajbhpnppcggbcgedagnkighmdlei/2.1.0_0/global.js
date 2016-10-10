(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LiveReloadGlobal, TabState, ToggleCommand, _ref;

_ref = require('../common/global'), LiveReloadGlobal = _ref.LiveReloadGlobal, TabState = _ref.TabState;

TabState.prototype.send = function(message, data) {
  if (data == null) {
    data = {};
  }
  return chrome.tabs.sendMessage(this.tab, [message, data]);
};

TabState.prototype.bundledScriptURI = function() {
  return chrome.runtime.getURL('livereload.js');
};

LiveReloadGlobal.isAvailable = function(tab) {
  return true;
};

LiveReloadGlobal.initialize();

ToggleCommand = {
  invoke: function() {},
  update: function(tabId) {
    var status;
    status = LiveReloadGlobal.tabStatus(tabId);
    chrome.browserAction.setTitle({
      tabId: tabId,
      title: status.buttonToolTip
    });
    return chrome.browserAction.setIcon({
      tabId: tabId,
      path: {
        '19': status.buttonIcon,
        '38': status.buttonIconHiRes
      }
    });
  }
};

chrome.browserAction.onClicked.addListener(function(tab) {
  LiveReloadGlobal.toggle(tab.id);
  return ToggleCommand.update(tab.id);
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  return ToggleCommand.update(tabId);
});

chrome.tabs.onRemoved.addListener(function(tabId) {
  return LiveReloadGlobal.killZombieTab(tabId);
});

chrome.runtime.onMessage.addListener(function(_arg, sender, sendResponse) {
  var data, eventName;
  eventName = _arg[0], data = _arg[1];
  switch (eventName) {
    case 'status':
      LiveReloadGlobal.updateStatus(sender.tab.id, data);
      return ToggleCommand.update(sender.tab.id);
    default:
      return LiveReloadGlobal.received(eventName, data);
  }
});



},{"../common/global":2}],2:[function(require,module,exports){
var CannotConnectAlert, ExtVersion, LiveReloadGlobal, Status, TabState, TheWebSocket;

ExtVersion = require('./version');

Status = {
  unavailable: {
    buttonEnabled: false,
    buttonToolTip: 'LiveReload not available on this tab',
    buttonIcon: 'IconUnavailable.png',
    buttonIconHiRes: 'IconUnavailable@2x.png'
  },
  disabled: {
    buttonEnabled: true,
    buttonToolTip: 'Enable LiveReload',
    buttonIcon: 'IconDisabled.png',
    buttonIconHiRes: 'IconDisabled@2x.png'
  },
  enabled: {
    buttonEnabled: true,
    buttonToolTip: 'LiveReload is connecting, click to disable',
    buttonIcon: 'IconEnabled.png',
    buttonIconHiRes: 'IconEnabled@2x.png'
  },
  active: {
    buttonEnabled: true,
    buttonToolTip: 'LiveReload is connected, click to disable',
    buttonIcon: 'IconActive.png',
    buttonIconHiRes: 'IconActive@2x.png'
  }
};

TabState = (function() {
  function TabState(tab) {
    this.tab = tab;
    this.enabled = false;
    this.active = false;
  }

  TabState.prototype.enable = function() {
    return this.send('enable', {
      useFallback: this.useFallback,
      scriptURI: this.bundledScriptURI(),
      host: LiveReloadGlobal.host,
      port: LiveReloadGlobal.port
    });
  };

  TabState.prototype.disable = function() {
    return this.send('disable');
  };

  TabState.prototype.updateStatus = function(status) {
    if (status.initial) {
      if (!status.enabled) {
        this.active = false;
        if (this.enabled) {
          this.enable();
        }
        return;
      }
    }
    if (status.enabled != null) {
      this.enabled = status.enabled;
    }
    if (status.active != null) {
      return this.active = status.active;
    }
  };

  TabState.prototype.status = function() {
    switch (false) {
      case !this.active:
        return Status.active;
      case !this.enabled:
        return Status.enabled;
      default:
        return Status.disabled;
    }
  };

  TabState.prototype.alert = function(message) {
    return this.send('alert', message);
  };

  return TabState;

})();

if (navigator.userAgent.match(/Mac OS X/)) {
  CannotConnectAlert = "Could not connect to LiveReload server. Please make sure that LiveReload 2.3 (or later) or another compatible server is running.";
} else {
  CannotConnectAlert = "Could not connect to LiveReload server. Please make sure that a compatible LiveReload server is running. (We recommend guard-livereload, until LiveReload 2 comes to your platform.)";
}

TheWebSocket = typeof WebSocket !== "undefined" && WebSocket !== null ? WebSocket : MozWebSocket;

LiveReloadGlobal = {
  _tabs: [],
  initialize: function() {
    this.host = '127.0.0.1';
    return this.port = 35729;
  },
  killZombieTabs: function() {
    var tabState;
    return this._tabs = (function() {
      var _i, _len, _ref, _results;
      _ref = this._tabs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tabState = _ref[_i];
        if (this.isAvailable(tabState.tab)) {
          _results.push(tabState);
        }
      }
      return _results;
    }).call(this);
  },
  killZombieTab: function(tab) {
    var index, tabState, _i, _len, _ref;
    _ref = this._tabs;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      tabState = _ref[index];
      if (tabState.tab === tab) {
        this._tabs.splice(index, 1);
        return;
      }
    }
  },
  findState: function(tab, create) {
    var state, tabState, _i, _len, _ref;
    if (create == null) {
      create = false;
    }
    _ref = this._tabs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tabState = _ref[_i];
      if (tabState.tab === tab) {
        return tabState;
      }
    }
    if (create) {
      state = new TabState(tab);
      this._tabs.push(state);
      return state;
    } else {
      return null;
    }
  },
  toggle: function(tab) {
    var state;
    if (this.isAvailable(tab)) {
      state = this.findState(tab, true);
      if (state.enabled) {
        state.disable();
        if (!this.areAnyTabsEnabled()) {
          return this.afterDisablingLast();
        }
      } else {
        if (this.areAnyTabsEnabled()) {
          state.useFallback = this.useFallback;
          return state.enable();
        } else {
          return this.beforeEnablingFirst((function(_this) {
            return function(err) {
              if (err) {
                switch (err) {
                  case 'cannot-connect':
                    return state.alert(CannotConnectAlert);
                  case 'cannot-download':
                    return state.alert("Cannot download livereload.js");
                }
              } else {
                state.useFallback = _this.useFallback;
                return state.enable();
              }
            };
          })(this));
        }
      }
    }
  },
  tabStatus: function(tab) {
    var _ref;
    if (!this.isAvailable(tab)) {
      return Status.unavailable;
    }
    return ((_ref = this.findState(tab)) != null ? _ref.status() : void 0) || Status.disabled;
  },
  updateStatus: function(tab, status) {
    return this.findState(tab, true).updateStatus(status);
  },
  areAnyTabsEnabled: function() {
    var tabState, _i, _len, _ref;
    _ref = this._tabs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tabState = _ref[_i];
      if (tabState.enabled) {
        return true;
      }
    }
    return false;
  },
  beforeEnablingFirst: function(callback) {
    var callbackCalled, failOnTimeout, timeout, ws;
    this.useFallback = false;
    callbackCalled = false;
    failOnTimeout = function() {
      console.log("Haven't received a handshake reply in time, disconnecting.");
      return ws.close();
    };
    timeout = setTimeout(failOnTimeout, 1000);
    console.log("Connecting to ws://" + this.host + ":" + this.port + "/livereload...");
    ws = new TheWebSocket("ws://" + this.host + ":" + this.port + "/livereload");
    ws.onerror = (function(_this) {
      return function() {
        console.log("Web socket error.");
        if (!callbackCalled) {
          callback('cannot-connect');
        }
        return callbackCalled = true;
      };
    })(this);
    ws.onopen = (function(_this) {
      return function() {
        console.log("Web socket connected, sending handshake.");
        return ws.send(JSON.stringify({
          command: 'hello',
          protocols: ['http://livereload.com/protocols/connection-check-1']
        }));
      };
    })(this);
    ws.onclose = function() {
      console.log("Web socket disconnected.");
      if (!callbackCalled) {
        callback('cannot-connect');
      }
      return callbackCalled = true;
    };
    return ws.onmessage = (function(_this) {
      return function(event) {
        var xhr;
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = null;
        console.log("Incoming message: " + event.data);
        if (event.data.match(/^!!/)) {
          _this.useFallback = true;
          if (!callbackCalled) {
            callback(null);
          }
          callbackCalled = true;
          return ws.close();
        } else if (event.data.match(/^\{/)) {
          xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
              _this.script = xhr.responseText;
              if (!callbackCalled) {
                callback(null);
              }
              return callbackCalled = true;
            }
          };
          xhr.onerror = function(event) {
            if (!callbackCalled) {
              callback('cannot-download');
            }
            return callbackCalled = true;
          };
          xhr.open("GET", "http://" + _this.host + ":" + _this.port + "/livereload.js", true);
          return xhr.send(null);
        }
      };
    })(this);
  },
  afterDisablingLast: function() {},
  received: function(eventName, data) {
    var func;
    if (func = this["on " + eventName]) {
      return func.call(this, data);
    }
  },
  'on resourceAdded': function(_arg) {
    var url;
    url = _arg.url;
    return console.log("Resource added: " + url);
  },
  'on resourceUpdated': function(_arg) {
    var content, url;
    url = _arg.url, content = _arg.content;
    return console.log("Resource updated: " + url);
  }
};

exports.TabState = TabState;

exports.LiveReloadGlobal = LiveReloadGlobal;



},{"./version":3}],3:[function(require,module,exports){
var ExtVersion;

module.exports = ExtVersion = '2.1.0';



},{}]},{},[1]);
