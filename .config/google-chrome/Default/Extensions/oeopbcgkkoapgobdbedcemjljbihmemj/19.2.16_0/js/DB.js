/* 
   From: http://setthebarlow.com/indexeddb/ 
*/

var wrappedDB = {};
wrappedDB.db = null;
wrappedDB.opened = false;
 
wrappedDB.onerror = function(e) {
   logError(e);
};
 
wrappedDB.open = function(dbName, storeId, callback) {
	
	var keyValues = new Array();
	
	function createObjectStore(db, createObjectStoreCallback) {
		if (db.objectStoreNames.contains(storeId)) {
			console.log("delete object store");
			db.deleteObjectStore(storeId);
		}
		console.log("creating object store");
		var objectStore = db.createObjectStore(storeId, {keyPath: "key"}); // Create unique identifier for store
		console.log("objectStore", objectStore)

		// transfer old keyvalues to new version
		for (var a=0; a<keyValues.length; a++) {
			console.log(keyValues[a]);
			objectStore.put(keyValues[a]);
		}

		objectStore.transaction.oncomplete = function() {
			console.log("object store oncomplete");
			wrappedDB.db = db;
			wrappedDB.opened = true;		
			createObjectStoreCallback();			
		}
		objectStore.transaction.onerror = function(e) {
			logError("Error in creating object store: ", e);
		}
	}
	
	var request = indexedDB.open(dbName);
	request.onsuccess = function(e) {
		
		var v = 1; // Structural version of the DB, DONT't USE flaot ie. 1.0, as the version will be rounded to 1
		wrappedDB.db = e.target.result;
		
		var db = wrappedDB.db;

		//console.log("db open onsuccess:", db);
		//console.log("current version: " + db.version + " new version: " + v + " isdifferent: " + (db.version != v));

		// We can only create Object stores in a setVersion transaction
		
		// seems that from Chrome version 25 that the default db.version is 1 (used to be blank) so i this method used to go into the if and create the db
		// now the onupgradeneeded is called in version 25
		if (db.setVersion && db.version != v) {
			// temporarily save keyvalues from old version to temp array *MUST BE DONE before setVersion() or else we can't access the old object store
			console.log("objectStoreNames", db.objectStoreNames);			
			// make sure it exits, might not exist if this is a first time user
			if (db.objectStoreNames.contains(storeId)) {
				var trans = db.transaction([storeId], "readonly");
				var objectStore = trans.objectStore(storeId);
				
				objectStore.openCursor().onsuccess = function(event) {
					var cursor = event.target.result;
					if (cursor) {
						console.log(cursor.value.key, cursor.value.value);
						keyValues.push(cursor.value);
						cursor.continue();
					} else {
						//alert("No more entries!");
					}
				};
			}
			
			var setVrequest = db.setVersion(v);

			// onsuccess is the only place we can create Object Stores
			setVrequest.onsuccess = function(e) {
				console.log("onsucces: ", e);
				//var transaction = e.target.result;
				//transaction.oncomplete = function() {
					createObjectStore(db, callback);
				//};
			};
			setVrequest.onfailure = wrappedDB.onerror;
			setVrequest.onblocked = function(e) {
				logError("got blocked:" + e);
			};
		} else {
			wrappedDB.opened = true;
			callback();
		}
	};

    request.onupgradeneeded = function (event) {
    	console.log("onupgradeneeded: " + storeId);
		var db = event.target.result;
		createObjectStore(db, function() {
			// do nothing
		});
    };
    
    request.onerror = wrappedDB.onerror;
	request.onfailure = wrappedDB.onerror;
}

wrappedDB.putObject = function(storeId, key, value) {
	var dfd = new $.Deferred();
	
	if (wrappedDB.opened === false) {
		dfd.reject("DB not opened");
		return dfd.promise();
	}

	var db = wrappedDB.db;
	var trans = db.transaction([storeId], "readwrite");
   
	trans.onabort = function(e) {
		var error = "trans abort: " + e;
		logError(error);
		dfd.reject(error);
	};

	var store = trans.objectStore(storeId);
 
	var data = {
			"key": key,
			"value": value
	};
 
	var request = store.put(data);
 
	request.onsuccess = function(e) {
		//console.log("Successfully stored object with key: " + key);
		chrome.runtime.sendMessage({command:"indexedDBSettingSaved", key:key});
		dfd.resolve("success");
	};
    
	request.onerror = function(e) {
		var errorCode;
		if (e && e.target) {
			errorCode = e.target.errorCode;
		}
		var error = "An error occured while trying to store an object with key: " + key + ". " + this.webkitErrorMessage + " (code " + errorCode + ")";
		logError(error);
		dfd.reject(error);
	};
	
	return dfd.promise();
};
 
wrappedDB.deleteSetting = function(storeId, key) {
   if(wrappedDB.opened === false)
      return;

   var db = wrappedDB.db;
   var trans = db.transaction([storeId], "readwrite");
   var store = trans.objectStore(storeId);
 
   var request = store.delete(key);
 
   request.onsuccess = function(e) {
      console.log("Successfully deleted object with key: " + key);
   };
 
   request.onerror = function(e) {
      logError("An error occured while trying to delete an object with key: " + key + ". " 
         + this.webkitErrorMessage + " (code " + this.errorCode + ")");
   };
};
 
wrappedDB.readAllObjects = function(storeId, objectFoundCallback, requestCompleteCallback) { 
   if (wrappedDB.opened === false)
      return;

   var db = wrappedDB.db;
   var trans;
   try {
	   trans = db.transaction([storeId], "readonly");
   } catch (e) {
	   logError(e);
	   requestCompleteCallback();
	   return;
   }
   var store = trans.objectStore(storeId);
 
   // Get everything in the store;
   var keyRange = IDBKeyRange.lowerBound(0);
   var cursorRequest = store.openCursor(keyRange);
 
   cursorRequest.onsuccess = function(e) {
      var cursor = e.target.result;

      if (!cursor) {
         if (requestCompleteCallback) {
        	 requestCompleteCallback();
         }         
      } else { 
         if(objectFoundCallback)
            objectFoundCallback(cursor.value);

         cursor.continue();
      }
   };
 
   cursorRequest.onerror = wrappedDB.onerror;
};

wrappedDB.readObject = function(storeId, key, callback) {
   if (wrappedDB.opened === false)
      return;

   var db = wrappedDB.db;
   var trans;
   try {
	   trans = db.transaction([storeId], "readonly");
   } catch (e) {
	   logError(e);
	   callback(null);
	   return;
   }
   var store = trans.objectStore(storeId);
 
   // Get everything in the store;
   var request = store.get(key);
 
   request.onsuccess = function(e) {
      if (callback) {
         if (this.result) {
            callback(this.result.value);
         } else {
            callback(null); // TODO: Better error handling
         }
      }
   };
 
   request.onerror = wrappedDB.onerror;
};
