(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ChromeDevTools, DevTools,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

require('../common/devtools');

DevTools = (function() {
  function DevTools() {}

  DevTools.prototype.resourceAdded = function(resource) {
    console.log("LiveReload.resourceAdded: " + resource.url);
    return this.send('resourceAdded', {
      url: resource.url
    });
  };

  DevTools.prototype.resourceUpdated = function(resource, content) {
    console.log("LiveReload.resourceUpdated: %s - %s", resource.url, content);
    return this.send('resourceUpdated', {
      url: resource.url,
      content: content
    });
  };

  return DevTools;

})();

ChromeDevTools = (function(_super) {
  __extends(ChromeDevTools, _super);

  function ChromeDevTools() {
    return ChromeDevTools.__super__.constructor.apply(this, arguments);
  }

  ChromeDevTools.prototype.send = function(message, data) {
    return chrome.runtime.sendMessage([message, data]);
  };

  return ChromeDevTools;

})(DevTools);

(function() {
  var devTools;
  devTools = new ChromeDevTools();
  chrome.devtools.inspectedWindow.onResourceAdded.addListener(function(resource) {
    return devTools.resourceAdded(resource);
  });
  return chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function(resource, content) {
    return devTools.resourceUpdated(resource, content);
  });
})();



},{"../common/devtools":2}],2:[function(require,module,exports){




},{}]},{},[1]);
