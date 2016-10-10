/*! CKP - KeePass integration for Chrome™, Copyright 2016 Steven Campbell
*/
function EntryDetailsController($scope, $routeParams, $location, unlockedState) {
	"use strict";

	$scope.unlockedState = unlockedState;
	var entryId = $routeParams.entryId;
	$scope.entry = unlockedState.entries.filter(function(entry) {
		return entry.id == entryId;
	})[0];

	$scope.attributes = $scope.entry.keys.map(function(key) {
		return {
			'key': key,
			'value': ($scope.entry[key] || "").replace(/\n/g, "<br>")
		};
	});

	for (var protectedKey in $scope.entry.protectedData) {
		$scope.attributes.push({
			'key': protectedKey,
			'value': '', 
			'protected': true,
			'protectedAttr': $scope.entry.protectedData[protectedKey]
		});
	}

	$scope.exposeAttribute = function(attr) {
		attr.value = unlockedState.getDecryptedAttribute(attr.protectedAttr);
	}

	$scope.goBack = function() {
		$location.path('/startup');
	}
}
