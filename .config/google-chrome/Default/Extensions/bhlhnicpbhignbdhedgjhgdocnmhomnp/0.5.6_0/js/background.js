if (typeof ColorZilla == "undefined" || !ColorZilla) { var ColorZilla = {}; }
var cz = ColorZilla;
cz.Background = {
    init : function() {
     cz.Background.setupListeners();
     cz.Background.currentColor = null;
     cz.Background.lastSampledColor = null;
     cz.Background.colorWasSampled = false;

     cz.Background.readOptions();

     cz.Background.history = cz.ColorHistory;

     setTimeout(function() { cz.Background.showWelcomePageIfNeeded(); }, 200);

     setTimeout(function() { cz.Background.injectScriptsIntoExistingTabs(); }, 20);

     cz.Background.initMainIconImageData();
    },

    injectScriptsIntoExistingTabs : function() {
         chrome.windows.getAll({'populate':true}, function(windows){
            windows.forEach(function(win) {
                win.tabs.forEach(function(tab) {
                    if (tab && tab.url && (tab.url.indexOf('http') == 0)) {
                        chrome.tabs.executeScript(tab.id, {file: '/js/global-shortcut.js'});
                    }
                });
            });
         });
    },

    readOption : function(key, defaultVal) {
        return (key in localStorage) ? localStorage[key] : defaultVal;
    },
    
    readOptions : function() {
        //console.log('reading options');
        cz.Background.options = {};

        cz.Background.options.autostartEyedropper = cz.Background.readOption('option-autostart-eyedropper', 'true') == 'true';
        if (!cz.ChromeUtils.platformSupportsNonForegroundHover()) cz.Background.options.autostartEyedropper = false; // TBD: check Linux


        cz.Background.options.outlineHovered = cz.Background.readOption('option-outline-hovered', 'true') == 'true';
        cz.Background.options.cursorCrosshair = cz.Background.readOption('option-cursor-crosshair', 'true') == 'true';
        cz.Background.options.showStatusPanel = true;

        cz.Background.options.autocopyToClipboard = cz.Background.readOption('option-autocopy-to-clipboard', 'true') == 'true';
        cz.Background.options.autocopyShowMessage = cz.Background.readOption('option-autocopy-show-message', 'true') == 'true';
        // rgb, rbg-perc, hsl, hex, hex-no-hash
        cz.Background.options.autocopyColorFormat = cz.Background.readOption('option-autocopy-color-format', 'hex');

        
        cz.Background.options.lowercaseHexa = cz.Background.readOption('option-lowercase-hexa', 'false') == 'true';
        cz.gbCZLowerCaseHexa = cz.Background.options.lowercaseHexa;

        cz.Background.options.keyboardShortCutsEnabled = cz.Background.readOption('option-keyboard-shortcuts-enabled', 'false') == 'true';
        cz.Background.options.keyboardShortCutsChar = cz.Background.readOption('option-keyboard-shortcuts-char', 'Z');

        cz.Background.options.debugModeOn = cz.Background.readOption('debug', 'false') == 'true';
    },

    showWelcomePageIfNeeded : function() {
        cz.ChromeUtils.getExtensionVersion(function(currVersion) {
            var prevVersion = localStorage['version']
            if (currVersion != prevVersion) {
                localStorage['version'] = currVersion;

                var pageType;
                if (typeof prevVersion == 'undefined') {
                    prevVersion = '-';
                    pageType = 'new';
                } else {
                    pageType = 'updated';
                }

                var appVersion = cz.ChromeUtils.getChromeVersion();
                var url = 'http://pages.colorzilla.com/chrome/welcome/' + pageType + '/' +
                       '?' +
                       'chrome' + '/' +
                       appVersion + '/' +
                       prevVersion + '/' +
                       currVersion;
                cz.ChromeUtils.openURLInNewTab(url);
            }
        });
    },

    setupListeners : function() {
         chrome.extension.onRequest.addListener(
          function(msg, sender, sendResponse) {
            switch (msg.op) {
                case 'already-injected-start-monitor':
                    cz.Background.sendStartMonitoringMessage();
                    break;

                case 'inject-and-start-monitor':
                    cz.Background.injectAndStartMonitoring();
                    break;

                case 'inject-and-analyze-page-colors':
                    cz.Background.injectAndAnalyzePageColors();
                    break;

                case 'options-changed':
                    cz.Background.readOptions();
                    break;

                case 'hotkey-pressed':
                    setTimeout(function() {
                        cz.Background.onHotKeyPressed(msg.keyCode);
                    }, 20);
                    break;
              }
          });

         chrome.extension.onConnect.addListener(function(port) {
          port.onMessage.addListener(function(msg) {
              switch (msg.op) {
                case 'sampling-color':
                    // don't update closely after sampling
                    if (!cz.Background.colorWasSampled) {
                        cz.Background.updateColor(msg);
                    } 
                    break;

                case 'color-sampled':
                    //console.log('color-sampled');
                    cz.Background.colorWasSampled = true;
                    setTimeout(function(){ cz.Background.colorWasSampled = false; }, 2000);
                    cz.Background.setActiveColor(msg);
                    if (cz.Background.options.autocopyToClipboard) {
                        cz.Background.copyColorToClipboard(msg.color, cz.Background.options.autocopyColorFormat);
                    }
                    
                    break;

                case 'take-screenshot':
                    cz.Background.takeScreenshot();
                    break;

                case 'page-colors-ready':
                    var popup = cz.Background.findPopupWindow();
                    if (popup) {                        
                        popup.colorAnalyzerUI.populatePageAnalyzerColors(msg.colors);
                    }
                    //console.log(msg.colors);
                    break;

                case 'stopped-monitoring':
                   if (!cz.Background.colorWasSampled) {
                        if (cz.Background.lastSampledColor) {
                            cz.Background.setActiveColor({color: cz.Background.lastSampledColor});
                        }
                   }
                  
                   break;

                case 'kill-popup':
                    debugTrace('kill-popup message received');
                    var popup = cz.Background.findPopupWindow();
                    if (popup) popup.close();
                    break;
              }
          });
        });

        chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
            cz.Background.stopMonitoring();
        });

        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if ((tab.url.indexOf('http') == 0) && (changeInfo.status == 'complete')) {
                chrome.tabs.executeScript(tabId, { file: "/js/global-shortcut.js"});
            }
        });
    },

    findPopupWindow : function() {
        var popup = chrome.extension.getViews({type: 'popup'});
        var popupObj = (popup && (popup.length > 0) && popup[0].ColorZilla && popup[0].ColorZilla.Popup) ? popup[0].ColorZilla.Popup : null;
        return popupObj;
    },

    onPopupClose : function() {
        setTimeout(function() {
            cz.Background.highlightElementsByColor(null);
        }, 100);
    },
 
    updateColor : function(data) {
        // only do stuff if popup still open, otherwise cancel monitoring
        var popupObj = cz.Background.findPopupWindow();
        //  console.log('popupObj - ' + popupObj );
        if (popupObj) {
            if (popupObj.mouseIsOverPopup && data.op && (data.op == 'sampling-color')) {
                // this is just a delayed refresh message from page
                // we can safely ignore it if user is interacting with popup
                // also, because we're over popup, cleanup the page

                setTimeout(function() {
                    cz.Background.clearMonitoringHighlights();
                },20);

                return;
            }
        } else {
           // moved to onPopupClose
        }

        cz.Background.setActiveColor(data, popupObj);
    },
    
    setActiveColor : function(data, popupObj) {
       var color = data.color;

       if ((typeof popupObj == 'undefined') || !popupObj) {
           // when re-sampling, we could get here directly
           // try to see if popup exists
           popupObj = cz.Background.findPopupWindow();
       }
       
       // supports both hex and rgb() formats
       if (color.substr(0,1) != '#') {
           color = cz.czColToRGBHexaAttribute(cz.czRGBAttributeToCol(color));
       }
       cz.Background.currentColor = color;
       cz.Background.setButtonColor(cz.Background.currentColor);
       if (data.op == 'color-sampled') {
           cz.Background.lastSampledColor = color;
           cz.Background.history.addColor(color);
       }

       if (popupObj) {
            popupObj.setActiveColorAndData(cz.Background.currentColor, data);
       }
    },

    initMainIconImageData : function() {
       var image = new Image();
       image.onload = function() {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            context.drawImage(image, 0, 0);
            var canvasData = context.getImageData(0, 0, 19, 19);
            var hsvData = [];
            for (var x = 0; x < canvasData.width; x++)  {
                for (var y = 0; y < canvasData.height; y++)  {
                    var idx = (x + y * canvasData.width) * 4;
                    var r = canvasData.data[idx + 0];
                    var g = canvasData.data[idx + 1];
                    var b = canvasData.data[idx + 2];
                    var a = canvasData.data[idx + 3];

                    if (a < 10) continue;
                    if ((r == g) && (g == b)) continue;

                    var hsv = cz.czRGBToHSV(r, g, b);
                    hsvData[idx] = hsv;
                }
            }
            cz.Background.mainIconImageData = canvasData;
            cz.Background.mainIconImageHSVData = hsvData;
       }
       image.src = chrome.extension.getURL('/images/main-icon-19.png');
    },

    changeMainIconHueSat : function(hue, sat, val) {
        var canvasData = cz.Background.mainIconImageData;
        for (var x = 0; x < canvasData.width; x++)  {
            for (var y = 0; y < canvasData.height; y++)  {
                var idx = (x + y * canvasData.width) * 4;
                var r = canvasData.data[idx + 0];
                var g = canvasData.data[idx + 1];
                var b = canvasData.data[idx + 2];
                var a = canvasData.data[idx + 3];
                var hsv = cz.Background.mainIconImageHSVData[idx];
                if (typeof hsv == 'undefined') continue;
               
                var newSat = ((sat < 25) || (val < 60)) ? 0 : hsv.s;
                var rgb = cz.czHSVToRGB(hue, newSat, hsv.v);
              
                canvasData.data[idx + 0] = rgb.r;
                canvasData.data[idx + 1] = rgb.g;
                canvasData.data[idx + 2] = rgb.b;
                canvasData.data[idx + 3] = a;
            }
        }
    },

    setButtonColor : function(color) {
        var colorRef = cz.czRGBHexaAttributeToCol(color);
        chrome.browserAction.setBadgeText({text: '\u00b7'});

        var r = cz.czGetRValue(colorRef);
        var g = cz.czGetGValue(colorRef);
        var b = cz.czGetBValue(colorRef);
        var hsv = cz.czRGBToHSV(r, g, b);

        chrome.browserAction.setBadgeBackgroundColor({color: [r, g, b, 255]});
        cz.Background.changeMainIconHueSat(hsv.h, hsv.s, hsv.v);
        chrome.browserAction.setIcon({imageData: cz.Background.mainIconImageData});
    },
    
    sendRequestToSelectedTab : function(req, callback) {
        chrome.tabs.getSelected(null, function(tab) {
               cz.Background.lastTabId = tab.id;
               chrome.tabs.sendRequest(tab.id, req, callback);
        });
    },

    sendRequestToSpecificTab : function(tabId, req, callback) {
        chrome.tabs.sendRequest(tabId, req, callback);
    },

    sendRequestToTab : function(tabId, req, callback) {
        if (typeof tabId != 'undefined') {
            cz.Background.sendRequestToSpecificTab(tabId, req, callback);
        } else {
            cz.Background.sendRequestToSelectedTab(req, callback);
        }
    },

    executePageScriptDependingOnIfInjected : function(scriptToExecuteWhenAlreadyInjected, scriptToExecuteWhenNotInjected) {
        chrome.tabs.executeScript(null, {code: 'if (typeof pageManager != "undefined") { '  + scriptToExecuteWhenAlreadyInjected +
                                              ' } else { ' + scriptToExecuteWhenNotInjected + ' } '});

    },

    analyzePageColors : function() {
        cz.Background.executePageScriptDependingOnIfInjected('pageManager.analyzePageColors()',
                                                            'chrome.extension.sendRequest({op:"inject-and-analyze-page-colors"})');
    },

    startMonitoring : function() {
        cz.Background.lastSampledColor = cz.Background.currentColor;
        cz.Background.executePageScriptDependingOnIfInjected('chrome.extension.sendRequest({op:"already-injected-start-monitor"})',
                                                            'chrome.extension.sendRequest({op:"inject-and-start-monitor"})');
    },

    stopMonitoring : function() {
        debugTrace('bg.stopMonitoring()')
        cz.Background.sendRequestToTab(cz.Background.lastTabId, {'op':'stop-monitoring'});
    },

    resampleLastLocation : function() {
        cz.Background.takeScreenshot(function() {         
                cz.Background.sendRequestToSelectedTab({'op':'resample-last-location'});     
        });
    },

    clearMonitoringHighlights : function() {
        cz.Background.sendRequestToTab(cz.Background.lastTabId, {'op':'clear-monitoring-highlights'});
    },

    highlightElementsByColor : function(colorRef) {
        cz.Background.sendRequestToTab(cz.Background.lastTabId, {'op':'highlight-elements-by-color', colorRef: colorRef});
    },

    injectAndPerformAction : function(callback) {
        debugTrace('injecting');
        chrome.tabs.executeScript(null, {file: 'lib/jquery-1.7.min.js'}, function() {
          chrome.tabs.executeScript(null, {file: 'js/content-script.js'}, function() {
            chrome.tabs.executeScript(null, {file: 'js/utils.js'}, function() {
                callback();
            });
          });
        });
    },

    injectAndStartMonitoring : function() {
        cz.Background.injectAndPerformAction(cz.Background.sendStartMonitoringMessage);
    },

    injectAndAnalyzePageColors : function() {
        cz.Background.injectAndPerformAction(function() {
            cz.Background.sendRequestToSelectedTab({op:'analyze-page-colors'});
        });
    },

    prepareMessagesForContentScript : function() {
        var messagesToSend = ['close_and_stop_picking', 'collapse_this_panel', 'expand_this_panel', 'color_copied_to_clipboard'];
        var messages = {};
        messagesToSend.forEach(function(name) {
           messages[name] = chrome.i18n.getMessage(name);
        });
        return messages;
    },

    sendStartMonitoringMessage : function(callback) {
        var messages = cz.Background.prepareMessagesForContentScript();
        cz.Background.sendRequestToSelectedTab({op:'start-monitoring', options: cz.Background.options, messages: messages }, callback);
    },

    takeScreenshot : function(callback) {
         chrome.tabs.captureVisibleTab(null,
                                       {format: 'png', quality: 100},
                                       function(data) {
                                           cz.Background.sendRequestToSelectedTab({op:'screenshot-ready', data: data});
                                           if (typeof callback != 'undefined') setTimeout(callback, 100);
                                       }
                                      );
    },

    onHotKeyPressed : function(keyCode) {
        if (!cz.Background.options.keyboardShortCutsEnabled) return;

        if (keyCode == cz.Background.options.keyboardShortCutsChar.charCodeAt(0)) {
            cz.Background.startMonitoring();
        }
    },

    copyColorToClipboard : function(color, colorFormat) {
       // supports both hex and rgb() formats
       var colorRef = (color.substr(0,1) == '#') ? cz.czRGBHexaAttributeToCol(color) : cz.czRGBAttributeToCol(color);
       var colorStr = cz.czColToSpecificColorFormat(colorRef, colorFormat);
       cz.Background.copyToClipboard(colorStr);
    },

    copyToClipboard : function(text) {
        var clipboardCopier = document.getElementById('clipboard-copier');
        if (!clipboardCopier) {
            clipboardCopier = document.createElement('textarea');
            clipboardCopier.id = 'clipboard-copier';
            document.body.appendChild(clipboardCopier);
        }

        clipboardCopier.value = text;
        clipboardCopier.select();
        document.execCommand("copy", false, null);
    },

    debugTrace : function(msg) {
        if (cz.Background.options.debugModeOn) {
           console.log(msg);
        }
    }
}

cz.ColorHistory = {
    _historyColors: [],
    _maxLength: 65,
    addColor : function(color) {
        // if the color already exists, remove it and re-add as first
        var foundAt;
        if ((foundAt = cz.ColorHistory._historyColors.indexOf(color)) != -1) {
            cz.ColorHistory._historyColors.splice(foundAt, 1);
        }
        
        cz.ColorHistory._historyColors.unshift(color);
        cz.ColorHistory._historyColors = cz.ColorHistory._historyColors.slice(0, cz.ColorHistory._maxLength-1);
        cz.ColorHistory.persist();
    },
    
    clear: function() {
        cz.ColorHistory._historyColors = [];
        cz.ColorHistory.persist();
    },

    get : function() {
        return cz.ColorHistory._historyColors;
    },

    persist : function() {
        localStorage['color-history'] = JSON.stringify(cz.ColorHistory._historyColors);
    },

    init : function() {
        if ('color-history' in localStorage) {
            cz.ColorHistory._historyColors = JSON.parse(localStorage['color-history']);
        }
    }

}

var debugTrace = cz.Background.debugTrace;
cz.ColorHistory.init();
cz.Background.init();

