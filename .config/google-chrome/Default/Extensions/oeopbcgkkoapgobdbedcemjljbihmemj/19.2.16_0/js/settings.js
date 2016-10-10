/// <reference path="DB.js" />

var Settings = function() {

   var cache = {};
   var storeId = "settings";
   var settingsFile;

   function loadFromDB(callback) {
      wrappedDB.readAllObjects(storeId,
	      function (setting) {
	         cache[setting.key] = setting.value;
	      }, callback
	  );
   }

   Settings.defaults = { 
	  "language": window.navigator.language,
      "animateButtonIcon": true,
      "notificationSound": "chime.ogg",
      "desktopNotification": "rich",
      "notificationVoice": "",
      "showNotificationDuration": 7,
      "notificationClickAnywhere": "open",
      "voiceSoundVolume": 100,
      "pitch": 1.0,
      "rate": 1.0,
      "spokenWordsLimit": "summary",
      "voiceNotificationOnlyIfIdleInterval": 15,
      "voiceHear": "from|subject|message",
      "poll": 30000,
      "monitor_label": [SYSTEM_INBOX],
      "conversationView": true,
      "open_label": SYSTEM_INBOX,
      "icon_set": "default",
      "browserButtonAction": BROWSER_BUTTON_ACTION_CHECKER_PLUS,
      "checkerPlusBrowserButtonActionIfNoEmail": BROWSER_BUTTON_ACTION_CHECKER_PLUS,
      "gmailPopupBrowserButtonActionIfNoEmail": BROWSER_BUTTON_ACTION_GMAIL_INBOX,
      "check_gmail_off": false,
      "hide_count": false,
      "showfull_read": true,
      "openComposeReplyAction": "popupWindow",
      "popupLeft": "100",
      "popupTop": "100",
      "popupWidth": "800",
      "popupHeight": "680",
      "archive_read": true,
      "showStar": true,
      "showArchive": true,
      "showSpam": true,
      "showDelete": true,
      "showMoveLabel": true,
      "showReply": false,
      "showOpen": true,
      "showMarkAsRead": true,
      "showMarkAllAsRead": true,
      "showMarkAsUnread": true,
      "buttons": "original",
      "DND_scheduleStartHour": 23,
      "DND_scheduleEndHour": 7,
      "DND_scheduleWeekendStartHour": 23,
      "DND_scheduleWeekendEndHour": 7,
      "groupByLabels": true,
      "collapseEmailAccounts": false,
      "showOptionsButton": true,
      "showLeftColumnWhenPreviewingEmail": true,
      "notificationSoundVolume": 100,
      "replyingMarksAsRead": true,
      "deletingMarksAsRead": false,
      "24hourMode": false,
      "fetchContactsInterval": 48,
      "accountColor": "#00bad2",
      "colorStart1": "#E1EDEC",
      "colorEnd1": "#00B88D",
      "colorStart2": "#E8E1D3",
      "colorEnd2": "#B87500",
      "voiceInput": false,
      "voiceInputDialect": window.navigator.language,
      "voiceInputSuggestions": true,
      "buttonFilter": "",
      "hue-rotate": 0,
      "grayscale": 0,
      "sepia": 0,
      "brightness": 0,
      "contrast": 100,
      "invert": 0,
      "saturate": 100,
      "linesInSummary": "2",
      "emailPreview": true,
      "alwaysDisplayExternalContent": true,
      "showActionButtonsOnHover": true,      
      "emailsMarkedAsRead": "hide",
      "readViaGmailPage": "show",
      "keyboardException_R": "reply",
      "showTransitions": true,
      "accountAddingMethod": "autoDetect",
      "zoom": "auto",
      "notificationButton1": "markAsRead",
      "notificationButton2": "delete",
      "showNotificationsForOlderDateEmails": false,
      "doNotShowNotificationIfGmailTabOpen": false,
      "notificationDisplay": "from|subject|message",
      "notificationDisplayName": "firstNameOnly",
      "popupWindowView": "default",
      "extensionUpdates": "interesting",
      "maxEmailsToShowPerAccount": 20,
      "showCheckerPlusButtonsOnlyOnHover": true,
      "clickingCheckerPlusLogo": "openHelp",
      "autoAdvance": "newer",
      "showContextMenuItem": true,
      "materialDesign": true,
      "displayDensity": "cozy",
      "skins": [],
      "customSkin": {id:"customSkin"},
      "skinsEnabled": true,
      "showButtonTooltip": true,
      "highlightDates": true
   };
   
   Settings.extraFeatures = ["DUMMY_TO_INDICATE_EXTRA_FEATURE", "DND_schedule", "DND_scheduleStartHour", "DND_scheduleEndHour", "clickingCheckerPlusLogo", "setPositionAndSize", "alias", "accountColor", "buttons", "showStar", "showArchive", "showSpam", "showDelete", "showMoveLabel", "showMarkAsRead", "showMarkAllAsRead", "showMarkAsUnread", "linesInSummary", "showLeftColumnWhenPreviewingEmail", "hideByJason", "removeShareLinks"];
   
   Settings.isExtraFeature = function(key) {
	   return Settings.extraFeatures.indexOf(key) != -1;
   };

   Settings.isSettingLocked = function(key) {
	   if (settingsFile && (settingsFile.settingsAccess == "userCanModifyOnlyMonitoredLabels" || settingsFile.settingsAccess == "locked") && settingsFile[key] != null) {
		   return true;
	   } else {
		   return false;
	   }
   };
   
   Settings.read = function(key) {
	   // prevent users from overriding extra features via the settings file if they haven't donated AND prevent overriding donationClicked
	   var allowedToOverrideExtraFeature = true;
	   if (!cache["donationClicked"] && (Settings.isExtraFeature(key) || key == "donationClicked")) {
		   allowedToOverrideExtraFeature = false;
	   }

	   if (allowedToOverrideExtraFeature && settingsFile && settingsFile.settingsAccess == "userCanModifyAllOptions") {
		   // 1. check indexeddb for user changes
		   // 2. check settings file for new defaults
		   // 3. check defaults
		   if (cache[key] != null) {
			   return cache[key];
		   } else if (settingsFile[key] != null) {
			   return settingsFile[key];
		   } else if (this.defaults[key] != null) {
			   return this.defaults[key];
		   }
	   } else if (allowedToOverrideExtraFeature && settingsFile && (settingsFile.settingsAccess == "userCanModifyOnlyMonitoredLabels" || settingsFile.settingsAccess == "locked")) {
		   // 1. check settings first
		   // 2. check indexedb for unlocked changes (ie accounts/labels etc.)
		   // 3. check defaults
		   if (settingsFile[key] != null) {
			   return settingsFile[key];
		   } else if (cache[key] != null) {
			   return cache[key];
		   } else if (this.defaults[key] != null) {
			   return this.defaults[key];
		   }
	   } else {
		   // 1. check indexeddb for user changes
		   // 2. check defaults
		   if (cache[key] != null) {
			   return cache[key];
		   } else if (this.defaults[key] != null) {
			   return this.defaults[key];
		   }
	   }
	   return null;
   };
   
   // does not use defaults, will return null
   Settings.readRaw = function(key) {
	   return cache[key];
   };

   // created this method because objects return from Settings.read could be modified and since they were references they would also modify the cache[]  So if we called Settings.read on the same variable it would return the modified cached variables instead of what is in actual storage
   Settings.readFromStorage = function(key, callback) {
	   wrappedDB.readObject(storeId, key, function(value) {
		   // update cache
		   cache[key] = value;
		   
		   // process .read logic
		   value = Settings.read(key);
		   
		   callback(value);
	   });
   }
   
   Settings.store = function (key, value) {
	   // if locked and setting exists in settings file, then do not allow user to modify it
	   if (settingsFile && (settingsFile.settingsAccess == "userCanModifyOnlyMonitoredLabels" || settingsFile.settingsAccess == "locked") && settingsFile[key] != null) {
		   console.error("Cannot modify this setting: " + key + " because settingsAccess is " + settingsFile.settingsAccess);
		   return null;
	   } else {
		   cache[key] = value;
		   return wrappedDB.putObject(storeId, key, value);
	   }
   };

   Settings.delete = function (key) {
	   // remove it from cache
	   delete cache[key];
	   
	   // remove it from indexeddb
	   wrappedDB.deleteSetting(storeId, key);
   };

   Settings.load = function (loadingSettingsDeferred, callback) {
	   var DBNAME = "MCP_DB";
	   wrappedDB.open(DBNAME, storeId, function () {
		   loadFromDB(function() {

			   callback();
			   loadingSettingsDeferred.resolve();
			   
			   /*
			   $.getJSON(chrome.extension.getURL("settings.json"), function() {})
			   		.always(function(jqXHRORdata, textStatus, errorThrown) {
			   			console.log("settings response: ", arguments);
			   			if (textStatus == "success") {
			   				console.log("Loading settings.json");
			   				settingsFile = jqXHRORdata;
			   			} else if (jqXHRORdata && jqXHRORdata.status == "404") {
			   				// file not found so do nothing
			   			} else if (textStatus == "parsererror") {
			   				alert("Error loading 'Checker Plus for Gmail' settings file. Using default settings. (Error: " + errorThrown.message + ")");
			   			} else { // textStatus == "error")  error seems to mean file doesn't exist
			   				// do nothing
			   			}
						callback();
						loadingSettingsDeferred.resolve();
			   		})
			   	;
			   	*/
			   
			});	
		});
	   
	   return loadingSettingsDeferred.promise();
   };
}

Settings();