(function() {
  var fvdSpeedDialInfo = {
    name: "Speed Dial [FVD] - New Tab Page, 3D, Sync...",
    id: "llaficoajjainaijghjlofdfmbjpebpa"
  };

  var fvdSpeedDialLink = {
    _fvdsdId: null,
    _info: null,
    /**
     * @param {Object} [info] - is optional if already called with info
     * @param {String} info.path - local path to widget html file("/widget.html")
     * @param {Number} info.widthCells - width of widget in cells
     * @param {Number} info.heightCells - height of widget in cells
     */
    setWidgetInfo: function(info) {
      if(info) {
        this._info = info;
      }
      if(!this._info) {
        throw new Error("Info is required for first call");
      }
      this._sendInfo();
    },
    _sendInfo: function() {
      var info = {
        apiv: 2,
      };
      for(var k in this._info) {
        info[k] = this._info[k];
      }
      // backward compatibility
      if(info.widthCells && !info.width) {
        info.width = info.widthCells * 250 + (info.widthCells - 1) * 10;
      }
      if(info.heightCells && !info.height) {
        info.height = info.heightCells * 200 + (info.heightCells - 1) * 10;
      }
      chrome.extension.sendMessage(
        fvdSpeedDialInfo.id, {
        action: "fvdSpeedDial:Widgets:Widget:setWidgetInfo",
        body: info
      });
    }
  };

  if (chrome.runtime.onMessageExternal) {
  chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    if (request && request.action == "fvdSpeedDial:Widgets:Server:isWidget") {
      fvdSpeedDialLink.setWidgetInfo();
    }
  });
  }

  window.fvdSpeedDialLink = fvdSpeedDialLink;
})();