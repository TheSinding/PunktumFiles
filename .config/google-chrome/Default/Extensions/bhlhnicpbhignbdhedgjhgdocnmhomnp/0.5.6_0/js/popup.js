//
// This file is part of ColorZilla
//
// Written by Alex Sirota (alex @ iosart.com)
//
// Copyright (c) iosart labs llc 2011, All Rights Reserved
//

if (typeof ColorZilla == "undefined" || !ColorZilla) {var ColorZilla = {}};

var cz = ColorZilla;
cz.Popup = {
    init : function() {
        var backgroundPage = chrome.extension.getBackgroundPage();
        cz.Popup.bg = backgroundPage.ColorZilla.Background;
        cz.gbCZLowerCaseHexa = cz.Popup.bg.options.lowercaseHexa;

        cz.Popup._sampledColor = cz.Popup.bg.currentColor;
        cz.Popup._currentColor = cz.Popup._sampledColor;

        if (cz.Popup._currentColor) {
            cz.Popup.setActiveColorAndData(cz.Popup._currentColor);
            cz.Popup.updateCopyToClipboardMenu();
        }

        cz.Popup.colorAnalyzerUI = cz.ColorAnalyzerUI;

        var options = {
            container: $('#webpage-color-analyzer-panel'),
            setColorCallback: cz.Popup.setSampledColor,
            highlightElementsByColorCallback: cz.Popup.bg.highlightElementsByColor,
            analyzePageColorsCallback: cz.Popup.bg.analyzePageColors,
            closeCallback: cz.Popup.onMainPanelClose
        };
        cz.Popup.colorAnalyzerUI.init(options);

        cz.Popup.bg.clearMonitoringHighlights();
        if (cz.Popup.bg.options.autostartEyedropper) {
             setTimeout(function() {cz.Popup.startMonitoring();}, 20);
        } else {
             cz.Popup.stopMonitoring();
        }

        cz.Popup.handleBlockedInjection();

        cz.Popup.attachEventHandlers();

        window.debugTrace = cz.Popup.bg.debugTrace;
    },

    translateUI : function() {
        var replace = cz.ChromeUtils.i18nReplace;

        replace('#eyedropper-menuitem .menu-item-text', 'pick_color_from_page');
        replace('#color-picker-menuitem .menu-item-text', 'color_picker');
        replace('#show-copy-to-clipboard-menuitem .menu-item-text', 'copy_to_clipboard_menu_label');
        replace('#resample-last-location-menuitem .menu-item-text', 'resample_last_location');
        replace('#show-history-menuitem .menu-item-text', 'picked_color_history');
        replace('#page-color-analyzer-menuitem .menu-item-text', 'webpage_color_analyzer');
        replace('#palette-browser-menuitem .menu-item-text', 'palette_browser');
        replace('#gradient-generator-menuitem .menu-item-text', 'css_gradient_generator');        
        replace('#help-menuitem .menu-item-text', 'help');        
        replace('#options-menuitem .menu-item-text', 'options');
        replace('#online-help-menuitem .menu-item-text', 'online_help');
        replace('#whats-new-menuitem .menu-item-text', 'whats_new');        
        replace('#colorzilla-homepage-menuitem .menu-item-text', 'colorzilla_homepage');
        replace('#about-colorzilla-menuitem .menu-item-text', 'about_colorzilla');

        replace('#webpage-color-analyzer-panel h1', 'css_color_analysis_results');


        replace('.ok-button', 'ok');
        replace('.cancel-button', 'cancel');
    },

    attachEventHandlers : function() {
        addEventListener("unload", function (event) {
            cz.Popup.bg.onPopupClose();
        }, true);

        
        document.addEventListener('click', function(e) {
                                            cz.Popup.handleClick(e);
                                            if ($(event.target).closest('#eyedropper-menuitem').length == 0) {
                                                cz.Popup.stopMonitoring();
                                            }
                                        }, true);

        cz.Popup.mouseIsOverPopup = false;

        $(document).bind('mouseenter mousemove', function() {
              // console.log('over');
              if (cz.Popup.mouseIsOverPopup) return;
              cz.Popup.mouseIsOverPopup = true;
              if (cz.Popup._sampledColor) cz.Popup.bg.updateColor({color: cz.Popup._sampledColor});
              cz.Popup.bg.clearMonitoringHighlights();
         });

         $(document).mouseleave(function() {
             //console.log('out');
             cz.Popup.mouseIsOverPopup = false;
         });
    },

    handleClick : function(e) {
        var target = $(e.target).closest('.menu-item');
        if (target.length == 0) return;

        if (target.hasClass('disabled')) return;

        var command = target.attr('id');
        if (!command) return;

        if (command.match(/^copy-(.*)-menuitem/)) {
            var colorFormat = RegExp.$1;
            cz.Popup.bg.copyColorToClipboard(cz.Popup._currentColor, colorFormat);
            window.close();
            return;
        }

        switch (command) {
            case 'color-picker-menuitem':
                cz.Popup.showColorPicker();
                break;

            case 'eyedropper-menuitem':
                setTimeout(function() {cz.Popup.startMonitoring();window.close();}, 100);
                break;

            case 'gradient-generator-menuitem':
                cz.ChromeUtils.openURLInNewTab('http://www.colorzilla.com/gradient-editor/');
                window.close();
                break;

            case 'page-color-analyzer-menuitem':
                $('#main-menu').hide();
                cz.ColorAnalyzerUI.showPageAnalyzerPanelAndAnalyze();
                break;

            case 'options-menuitem':
                cz.ChromeUtils.openURLInNewTab('/html/options.html');
                window.close();
                break;

            case 'help-menuitem':
                $('#main-menu').hide();
                $('#help-menu').show();

                break;

            case 'online-help-menuitem':
                cz.ChromeUtils.openURLInNewTab('http://www.colorzilla.com/chrome/help.html');
                window.close();
                break;

            case 'whats-new-menuitem':
                cz.ChromeUtils.openURLInNewTab('http://www.colorzilla.com/chrome/versions.html');
                window.close();
                break;

            case 'colorzilla-homepage-menuitem':
                cz.ChromeUtils.openURLInNewTab('http://www.colorzilla.com/chrome/');
                window.close();
                break;

            case 'about-colorzilla-menuitem':
                cz.ChromeUtils.openURLInNewTab('/html/about.html');
                window.close();
                break;

            case 'show-copy-to-clipboard-menuitem':
                $('#main-menu').hide();
                $('#copy-to-clipboard-menu').show();
                break;
                
            case 'resample-last-location-menuitem':
                cz.Popup.bg.resampleLastLocation();
                break;

            case 'show-history-menuitem':
                cz.Popup.showColorPicker();
                break;

            case 'palette-browser-menuitem':

                var options = {
                       container: $('#palette-browser-panel'),
                       setColorCallback: cz.Popup.setSampledColor,
                       closeCallback: cz.Popup.onMainPanelClose
                };

                $('#main-menu').hide();
                cz.PaletteBrowser.show(options);
                break;
        }
    },

    close: function() {
      window.close();
    },

    startMonitoring: function() {
         if (cz.Popup.dropperDisabled) return;
         cz.Popup.bg.startMonitoring();
         $('#eyedropper-menuitem .menu-item-text').text(chrome.i18n.getMessage('page_color_picker_active'));
         $('#eyedropper-menuitem').addClass('active');
    },

    stopMonitoring : function() {
        cz.Popup.bg.stopMonitoring();
        $('#eyedropper-menuitem .menu-item-text').text(chrome.i18n.getMessage('pick_color_from_page'));
        $('#eyedropper-menuitem').removeClass('active');
    },

    showColorPicker: function() {
        var options = {
                  container: $('#colorpicker'),
                  initialColor: cz.Popup._currentColor,
                  setColorCallback: cz.Popup.setSampledColor,
                  closeCallback: cz.Popup.onMainPanelClose,
                  history:  cz.Popup.bg.history,
                  lowercaseHexa: cz.Popup.bg.options.lowercaseHexa
                };
                
        $('#main-menu').hide();
        cz.ColorPickerUI.show(options);
    },

    onMainPanelClose: function() {
         $('#main-menu').show();
    },

    setSampledColor : function(color) {
        cz.Popup.bg.updateColor({color: color, op: 'color-sampled'});
    },

    setActiveColorAndData : function(color, data) {
        if (data && data.op && (data.op == 'sampling-color')) {
            return; // do not update the popup while sampling
        }
        cz.Popup._currentColor = color;

        var colorRef = cz.czRGBHexaAttributeToCol(color);
        var colorTooltip = cz.czColToRGBAttribute(colorRef) + '   |   ' + color + '   |   ' + cz.czColToHSLAttribute(colorRef);
        var currentColorElem = $('#color-picker-menuitem .current-color');
        currentColorElem.css('background-color', color).show();
        currentColorElem.attr('title', colorTooltip);

        if (data && data.op && (data.op == 'color-sampled')) {
            cz.Popup._sampledColor = color;
        }

        cz.Popup.updateCopyToClipboardMenu();
    },

     updateCopyToClipboardMenu : function() {
        var colorRef = cz.czRGBHexaAttributeToCol(cz.Popup._currentColor);
        function getLabel(colorStr) {return chrome.i18n.getMessage('copy_with_param', colorStr);}
        $('#copy-rgb-menuitem .menu-item-text').html(getLabel(cz.czColToRGBAttribute(colorRef))).parent().show();
        $('#copy-rgb-perc-menuitem .menu-item-text').html(getLabel(cz.czColToRGBPercentageAttribute(colorRef))).parent().show();
        $('#copy-hsl-menuitem .menu-item-text').html(getLabel(cz.czColToHSLAttribute(colorRef))).parent().show();
        $('#copy-hex-menuitem .menu-item-text').html(getLabel(cz.czColToRGBHexaAttribute(colorRef))).parent().show();
        $('#copy-hex-no-hash-menuitem .menu-item-text').html(getLabel(cz.czColToRGBHexaAttribute(colorRef).substring(1))).parent().show();

        $('.current-color-ops-separator').show();
        $('#show-copy-to-clipboard-menuitem').show();

        $('#resample-last-location-menuitem').show();
    },

     handleBlockedInjection : function() {
        cz.Popup.dropperDisabled = false;
        chrome.tabs.getSelected(null, function(tab) {
            var errorMsg = null;
            if (tab.url.indexOf('chrome') == 0) {
                errorMsg = chrome.i18n.getMessage('chrome_doesn_allow_picking_special_page');
            } else if ((tab.url.indexOf('https://chrome.google.com/extensions') == 0) ||
                       (tab.url.indexOf('https://chrome.google.com/webstore') == 0)) {
                 errorMsg = chrome.i18n.getMessage('chrome_doesn_allow_picking_webstore');
            } else if (tab.url.indexOf('file') == 0) {
                 errorMsg = chrome.i18n.getMessage('chrome_doesn_allow_picking_local');
            }

            if (errorMsg) {
                cz.Popup.dropperDisabled = true;
                
                cz.Popup.stopMonitoring();

                $('#main-menu').prepend('<div class="menu-item disabled" id="error-message-menuitem"><span class="menu-item-text">' + errorMsg + '</span></div>');

                $('#resample-last-location-menuitem').addClass('disabled');
                $('#eyedropper-menuitem').addClass('disabled');         
                $('#page-color-analyzer-menuitem').addClass('disabled'); 
            }
        });
     }
}

cz.ColorPickerUI = {
    show : function(options) {
        this._options = options;
        var color = options.initialColor;
        var colorPickerContainer = options.container;
        var setColorCallback = options.setColorCallback;
        var lowercaseHexa = options.lowercaseHexa;
        
        var me = this;

        me._container = colorPickerContainer;
        me._widget = colorPickerContainer.find('.colorpicker-widget');
        
        if (!color) color = '#ff0000';

        var activeColor = new $.jPicker.Color({hex: color});

        var rgbCSSColorElem = colorPickerContainer.find('.rgb-color');
        var hslCSSColorElem = colorPickerContainer.find('.hsl-color');
        updateCSSValues(color);

        colorPickerContainer.show();

        var history = this._options.history.get();
        var quickList = [];
        for (var i=0; i < history.length; i++) {
            quickList.push(new $.jPicker.Color({hex: history[i]}));
        }
        var nEmptySlots = 65-history.length;
        for (i=0; i < nEmptySlots; i++) {
            quickList.push(new $.jPicker.Color({hex: '#efefef'}));
        }

        var colorMode = ('last-color-picker-color-mode' in localStorage) ? localStorage['last-color-picker-color-mode'] : 'h';
        var settings =  {
                            window: {title: '&nbsp;'},
                            color: {active: activeColor, quickList: quickList, mode: colorMode},
                            images: {clientPath: '/lib/jPicker/images/'},
                            localization:{text:{ok:chrome.i18n.getMessage('ok'), 
                                                cancel:chrome.i18n.getMessage('Cancel'),
                                                newColor:chrome.i18n.getMessage('new_color_label'),
                                                currentColor:chrome.i18n.getMessage('current_color_label')}}
                        };

        function updateCSSValues(hex) {
            var colorRef = cz.czRGBHexaAttributeToCol(hex);
            rgbCSSColorElem.val(cz.czColToRGBAttribute(colorRef));
            hslCSSColorElem.val(cz.czColToHSLAttribute(colorRef));
        }

        function onCommit(color) {
            var colorMode = $('.jPicker input[type="radio"]:checked').val();
            if (colorMode) {
                localStorage['last-color-picker-color-mode'] = colorMode;
            }
            var newColor = '#' + color.val('hex');
            if (!lowercaseHexa) newColor = newColor.toUpperCase();
            setColorCallback(newColor);
            me.hide();
        }
        function onLive(color) {
            var hex = '#' + color.val('hex');
            updateCSSValues(hex);
        }
        function onCancel(color) {
            me.hide();
        }
        me._widget.jPicker(settings, onCommit, onLive, onCancel);

        setTimeout(function() {me.adjustColorPickerUI()}, 1);
    },

    hide : function() {
        this._container.hide();
        this._options.closeCallback();
    },

    adjustColorPickerUI : function() {
        var me = this;

        // to enable pasting #123456
        $('.jPicker input.Hex').attr('maxlength', '7');

        var quickColorElem = me._widget.find('.Grid .QuickColor');
        quickColorElem.slice(-7).remove();

        var clearHistoryButton = $('<span class="QuickColor" title="'+ chrome.i18n.getMessage('clear_history') +'" style="background-color:#efefef;background-image: url(/lib/jPicker/images/NoColor.png)">&nbsp</span>');
        var gridElem = me._widget.find('.Grid');
        clearHistoryButton.appendTo(gridElem);
        clearHistoryButton.click(function() {
            var ans;
            if (!cz.ChromeUtils.platformIs('mac')) {
                ans = confirm(chrome.i18n.getMessage('clear_history_question'));
            } else {
                ans = true; // on a mac there's a BUG - 'confirm' flashes, disappears and blocks the whole popup UI
            }
            if (ans) {
                me._widget.find('.QuickColor').slice(0, -1).remove();
                var html = [];
                for (var i=0; i<65; i++) {
                    html.push('<span class="QuickColor" title="" style="background-color:#efefef;cursor:default">&nbsp;</span>');
                }
                var quickColorElem = me._widget.find('.Grid .QuickColor');
                $(html.join('')).insertBefore(quickColorElem);

                me._options.history.clear();
            }
        });
        var hrElem = me._widget.find('hr');
        $('<div class="history-header">'+ chrome.i18n.getMessage('color_history_label') +'</div>').insertAfter(hrElem);
    }
};

cz.ColorAnalyzerUI = {
    _isInited: false,
    _myPanel : null,
    _colors : null,
    
    init: function(options) {
        if (this._isInited) return;
        
        var me = this;

        this._options = options;
        
        this._myPanel = options.container;
        this._myPanel.find('.ok-button').click(function() {
            if (me.activeColor) {
                me._options.setColorCallback(me.activeColor);
            }
            me._options.highlightElementsByColorCallback(null);
            me.hidePageAnalyzerPanel();
            me._options.closeCallback();
        });

        this._myPanel.find('.cancel-button').click(function() {
            me._options.highlightElementsByColorCallback(null);
            me.hidePageAnalyzerPanel();
             me._options.closeCallback();
        });
        
        var selectedColorInfoPanel = this._myPanel.find('.selected-color-info');
        me.rgbColorElem = selectedColorInfoPanel.find('.rgb-color');
        me.hexColorElem = selectedColorInfoPanel.find('.hex-color');
        me.elemInfoElem = selectedColorInfoPanel.find('.elem-info');

        me.colorsContainer = this._myPanel.find('.colors-container');
        me.colorsContainer.click(function(e) {
           me.setActiveColor(e.target, true);
        });

        this._isInited = true;
    },

    setActiveColor : function(elem, onclick) {
            var me = this;

            me._myPanel.removeClass('initial-state');

            var target = elem;
            if (!$(target).hasClass('color-panel')) return;
            if (onclick) {
                if (typeof  me.activeColorElem != 'undefined') {
                    me.activeColorElem.removeClass('active');                 
                }
                $(target).addClass('active');
                me.activeColorElem = $(target);
            }
            var color = $(target).attr('cz-color');
            var colorRef = cz.czRGBAttributeToCol(color);

            var rgbColor = cz.czColToRGBAttribute(colorRef);
            var hexColor = cz.czColToRGBHexaAttribute(colorRef);
            if (onclick) me.activeColor = hexColor;

            me.rgbColorElem.val(rgbColor);
            me.hexColorElem.val(hexColor);

            var html = [];

            for (var i=0; (i < me._colors[color].computed.length) && (i < 15); i++) {
                 var entry = me._colors[color].computed[i];
                 html.push('<span class="color-selector">' + entry.elemLongName + '</span>');
            }

            me.elemInfoElem.html(html.join(' '));

            me._options.highlightElementsByColorCallback(null);
            me._options.highlightElementsByColorCallback(colorRef);
    },

    showPageAnalyzerPanelAndAnalyze : function() {
        this._myPanel.show();
        this._myPanel.addClass('initial-state');

        this.colorsContainer.html('<span class="please-wait">'+ chrome.i18n.getMessage('analyzing_please_wait') +'</span>');
        this._options.analyzePageColorsCallback();
    },

    hidePageAnalyzerPanel : function() {
        this._myPanel.hide();
    },

    populatePageAnalyzerColors : function(colors) {
       this._colors = colors;
       
       var colorVals = [];
       for (color in colors) {
           colorVals.push(color);
       }
        
       colorVals.sort(this.sortByHue);
       var container = this.colorsContainer;
       container.html('');
       for (var i=0; i<colorVals.length; i++) {
            var color = colorVals[i];
            var tooltip = color;
            $('<div class="color-panel" cz-color="'+ color + '" style="background:' + color + '" title="' + tooltip + '">&nbsp;</div>"').appendTo(container);
       }
    },

    sortByHue : function(b,a) {
        a = cz.czRGBAttributeToCol(a);
        b = cz.czRGBAttributeToCol(b);

        var rA = cz.czGetRValue(a);
        var gA = cz.czGetGValue(a);
        var bA = cz.czGetBValue(a);
        var rB = cz.czGetRValue(b);
        var gB = cz.czGetGValue(b);
        var bB = cz.czGetBValue(b);

        var hsvA = cz.czRGBToHSV(rA, gA, bA);
        var hsvB = cz.czRGBToHSV(rB, gB, bB);

        var aIsGray = ((rA == gA) && (gA == bA)) || (hsvA.s < 3);
        var bIsGray = ((rB == gB) && (gB == bB)) || (hsvB.s < 3);

        if (aIsGray && bIsGray) {
            return hsvB.v - hsvA.v;
        }

        if ((hsvA.h != hsvB.h) && !aIsGray && !bIsGray) {
            return hsvA.h - hsvB.h;
        } else if (hsvA.s != hsvB.s) {
            return hsvA.s - hsvB.s;
        } else {
            return hsvA.v - hsvB.v;
        }
    } 
}

cz.PaletteBrowser = {
    _inited : false,

    init : function(options, callback) {
        if (this._inited) {
            callback();
            return;
        }

        var me = this;
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("get", "/js/palette-db.json", true);
        xmlhttp.onreadystatechange = function (e) {
            if (xmlhttp.readyState == 4) {
                ColorZilla.PaletteDB = JSON.parse(xmlhttp.responseText).palettes;
                me.initDelayed(options);
                callback();
            }
        };
        xmlhttp.send({});
   
        this._inited = true;
    },
    
    initDelayed : function(options) {
        this._options = options;
        var container = options.container;
        this._container = container;

        var chooserElem = container.find('.palette-chooser');
        this.populatePaletteChooser(chooserElem);

        var me = this;
        chooserElem.change(function() {
            var newPaletteKey = chooserElem.val();
            me.showPalette(newPaletteKey);
            localStorage['last-displayed-palette'] = newPaletteKey;
        });

        var paletteColorsContainer = this._container.find('.palette-colors');
        paletteColorsContainer.click(function(e) {
            var target = $(e.target);
            if (target.hasClass('color-panel')) {
                if (me._currentColorPanel) {
                    me._currentColorPanel.removeClass('active');
                }
                target.addClass('active');
                var color = target.attr('cz-color');
                var name = target.attr('cz-color-name');
                me.setCurrentColor(color, name);
                me._currentColorPanel = target;
            }
        });

        this._container.find('.ok-button').click(function() {
            if (me._currentColor) {
                me._options.setColorCallback(me._currentColor);
            }
            me.hide();
            me._options.closeCallback();
        });

        this._container.find('.cancel-button').click(function() {
            me.hide();
            me._options.closeCallback();
        });
    },

    setCurrentColor: function(color, name) {
       this._currentColor = color;
       if (color) {
           var colorRef = cz.czRGBHexaAttributeToCol(color);
           this._container.find('.current-color').css('background-color', color);
           var r = cz.czGetRValue(colorRef);
           var g = cz.czGetGValue(colorRef);
           var b = cz.czGetBValue(colorRef);
           this._container.find('.color-r').val(r);
           this._container.find('.color-g').val(g);
           this._container.find('.color-b').val(b);

           this._container.find('.color-hex').val(cz.czColToRGBHexaAttribute(colorRef));
           if ((typeof name == 'undefined') || !name) name = '';
           this._container.find('.color-name').val(name);
       } else {
           this._container.find('.current-color').css('background-color', '#fff');
           this._container.find('.color-r').val('');
           this._container.find('.color-g').val('');
           this._container.find('.color-b').val('');
           this._container.find('.color-hex').val('');
           this._container.find('.color-name').val('');
       }
    },

    populatePaletteChooser : function(chooserElem) {
        me = this;
        cz.PaletteDB.forEach(function(palette) {
           var key = me.calcPaletteKey(palette.name);
           var localizedName = chrome.i18n.getMessage('palette_name_' + key)
           $('<option value="'+ key +'">' + localizedName + '</option>').appendTo(chooserElem);
        });
    },

    calcPaletteKey : function(paletteName) {
        var paletteKey = paletteName.toLowerCase();
        paletteKey = paletteKey.replace(/[ \t]/g, '');
        return paletteKey;
    },

    show : function(options) {
        var me = this;
        this.init(options, function() {
            me._currentColorPanel = null;
            me.setCurrentColor(null);

            var chooserElem = me._container.find('.palette-chooser');
            var initialPalette = ('last-displayed-palette' in localStorage) ? localStorage['last-displayed-palette'] : chooserElem.val();
            me.showPalette(initialPalette);
            chooserElem.val(initialPalette);

            me._container.show();
        });
    },

    hide : function() {
       this._container.hide();
    },

    showPalette : function(nameKey) {
       var foundPalette = null;
       
       for (var i=0; i < cz.PaletteDB.length; i++) {
           var palette = cz.PaletteDB[i];
           var key = me.calcPaletteKey(palette.name);
           if (nameKey == key) {
                foundPalette = palette;
                break;
           }
       }
       if (!foundPalette) return;

       var paletteColorsContainer = this._container.find('.palette-colors');
       paletteColorsContainer.empty();
       // we need the panel to have a chance to empty to remove scrollbars as needed

       setTimeout(function() {
           var containerWidth = 260;
           var containerHeight = 260;
           var height = 15;
           var nRows = Math.floor(foundPalette.colors.length / foundPalette.nColumns);
           if ((nRows * height) > (containerHeight + 25)) containerWidth -= 18; // vertical scrollbar present
           var width = Math.floor(containerWidth / foundPalette.nColumns);

           for (var i=0; i < foundPalette.colors.length; i++) {
               var colorValue = foundPalette.colors[i].value;
               var colorName = (foundPalette.colors[i].name) ? foundPalette.colors[i].name : '';
               var tooltip = colorValue;
               if (colorName) tooltip += ' - ' + colorName;
               $('<div class="color-panel" cz-color="' + colorValue + '" cz-color-name="' + colorName + '" title="'+ tooltip +'" style="width:' + width + 'px;height:' + height + 'px;background:' + colorValue + ';"></div>').appendTo(paletteColorsContainer);
           }
       }, 10);
    }
}

window.addEventListener("load", function() { ColorZilla.Popup.init() }, false);
document.addEventListener("DOMContentLoaded", function() { ColorZilla.Popup.translateUI() }, false);