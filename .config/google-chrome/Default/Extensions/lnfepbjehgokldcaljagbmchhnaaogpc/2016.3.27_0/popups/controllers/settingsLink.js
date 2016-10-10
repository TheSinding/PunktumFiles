/*! CKP - KeePass integration for Chrome™, Copyright 2016 Steven Campbell
*/

"use strict";

function SettingsLinkController($scope, $location, optionsLink) {
  $scope.showSettingsPage = function() {
    optionsLink.go();
  }
}
