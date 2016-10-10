/*! CKP - KeePass integration for Chrome™, Copyright 2016 Steven Campbell
*/
"use strict";

//simple service to link to the options page
function OptionsLink() {
  var exports = {
    go: go
  }

  function go() {
    chrome.runtime.openOptionsPage();
  }

  return exports;
}
