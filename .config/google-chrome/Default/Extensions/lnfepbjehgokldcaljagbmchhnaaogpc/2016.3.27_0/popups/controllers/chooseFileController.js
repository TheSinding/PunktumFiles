/*! CKP - KeePass integration for Chrome™, Copyright 2016 Steven Campbell
*/
function ChooseFileController($scope, $location, passwordFileStoreRegistry, settings) {
	"use strict";

  $scope.errorMessage = "";
  $scope.successMessage = "";
  $scope.databases = [];

  passwordFileStoreRegistry.listFileManagers('listDatabases').forEach(function(provider) {
    provider.listDatabases().then(function(databases) {
    	if (databases && databases.length) {
	      databases.forEach(function(database) {
	        database.provider = provider;
	      });
	      $scope.databases = $scope.databases.concat(databases);
    	}
    }).then(function() {
    	if(!$scope.$$phase) {
    		//HACK: some providers are outside of digest
	      $scope.$apply();
    	}
    });
  });

  $scope.chooseDatabase = function(database) {
    var info = database.provider.getDatabaseChoiceData(database);
    settings.saveCurrentDatabaseChoice(info, database.provider).then(function() {
      $location.path('/enter-password/' + database.provider.key + '/' + encodeURIComponent(database.title));
      $scope.$apply();
    });
  }
}
