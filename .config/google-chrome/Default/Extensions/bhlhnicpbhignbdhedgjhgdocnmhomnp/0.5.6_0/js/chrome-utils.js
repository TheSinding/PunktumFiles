//
// This file is part of ColorZilla
//
// Written by Alex Sirota (alex @ iosart.com)
//
// Copyright (c) iosart labs llc 2011, All Rights Reserved
//

if (typeof ColorZilla == "undefined" || !ColorZilla) { var ColorZilla = {}; }

ColorZilla.ChromeUtils = {
    openURLInNewTab : function(url) {
      chrome.tabs.create({url:url});
    },

    getExtensionVersion : function(callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("get", "/manifest.json", true);
        xmlhttp.onreadystatechange = function (e) {
            if (xmlhttp.readyState == 4) {
                callback(JSON.parse(xmlhttp.responseText).version);
            }
        };
        xmlhttp.send({});
    },

    getChromeVersion : function() {
        if (!window || !window.navigator) return '-';
        
        var userAgent = window.navigator.userAgent;
        if (userAgent && userAgent.match(/Chrome\/([0-9.]+)/)) {
            return RegExp.$1;
        } else {
            return '-';
        }
    },

    getPlatform : function() {
        var userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('mac') != -1) return 'mac';
        if (userAgent.indexOf('windows') != -1) return 'windows';
        if (userAgent.indexOf('linux') != -1) return 'linux';
        return 'unknown';
    },

    platformIs : function(platform) {
       return this.getPlatform() == platform;
    },

    platformSupportsNonForegroundHover : function() {
        return this.getPlatform() == 'windows';
    },

    i18nReplace : function(selector, name) {
        $(selector).html(chrome.i18n.getMessage(name));
    }
}

