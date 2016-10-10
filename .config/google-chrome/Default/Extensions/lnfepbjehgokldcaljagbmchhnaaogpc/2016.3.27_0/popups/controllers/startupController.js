/*! CKP - KeePass integration for Chrome™, Copyright 2016 Steven Campbell
*/
"use strict";

function StartupController($scope, $location, settings, optionsLink, passwordFileStoreRegistry) {
  $scope.ready = false;

  settings.getCurrentDatabaseChoice().then(function(info) {
    //use the last chosen database
    if (info) {
      $location.path('/enter-password/' + info.providerKey + '/' + encodeURIComponent(info.passwordFile.title));
    } else {
      //user has not yet chosen a database.  Lets see if there are any available to choose...
      var readyPromises = [];
      passwordFileStoreRegistry.listFileManagers('listDatabases').forEach(function(provider) {
        readyPromises.push(provider.listDatabases());
      });

      return Promise.all(readyPromises).then(function(filesArrays) {
        var availableFiles = filesArrays.reduce(function(prev, curr) {
          return prev.concat(curr);
        });

        if (availableFiles.length) {
          //choose one of the files
          $location.path('/choose-file')
        } else {
          //no files available - allow the user to link to the options page
          $scope.ready = true;
        }
      });
    }
  }).then(function() {
    $scope.$apply();
  })

  $scope.openOptionsPage = function() {
    optionsLink.go();
  }
}
