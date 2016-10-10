//
// This file is part of ColorZilla
//
// Written by Alex Sirota (alex @ iosart.com)
//
// Copyright (c) iosart labs llc 2011, All Rights Reserved
//

if (typeof ColorZilla == 'undefined') {

var ColorZilla = {};
var cz = ColorZilla;

ColorZilla.PageManager = function() {};

ColorZilla.PageManager.prototype = {
    init : function() {
         this.setupMessageListener();
         this.isMonitoring = false;

         this.canvas = null;
         this.imageData = null;

         this.current = {
             x: null,
             y: null,
             elem: null,
             color: null
         };

         this.sampled = {
            x: null,
            y: null,
            elem: null,
            color: null
         };

         this.zoomRatio = 1;

         var me = this;

         this.port = chrome.extension.connect();

         this.killed = false;
         this.port.onDisconnect.addListener(function() {
              me.killed = true;
              me.stopMonitoring();
         });
    },

    startMonitoring : function() {
      if (this.isMonitoring) return;
      this.isMonitoring = true;

      if ($('head').length == 0) $('html').prepend(document.createElement('head'));
    
      this.current.x = null;
      this.current.y = null;
      
      this.onMouseMoveHandler = jQuery.proxy(this, 'onMouseMove');
      this.onMouseDownHandler = jQuery.proxy(this, 'onMouseDown');
      this.onClickHandler = jQuery.proxy(this, 'onClick');
      this.onKeyUpHandler = jQuery.proxy(this, 'onKeyUp');
      this.onContextMenuHandler = jQuery.proxy(this, 'onContextMenu')

      var body = document.getElementsByTagName('body')[0];

      body.addEventListener('mousemove', this.onMouseMoveHandler, true);
      body.addEventListener('click', this.onClickHandler, true);
      body.addEventListener('mousedown', this.onMouseDownHandler, true);

      document.addEventListener("contextmenu", this.onContextMenuHandler, false);


      window.addEventListener('keyup', this.onKeyUpHandler, true);
   
   
      var doc = $(document);
      doc.bind('scroll', jQuery.proxy(this, 'onScroll'));
      doc.bind('resize', jQuery.proxy(this, 'onResize'));
      $(window).bind('resize', jQuery.proxy(this, 'onResize'));

      this.setCursor(this.options.cursorCrosshair ? 'crosshair' : 'default');
      if (this.options.showStatusPanel) {
          cz.StatusPanel.create(this.messages);
      }

      this.setZoomRatio();
      this.takeScreenshot();

      var me = this;
      setTimeout(function() {me.setupOverlays();}, 20);

      this.killPopupTimer = 0;
    },

    stopMonitoring : function(showAutoCopyMessage) {
      if (!this.isMonitoring) return;
      this.isMonitoring = false;

      if (typeof showAutoCopyMessage == 'undefined') showAutoCopyMessage = false;

      if (this.options.showStatusPanel) {
          if (!showAutoCopyMessage) {
              cz.StatusPanel.destroy();
          } else {
              var colorRef = cz.czRGBAttributeToCol(this.sampled.color);
              var colorFormat = this.options.autocopyColorFormat;
              var copiedColor = cz.czColToSpecificColorFormat(colorRef, colorFormat);
              cz.StatusPanel.showCopiedToClipboardMessage(copiedColor);
          }
      }

      var body = document.getElementsByTagName('body')[0];
      body.removeEventListener('mousemove', this.onMouseMoveHandler, true);
      body.removeEventListener('click', this.onClickHandler, true);
      body.removeEventListener('mousedown', this.onMouseDownHandler, true);
      document.removeEventListener("contextmenu", this.onContextMenuHandler, false);

      window.removeEventListener('keyup', this.onKeyUpHandler, true);
     
      var doc = $(document);
      doc.unbind("scroll", jQuery.proxy(this, 'onScroll'));
      doc.unbind('resize', jQuery.proxy(this, 'onResize'));
      $(window).unbind('resize', jQuery.proxy(this, 'onResize'));
    
      this.setCursor('normal');
      
      this.clearCurrentOutline();
      
      var me = this;
      setTimeout(function() {me.killOverlays();}, 20);

      setTimeout(function() {me.sendMessage({op: 'stopped-monitoring'})}, 20);
    },

    resampleLastLocation : function() {
       if (!this.sampled.x || !this.sampled.y) return;
       var color = this.getPageColor(this.sampled.x, this.sampled.y);
       if (!color) return;
       var colorStr = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
       var elemLongName = this.sampled.elem ? this.getOriginalElemLongName(this.sampled.elem) : '';
       this.sampled.color = colorStr;
       this.sendMessage({op: 'color-sampled', color: colorStr, elemLongName: elemLongName});
    },

    takeScreenshot : function() {
      var doc = $(document);
      this.scrollTop = doc.scrollTop();
      this.scrollLeft = doc.scrollLeft();
      this.sendMessage({op:'take-screenshot'});
      //console.log('taking screenshot')
    },

    takeScreenshotDelayed : function() {
        if (typeof this.takeScreenshotTimer != 'undefined') clearTimeout(this.takeScreenshotTimer);

        var me = this;
        this.takeScreenshotTimer = setTimeout(function() {me.takeScreenshot();}, 200);
    },

    setupMessageListener : function() {
        var me = this;
        chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
           if (me.killed) return;
           switch (req.op) {
               case 'screenshot-ready':
                   //console.log(req.data.length);
                   me.initScreenshotData(req.data);
                   if (me.current.x && me.current.y) {
                        setTimeout(function() {
                            me.current.color = me.readColorAndSend(me.current.x, me.current.y, true);
                        }, 20);
                   }
                   break;
               case 'start-monitoring':
                   me.options = req.options;
                   me.messages = req.messages;
                   me.startMonitoring();
                   break;
               case 'stop-monitoring':
                   me.stopMonitoring();
                   break;
               case 'resample-last-location':
                   me.resampleLastLocation();
                   break;

               case 'clear-monitoring-highlights':
                   me.clearCurrentOutline();
                   cz.StatusPanel.hide();
                   clearTimeout(me.takeScreenshotTimer);
                   clearTimeout(me.killPopupTimer);
                   me.killPopupTimer = 0;
                   break;

               case 'analyze-page-colors':
                   me.analyzePageColors();
                   break;

               case 'highlight-elements-by-color':
                   if (req.colorRef) {
                       ColorZilla.PageColorAnalyzer.highlightElementsByColor(req.colorRef);
                   } else {
                       ColorZilla.PageColorAnalyzer.removeHightlightElementsByColor();
                   }
                   break;
           }
        });
    },

    analyzePageColors : function() {
         var me = this;
         var pageColors = ColorZilla.PageColorAnalyzer.getPageColors();
         setTimeout(function() {
             me.sendMessage({op: 'page-colors-ready', colors: pageColors});
         }, 10);
    },
    
    initScreenshotData : function(data) {
        var me = this;
        var image = document.createElement('img');
        image.onload = function() {
             var canvas = document.createElement('canvas');
             canvas.width = image.width;
             canvas.height = image.height;
             var context = canvas.getContext('2d');
             context.drawImage(image, 0, 0);

             me.canvas = canvas;
             me.context = context;
             me.imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        }
        image.src = data;
    },

    setupOverlays : function() {
       var me = this;
       $('iframe:visible, embed:visible').each(function() {
            var currentElem = $(this);
            var width = currentElem.width();
            var height = currentElem.height();
            var offset = currentElem.offset();
           
            var elemLongName = ColorZilla.Utils.getElementLongName(this);

            if (this.tagName.toLowerCase() == 'embed') {
                var wmode = currentElem.attr('wmode');
                if (!wmode || (wmode == 'window')) {
                   var newNode = currentElem.clone(true, true);
                   newNode.attr('wmode', 'opaque');
                   currentElem.replaceWith(newNode);
                }
            }
            
            $('<div class="colorzilla-elem-overlay" cz-long-name="' + elemLongName + '" style="position:absolute; background:none; opacity: 1; z-index:2147483647; left:' + offset.left + 'px; top:' + offset.top + 'px; width: ' + width + 'px; height: ' + height + 'px;"></div>').appendTo('body');
        });
    },

    killOverlays : function() {
       $('.colorzilla-elem-overlay').remove();
    },

    setZoomRatio : function() {
        if (window.top && window.top.outerWidth && window.top.innerWidth) {
            var n = window.top.outerWidth / window.top.innerWidth; 
            var zoom = Math.round(n * 100) / 100;
            this.zoomRatio = zoom;
        }
    },

    getDevicePixelRatio : function() {
        var context = this.context;
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                            context.mozBackingStorePixelRatio ||
                            context.msBackingStorePixelRatio ||
                            context.oBackingStorePixelRatio ||
                            context.backingStorePixelRatio || 1;

        return devicePixelRatio / backingStoreRatio;
    },

    getPageColor : function(pageX, pageY) {
        var imageX = pageX - this.scrollLeft;
        var imageY = pageY - this.scrollTop;

        if (this.zoomRatio != 1) {
            imageX = Math.round(this.zoomRatio*imageX);
            imageY = Math.round(this.zoomRatio*imageY);
        }

        var devicePixelRatio = this.getDevicePixelRatio();
        if (devicePixelRatio != 1) {
            imageX = Math.round(devicePixelRatio*imageX);
            imageY = Math.round(devicePixelRatio*imageY);
        }

        if (this.imageData == null) return null;

        var imageDataIndex = (imageX + imageY * this.canvas.width) * 4;
        var color = {r: this.imageData[imageDataIndex],
                      g: this.imageData[imageDataIndex+1],
                      b: this.imageData[imageDataIndex+2],
                      alpha: this.imageData[imageDataIndex+3]
                    };
        return color;
    },

    readColorAndSend : function(pageX, pageY, delayedRefresh) {
        var color = this.getPageColor(pageX, pageY);
        if (!color) return;
        var colorStr = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
        var elemLongName = this.current.elem ? this.getOriginalElemLongName(this.current.elem) : '';
        var elemDimensions = this.current.elem ? this.getElemDimensions(this.current.elem) : null;
        var data = {op: 'sampling-color', color: colorStr, elemLongName: elemLongName, elemDimensions: elemDimensions, delayedRefresh: delayedRefresh};
        this.sendMessage(data);

        if (this.options.showStatusPanel && this.isMonitoring) {
            cz.StatusPanel.update(data);
        }
        return colorStr;
    },

    setCursor : function(type) {
      var id = 'colorzilla-cursor-override';
      var styleElem = document.getElementById(id);
      if ((type != 'normal') && !styleElem) {
          var style = document.createElement('style');
          style.innerHTML = '* { cursor: ' + type + ' !important; }';
          style.id = id;
          var head = document.getElementsByTagName('head')[0];
          head.appendChild(style);
      } else {
          // remove
          if (styleElem) {
              styleElem.parentNode.removeChild(styleElem);
          }
      }
    },

    sendMessage: function(msg) {
        this.port.postMessage(msg);
    },

    clearCurrentOutline: function() {
        if (this.current.elem) {
              var elem = $(this.current.elem);
              if (elem.hasClass('cz-current-elem')) {
                  elem.removeClass('cz-current-elem');
                  if (elem.attr('cz-backup-style')) {
                        elem.attr('style', elem.attr('cz-backup-style'));
                        elem.removeAttr('cz-backup-style');
                  } else {
                        elem.removeAttr('style');
                  }
              }
        }
    },

    outlineElem: function(elem) {
         this.clearCurrentOutline();
         var newStyle = '';
         if (this.options.outlineHovered) newStyle += 'outline: 1px dotted red ! important;';
         var cursor = this.options.cursorCrosshair ? 'crosshair' : 'default';
         newStyle += 'cursor: ' + cursor + ' !important;';
         
         var elem = $(elem);

         var currentStyle = elem.attr('style');
         if (currentStyle) {
             elem.attr('cz-backup-style', currentStyle);
             newStyle = currentStyle + '; ' + newStyle;
         }
         elem.attr('style', newStyle);
         elem.addClass('cz-current-elem')
    },
    
    getOriginalElemLongName : function(elem) {
        var elem = $(elem);
        if (elem.hasClass('colorzilla-elem-overlay')) {
            return elem.attr('cz-long-name');
        } else {
            return ColorZilla.Utils.getElementLongName(elem);
        }
    },

    getElemDimensions: function(elem) {
         var elem = $(elem);
         return elem.width() + 'x' + elem.height();
    },

    eventIsOnStatusPanel : function(e) {
        return ($(e.target).closest('#colorzilla-status-panel').length > 0);
    },

    onMouseMove: function(e) {
      if (!this.isMonitoring) return;

      if (this.eventIsOnStatusPanel(e)) return;

      // don't trigger sampling in the crack betweeen popup and toolbar
      if (e.clientY < 7) return;
      
      //console.log(e.pageX + ' - ' + e.pageY);

      if (!this.killPopupTimer) {
          var me = this;
          this.killPopupTimer = setTimeout(function() {
               me.sendMessage({op:'kill-popup'});
          }, 1000);
      }
      this.current.color = this.readColorAndSend(e.pageX, e.pageY);

      this.current.x = e.pageX;
      this.current.y = e.pageY;
      
      this.outlineElem(e.target);
      
      this.current.elem = e.target;

      this.takeScreenshotDelayed();
    },

    onScroll : function(e) {
      //console.log('scroll');
      this.setZoomRatio();
      this.takeScreenshotDelayed();
    },

    onResize : function(e) {
      //console.log('resize');
      this.setZoomRatio();
      this.takeScreenshotDelayed();
    },

    onMouseDown: function(e) {
      if (!this.isMonitoring) return;
      if (this.eventIsOnStatusPanel(e)) return;

      e.preventDefault();
      e.stopPropagation();

      // only left click samples
      if (e.which == 1) {
          var elemLongName = this.getOriginalElemLongName(e.target);
          this.sendMessage({op: 'color-sampled', color: this.current.color, elemLongName: elemLongName});
          this.sampled.x = this.current.x;
          this.sampled.y = this.current.y;
          this.sampled.elem = this.current.elem;
          this.sampled.color = this.current.color;
      }
    },

    onClick: function(e) {
      if (!this.isMonitoring) return;
      if (this.eventIsOnStatusPanel(e)) return;
      e.preventDefault();
      e.stopPropagation();

      var showAutoCopyMessage = (this.options.autocopyToClipboard && this.options.autocopyShowMessage);
      this.stopMonitoring(showAutoCopyMessage);
    },

    onKeyUp: function(e) {
        if (!this.isMonitoring) return;
        if (e.keyCode == 27) this.stopMonitoring();
    },

    onContextMenu : function(e) {
        if (!this.isMonitoring) return;
        e.preventDefault();
        e.stopPropagation();
        this.stopMonitoring();
    }
}

ColorZilla.StatusPanel = {
    create : function(messages) {
        this.messages = messages;
        $('<div id="colorzilla-status-panel" style="display:none"><div title="'+ messages['close_and_stop_picking'] +'" class="colorzilla-close-button"></div><div title="'+ messages['collapse_this_panel'] +'" class="colorzilla-collapse-button"></div><div class="colorzilla-current-color"></div><div class="colorzilla-current-status"></div></div>').appendTo('body');

        this.currentStatusColorElem = $('#colorzilla-status-panel .colorzilla-current-color');
        this.currentStatusTextElem = $('#colorzilla-status-panel .colorzilla-current-status');

        $('#colorzilla-status-panel .colorzilla-close-button').click(function() {
            pageManager.stopMonitoring();
        });

        var me = this;
        $('#colorzilla-status-panel .colorzilla-collapse-button').click(function() {
            if ($('#colorzilla-status-panel').hasClass('colorzilla-collapsed')) {
                $(this).attr('title', messages['collapse_this_panel']);
                me.expand();
            } else {
                $(this).attr('title', messages['expand_this_panel']);
                me.collapse();
            }
        });

        $('#colorzilla-status-panel').mouseenter(function() {
               pageManager.clearCurrentOutline();
        });

    	$('<link rel="stylesheet" type="text/css" id="colorzilla-status-bar-panel-style" href="' + chrome.extension.getURL('/css/content-style.css') + '">').appendTo('head');
    },

    destroy : function() {
        $('#colorzilla-status-panel').remove();
        $('#colorzilla-status-bar-panel-style').remove();
    },

    show : function() {
        $('#colorzilla-status-panel').show();
    },

    hide : function() {
         $('#colorzilla-status-panel').hide();
    },

    collapse : function() {
        $('#colorzilla-status-panel').addClass('colorzilla-collapsed');
    },

    expand : function() {
        $('#colorzilla-status-panel').removeClass('colorzilla-collapsed');
    },

    update : function(data) {
        this.show();

        var color = data.color;

        this.currentStatusColorElem.css('background-color', color);

        var colorRef = cz.czRGBAttributeToCol(color);
        var r = cz.czGetRValue(colorRef);
        var g = cz.czGetGValue(colorRef);
        var b = cz.czGetBValue(colorRef);
        //var rgbTxt = "R: " + r + ", G: " + g + ", B: " + b;
        var rgbTxt = cz.czColToRGBAttribute(colorRef);
        var hexTxt = cz.czColToRGBHexaAttribute(colorRef);
       
        rgbTxt = rgbTxt.replace(/(\d+)/g, '<span class="colorzilla-value">$1</span>');
         
        var statusTxt = '<span class="colorzilla-panel colorzilla-rgb-color colorzilla-property">' + rgbTxt + '</span>';
        statusTxt += '<span class="colorzilla-sep">|</span><span class="colorzilla-panel colorzilla-hex-color colorzilla-value">' + hexTxt + '</span>';

        if (typeof data != 'undefined') {
            if  (('elemDimensions' in data) && data.elemDimensions) {
                var dimensions = data.elemDimensions;
                dimensions = dimensions.replace(/(\d+)/g, '<span class="colorzilla-value">$1</span>');
                statusTxt += '<span class="colorzilla-sep">|</span><span class="colorzilla-dimensions colorzilla-panel colorzilla-property">' + dimensions + '</span>';
            }
            if  (('elemLongName' in data) && data.elemLongName) {
                var elemLongName = data.elemLongName;
                elemLongName = elemLongName.replace(/([#\.])(.+)/, '<span class="colorzilla-class-id">$1$2</span>');
                statusTxt += '<span class="colorzilla-sep">|</span><span class="colorzilla-elem-long-name colorzilla-panel">' + elemLongName + '</span>';
            }
        }

        this.setStatusTextHTML(statusTxt);
    },

    setStatusTextHTML : function(html) {
        this.currentStatusTextElem.html(html);
    },

    showCopiedToClipboardMessage : function(copiedColor) {
       var message = this.messages['color_copied_to_clipboard'];
       message += '<span class="colorzilla-sep">|</span><span class="colorzilla-property">' + copiedColor + '</span>';
       var statusTxt = '<span class="colorzilla-copied-message">' + message + '</span>';
       this.setStatusTextHTML(statusTxt);

       var me = this;
       setTimeout(function() {me.destroy();}, 2000);
    }
}

ColorZilla.PageColorAnalyzer = {
    cssProperties : ['color',
                     'background-color',
                     'border-top-color',
                     'border-bottom-color',
                     'border-left-color',
                     'border-right-color',
                     'outline-top-color',
                     'outline-bottom-color',
                     'outline-left-color',
                     'outline-right-color'],

    compactProps : function(prefix, props) {
        var sides = ['top', 'right', 'bottom', 'left'];
        var allSame = true;
        jQuery.each(sides, function(index, val) {
                if (props[prefix + '-' + val + '-color'] !=
                    props[prefix + '-top-color']) allSame = false;

        });
        if (allSame) {
            if (props[prefix + '-top-color']) {
                props[prefix + '-color'] = props[prefix + '-top-color'];
            }
            jQuery.each(sides, function(index, val) {delete props[prefix + '-' + val + '-color'];});
        }
    },

    rgbaToRGB : function(color) {
        if (color.indexOf('rgba') != -1) {
            var firstParen = color.split("(");
	        color = firstParen[1];
	        var secondParen = color.split(")");
	        color = secondParen[0];
	        var rgbArr = color.split(",");
            if (rgbArr[3] == 0) return null;
	        color = 'rgb(' + rgbArr[0] + ',' + rgbArr[1] + ',' + rgbArr[2] + ')';
        }
        return color;
    },

    normalizeColor : function(color) {
        if (!color || !color.match(/rgb/)) return null;
        color = color.replace(/ /g, '');
        return this.rgbaToRGB(color);
    },

    removeWhiteSpace : function(str) {return str.replace(/ /g, '');},

    extractColorsFromCSSStyle : function(style) {
        var me = this;
        var colors = [];
        var props = {};
        jQuery.each(me.cssProperties, function(index, cssPropName) {
            var color = me.normalizeColor(style[cssPropName]);
            if (color) {
                if (color) props[cssPropName] = color;
            }
        });

        me.compactProps('border', props);
        me.compactProps('outline', props);

        jQuery.each(props, function(prop, color) {
            colors.push({color: color, prop: prop});
        });

        return colors;
    },

    addColorsFromCSSStyle : function(allColors, colors, cssRule) {
        if (colors.length == 0) return;
        for (var i=0; i < colors.length; i++) {
             var item = colors[i];
             var color = item.color;
             var prop = item.prop;
             if (!(color in allColors)) allColors[color] = {};
             if (!('css' in allColors[color])) allColors[color].css = [];
             var styleSheetURL = cssRule.parentStyleSheet.href ? cssRule.parentStyleSheet.href : 'inline-style';
             var entry = {prop: prop, cssText: cssRule.cssText, selectorText: cssRule.selectorText, styleSheetURL: styleSheetURL};
             allColors[color].css.push(entry);
        }
    },

    filterOutCSSOnlyColors : function(allColors) {
        for (color in allColors) {
            if (!('computed' in allColors[color])) delete allColors[color];
        }
    },

    sortByCSSPriority : function(a, b) {
        var aLongName = a.elemLongName;
        var bLongName = b.elemLongName;

        var aScore = 0;
        var bScore = 0;

        // id names
        if (aLongName.indexOf('#') != -1) aScore += 10000;
        if (bLongName.indexOf('#') != -1) bScore += 10000;

        // number of classes
        aScore += aLongName.split('.').length*100;
        bScore += bLongName.split('.').length*100;

        // just length
        aScore += aLongName.length;
        bScore += bLongName.length;

        return bScore - aScore;
    },

    filterDuplicateAndSortEntries : function(allColors) {
        for (color in allColors) {
            if (!('computed' in allColors[color])) continue;
            var foundSelectors = {};
            var newComputed = [];
            for (var i=0; i < allColors[color].computed.length; i++) {
                var entry = allColors[color].computed[i];
                var elemLongName = entry.elemLongName;
                if (!(elemLongName in foundSelectors)) {
                    newComputed.push(allColors[color].computed[i]);
                    foundSelectors[elemLongName] = 1;
                }
            }
            newComputed.sort(this.sortByCSSPriority);
            allColors[color].computed = newComputed;
        }
    },

    czRGBAttributeToCol : function(colAttribute) {
        var firstParen = colAttribute.split("(");
        colAttribute = firstParen[1];
        var secondParen = colAttribute.split(")");
        colAttribute = secondParen[0];
        var rgbArr = colAttribute.split(",");

        var czRGBToColor = function(r, g, b) {
            return r | (g << 8) | (b << 16);
        }

        return czRGBToColor(rgbArr[0], rgbArr[1], rgbArr[2]);
    },

    highlightElementsByColor : function(colorRef) {
        var cssText = '@-webkit-keyframes cz-blinker { from { outline-width: 2px; } to { outline-width: 0px; } } .cz-color-' + colorRef + ' { outline: 2px dotted red; -webkit-animation-name: cz-blinker; -webkit-animation-iteration-count: infinite;  -webkit-animation-timing-function: cubic-bezier(1.0,0,0,1.0); -webkit-animation-duration: 1s;  } html { padding-top: 400px; !important; }';
        
        if ($('head').length == 0) $('html').prepend(document.createElement('head'));
        $('<style type="text/css" id="colorzilla-outline-by-color"></style>').text(cssText).appendTo('head');

        var elem = $('.cz-color-' + colorRef).get(0);
        if (elem) elem.scrollIntoView(false);
//        elem.ownerDocument.defaultView.scrollBy(0, -10);
    },

    removeHightlightElementsByColor : function() {
        $('#colorzilla-outline-by-color').remove();
    },

    getPageColors : function(includeCSSOnly) {
       if (typeof includeCSSOnly == 'undefined') includeCSSOnly = false;
       var allColors = {};
       var me = this;

        $('body, body *').each(function(index, elem) {
            
            if (elem.hasAttribute('id') && (elem.getAttribute('id').indexOf('colorzilla') != -1)) return;
            if (elem.hasAttribute('class') && (elem.getAttribute('class').indexOf('colorzilla') != -1)) return

            if (elem.hasAttribute('style')) {
                var colors = me.extractColorsFromCSSStyle(elem.style);
                var cssRule = {cssText: elem.getAttribute('style'), parentStyleSheet: {href: 'style-attribute'}, selectorText: ColorZilla.Utils.getElementLongName(elem)};
                me.addColorsFromCSSStyle(allColors, colors, cssRule);
            }
            var props = {};
            jQuery.each(me.cssProperties, function(index, cssPropName) {
                var color = me.normalizeColor($(elem).css(cssPropName));
                if (color) props[cssPropName] = color;
            });
            
            me.compactProps('border', props);
            me.compactProps('outline', props);

            jQuery.each(props, function(prop, color) {
                if (!(color in allColors)) allColors[color] = {};
                if (!('computed' in allColors[color])) allColors[color].computed = [];
                var propsWithSameColor = [];
                jQuery.each(props, function(otherProp, otherColor) {
                    if (otherColor == color) {
                        propsWithSameColor.push(otherProp);
                        delete props[otherProp];
                    }
                });
                var entry = {elemLongName: ColorZilla.Utils.getElementLongName(elem), props: propsWithSameColor};
                allColors[color].computed.push(entry);
                $(elem).addClass('cz-color-' + me.czRGBAttributeToCol(color));
                //console.log(prop + ' - ' + color);
            });
        });

        // enumerate all stylesheets, also check out window.getMatchedCSSRules (although limited by same origin policy, same as below)
        var styleSheets = document.styleSheets ? document.styleSheets : [];
        jQuery.each(document.styleSheets, function(index, styleSheet) {
            // this will be empty for cross domain external stylesheets, making it not very useful
            var cssRules = styleSheet.cssRules ? styleSheet.cssRules : [];
            jQuery.each(cssRules, function(index, cssRule) {  
                if (cssRule.style) {
                    var colors = me.extractColorsFromCSSStyle(cssRule.style);
                    me.addColorsFromCSSStyle(allColors, colors, cssRule);
                }
            });
        });

        if (!includeCSSOnly) {
            me.filterOutCSSOnlyColors(allColors);
        }

        me.filterDuplicateAndSortEntries(allColors);

        return allColors;
    }
}

ColorZilla.Utils = {
    getElementLongName : function(elem) {
        elem = $(elem);
        var className = elem.attr("class");
        var idVal = elem.attr("id");

        var name = elem.get(0).tagName.toLowerCase();

        if (idVal) {
            name += "#" + idVal;
        }

        if (className) {
            className = className.replace(/^ +/g, '');
            className = className.replace(/ +$/g, '');
            className = className.replace(/ +/g, '.');
            var classNameArr = className.split('.');
            for (var i=0; i < classNameArr.length; i++) {
                if (classNameArr[i].indexOf('cz-color-') == -1) {
                    name += "." + classNameArr[i];
                }
            }
        }

        return name;
    }
}

var pageManager = new ColorZilla.PageManager();
pageManager.init();

} // double injection protect
