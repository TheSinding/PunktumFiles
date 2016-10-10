//
// This file is part of ColorZilla
//
// Written by Alex Sirota (alex @ iosart.com)
//
// Copyright (c) iosart labs llc 2011, All Rights Reserved
//
(function() {
    if (!document.body.hasAttribute('cz-shortcut-listen')) {
        document.body.setAttribute('cz-shortcut-listen', 'true');
        document.body.addEventListener('keydown', function(e) {
            var isMac = navigator.userAgent.toLowerCase().indexOf('mac') > -1;
            var keyCode = e.keyCode;
            if ((e.ctrlKey && e.altKey && !isMac ||
                 e.metaKey && e.altKey && isMac) &&
                 keyCode > 64 && keyCode < 91) {
                    chrome.extension.sendRequest({op:'hotkey-pressed', keyCode: keyCode});
            }
        }, false);
    }
})();
