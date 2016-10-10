// Copyright 2016 Jason Savard

var ABSOLUTE_MAX_EMAILS_TO_SHOW_IN_POPUP = 20;
var MAX_EMAILS_IN_ATOM_FEED = 20;
var MAX_EMAILS_TO_FETCH = 50;
var MAX_EMAILS_HISTORIES = 100;
var MAX_HISTORY_NEXT = 5;
var MAX_EMAILS_TO_INSTANTLY_ACTION = 10;
var MAX_EMAILS_TO_ACTION = 10;
var UNSYNCHED_ACCOUNT_ID = 99;
var TEST_REDUCED_DONATION = false;
var HTML_CSS_SANITIZER_REWRITE_IDS_PREFIX = "somePrefix-";
var ITEM_ID = "gmail";

/* MUST be synced with input value='???' in options.html */
var BROWSER_BUTTON_ACTION_CHECKER_PLUS = "checkerPlus";
var BROWSER_BUTTON_ACTION_CHECKER_PLUS_POPOUT = "checkerPlusPopout";
var BROWSER_BUTTON_ACTION_GMAIL_INBOX = "gmailInbox";
var BROWSER_BUTTON_ACTION_GMAIL_TAB = "gmailTab";
var BROWSER_BUTTON_ACTION_GMAIL_IN_NEW_TAB = "gmailInNewTab";
var BROWSER_BUTTON_ACTION_COMPOSE = "compose";

var SYSTEM_PREFIX = "JSYSTEM_";

var SYSTEM_INBOX = SYSTEM_PREFIX + "INBOX";
var SYSTEM_IMPORTANT = SYSTEM_PREFIX + "IMPORTANT";
var SYSTEM_IMPORTANT_IN_INBOX = SYSTEM_PREFIX + "IMPORTANT_IN_INBOX";
var SYSTEM_UNREAD = SYSTEM_PREFIX + "UNREAD";
var SYSTEM_ALL_MAIL = SYSTEM_PREFIX + "ALL_MAIL";
var SYSTEM_PRIMARY = SYSTEM_PREFIX + "PRIMARY";
var SYSTEM_PURCHASES = SYSTEM_PREFIX + "PURCHASES";
var SYSTEM_FINANCE = SYSTEM_PREFIX + "FINANCE";
var SYSTEM_SOCIAL = SYSTEM_PREFIX + "SOCIAL";
var SYSTEM_PROMOTIONS = SYSTEM_PREFIX + "PROMOTIONS";
var SYSTEM_UPDATES = SYSTEM_PREFIX + "UPDATES";
var SYSTEM_FORUMS = SYSTEM_PREFIX + "FORUMS";
var SYSTEM_STARRED = SYSTEM_PREFIX + "STARRED";

var AtomFeed = {};
AtomFeed.INBOX = "";
AtomFeed.IMPORTANT = "important";
AtomFeed.IMPORTANT_IN_INBOX = "^iim";
AtomFeed.UNREAD = "unread"; // note that UNREAD equals "all mail" in reference to tablet view
AtomFeed.PRIMARY = "^smartlabel_personal";
AtomFeed.PURCHASES = "^smartlabel_receipt";
AtomFeed.FINANCE = "^smartlabel_finance";
AtomFeed.SOCIAL = "^smartlabel_social";
AtomFeed.PROMOTIONS = "^smartlabel_promo";
AtomFeed.UPDATES = "^smartlabel_notification";
AtomFeed.FORUMS = "^smartlabel_group";

var MailAction = {};
MailAction.DELETE = "deleteEmail";
MailAction.MARK_AS_READ = "markAsRead";
MailAction.MARK_AS_UNREAD = "markAsUnread";
MailAction.ARCHIVE = "archive";
MailAction.MARK_AS_SPAM = "markAsSpam";
MailAction.APPLY_LABEL = "applyLabel";
MailAction.REMOVE_LABEL = "removeLabel";
MailAction.STAR = "star";
MailAction.REMOVE_STAR = "removeStar";
MailAction.REPLY = "reply";
MailAction.SEND_EMAIL = "sendEmail";
MailAction.UNTRASH = "untrash";

var GmailAPI = {};

GmailAPI.DOMAIN = "https://www.googleapis.com";
GmailAPI.PATH = "/gmail/v1/users/me/";
GmailAPI.URL = GmailAPI.DOMAIN + GmailAPI.PATH;
GmailAPI.UPLOAD_URL = GmailAPI.DOMAIN + "/upload" + GmailAPI.PATH;

GmailAPI.labels = {};
GmailAPI.labels.INBOX = "INBOX";
GmailAPI.labels.CATEGORY_PERSONAL = "CATEGORY_PERSONAL";
GmailAPI.labels.CATEGORY_PURCHASES = "CATEGORY_PURCHASES";
GmailAPI.labels.CATEGORY_FINANCE = "CATEGORY_FINANCE";
GmailAPI.labels.CATEGORY_SOCIAL = "CATEGORY_SOCIAL";
GmailAPI.labels.CATEGORY_PROMOTIONS = "CATEGORY_PROMOTIONS";
GmailAPI.labels.CATEGORY_UPDATES = "CATEGORY_UPDATES";
GmailAPI.labels.CATEGORY_FORUMS = "CATEGORY_FORUMS";
GmailAPI.labels.STARRED = "STARRED";
GmailAPI.labels.SENT = "SENT";
GmailAPI.labels.SPAM = "SPAM";
GmailAPI.labels.UNREAD = "UNREAD";
GmailAPI.labels.IMPORTANT = "IMPORTANT";
GmailAPI.labels.TRASH = "TRASH";

var JError = {};
JError.HISTORY_INVALID_OR_OUT_OF_DATE = "HISTORY_INVALID_OR_OUT_OF_DATE";
JError.TOO_MANY_HISTORIES = "TOO_MANY_HISTORIES";
JError.EXCEEDED_MAXIMUM_CALLS_PER_BATCH = "EXCEEDED_MAXIMUM_CALLS_PER_BATCH";
JError.NETWORK_ERROR = "NETWORK_ERROR";
JError.RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
JError.ACCESS_REVOKED = "ACCESS_REVOKED";
JError.NO_TOKEN_FOR_EMAIL = "NO_TOKEN_FOR_EMAIL";
JError.MIGHT_BE_OFFLINE = "MIGHT_BE_OFFLINE";
JError.NOT_FOUND = "NOT_FOUND";
JError.GOOGLE_ACCOUNT_WITHOUT_GMAIL = "GOOGLE_ACCOUNT_WITHOUT_GMAIL";
JError.GMAIL_NOT_ENABLED = "GMAIL_NOT_ENABLED";
JError.GOOGLE_SERVICE_ACCOUNT = "GOOGLE_SERVICE_ACCOUNT";
JError.GMAIL_BACK_END = "GMAIL_BACK_END";
JError.CANNOT_ENSURE_MAIN_AND_INBOX_UNREAD = "CANNOT_ENSURE_MAIN_AND_INBOX_UNREAD";

var Origins = {};
Origins.ADDING_METHOD_OAUTH = {origins: ["*://*.jasonsavard.com/*"]};
Origins.IMAGE_PREVIEW = {origins: ["*://*.googleusercontent.com/*"]};

var Source = {};
Source.SIGN_IN = "SIGN_IN";
Source.STARTUP = "STARTUP";

var Icons = {};
Icons.NOTIFICATION_ICON_URL = "images/icons/icon_80_whitebg.png";
Icons.APP_ICON_MASK_URL = "images/icons/notificationMiniIcon.png";

var ExtensionId = {};
ExtensionId.Gmail = "oeopbcgkkoapgobdbedcemjljbihmemj";
ExtensionId.Calendar = "hkhggnncdpfibdhinjiegagmopldibha";
ExtensionId.LocalGmail = "pghicafekklkkiapjlojhgdokkegilki";
ExtensionId.LocalCalendar = "pafgehkjhhdiomdpkkjhpiipcnmmigcp";

var ContextMenu = {};
ContextMenu.AllContextsExceptBrowserAction = ["page", "frame", "link", "selection", "editable", "image", "video", "audio"];

// only pull images large enough - filter out small header logos etc
var PREVIEW_IMAGE_MIN_WITDH_HEIGHT = 140;
var PREVIEW_IMAGE_MIN_SIZE = 5000;
var PREVIEW_IMAGE_MAX_SIZE = 200000;

var DATA_URL_MAX_SIZE = 100000;
var FETCH_ATTACHMENT_MAX_SIZE = 10000000;

var FOOL_SANITIZER_CONTENT_ID_PREFIX = "http://cid:";

var MAIL_DOMAIN = "https://mail.google.com";
var MAIL_PATH = "/mail/";
var MAIL_DOMAIN_AND_PATH = MAIL_DOMAIN + MAIL_PATH;

var INBOX_BY_GMAIL_DOMAIN = "https://inbox.google.com";
var INBOX_BY_GMAIL_PATH = "/";
var INBOX_BY_GMAIL_DOMAIN_AND_PATH = INBOX_BY_GMAIL_DOMAIN + INBOX_BY_GMAIL_PATH;

var Urls = {};
Urls.SignOut = "https://mail.google.com/mail/logout";
Urls.NotificationError = "https://jasonsavard.com/forum/categories/checker-plus-for-gmail-feedback?ref=errorNotification";
Urls.ExtensionConflict = "https://jasonsavard.com/wiki/Extension_Conflict";

var SESSION_EXPIRED_ISSUE_URL = "https://jasonsavard.com/wiki/Session_expired_issue";

var VOICE_MESSAGE_FILENAME_PREFIX = "voice-message";
var VIDEO_MESSAGE_FILENAME_PREFIX = "video-message";

function isMainCategory(systemId) {
	var MAIN_CATEGORIES = [SYSTEM_PRIMARY, SYSTEM_PURCHASES, SYSTEM_FINANCE, SYSTEM_SOCIAL, SYSTEM_PROMOTIONS, SYSTEM_UPDATES, SYSTEM_FORUMS];
	if (MAIN_CATEGORIES.indexOf(systemId) != -1) {
		return true;
	}
}

function getGmailAPILabelId(id) {
	var gmailAPILabelId;
	if (id == SYSTEM_INBOX) {
		gmailAPILabelId = GmailAPI.labels.INBOX;
	} else if (id == SYSTEM_UNREAD) {
		gmailAPILabelId = GmailAPI.labels.UNREAD;
	} else if (id == SYSTEM_IMPORTANT) {
		gmailAPILabelId = GmailAPI.labels.IMPORTANT;
	} else if (id == SYSTEM_IMPORTANT_IN_INBOX) {
		gmailAPILabelId = GmailAPI.labels.IMPORTANT;
	} else if (id == SYSTEM_PRIMARY) {
		gmailAPILabelId = GmailAPI.labels.CATEGORY_PERSONAL;
	} else if (id == SYSTEM_PURCHASES) {
		gmailAPILabelId = GmailAPI.labels.CATEGORY_PURCHASES;
	} else if (id == SYSTEM_FINANCE) {
		gmailAPILabelId = GmailAPI.labels.CATEGORY_FINANCE;
	} else if (id == SYSTEM_SOCIAL) {
		gmailAPILabelId = GmailAPI.labels.CATEGORY_SOCIAL;
	} else if (id == SYSTEM_UPDATES) {
		gmailAPILabelId = GmailAPI.labels.CATEGORY_UPDATES;
	} else if (id == SYSTEM_FORUMS) {
		gmailAPILabelId = GmailAPI.labels.CATEGORY_FORUMS;
	} else if (id == SYSTEM_PROMOTIONS) {
		gmailAPILabelId = GmailAPI.labels.CATEGORY_PROMOTIONS;
	} else if (id == SYSTEM_STARRED) {
		gmailAPILabelId = GmailAPI.labels.STARRED;
	} else {
		gmailAPILabelId = id;
	}
	return gmailAPILabelId;
}

function getJSystemLabelId(id) {
	var jSystemId;
	if (Settings.read("accountAddingMethod") == "autoDetect") {
		jSystemId = id;
	} else {
		if (id == GmailAPI.labels.INBOX) {
			jSystemId = SYSTEM_INBOX;
		} else if (id == GmailAPI.labels.UNREAD) {
			jSystemId = SYSTEM_UNREAD;
		} else if (id == GmailAPI.labels.IMPORTANT) {
			jSystemId = SYSTEM_IMPORTANT;
		} else if (id == GmailAPI.labels.IMPORTANT) {
			jSystemId = SYSTEM_IMPORTANT_IN_INBOX;
		} else if (id == GmailAPI.labels.CATEGORY_PERSONAL) {
			jSystemId = SYSTEM_PRIMARY;
		} else if (id == GmailAPI.labels.CATEGORY_PURCHASES) {
			jSystemId = SYSTEM_PURCHASES;
		} else if (id == GmailAPI.labels.CATEGORY_FINANCE) {
			jSystemId = SYSTEM_FINANCE;
		} else if (id == GmailAPI.labels.CATEGORY_SOCIAL) {
			jSystemId = SYSTEM_SOCIAL;
		} else if (id == GmailAPI.labels.CATEGORY_UPDATES) {
			jSystemId = SYSTEM_UPDATES;
		} else if (id == GmailAPI.labels.CATEGORY_FORUMS) {
			jSystemId = SYSTEM_FORUMS;
		} else if (id == GmailAPI.labels.CATEGORY_PROMOTIONS) {
			jSystemId = SYSTEM_PROMOTIONS;
		} else if (id == GmailAPI.labels.STARRED) {
			jSystemId = SYSTEM_STARRED;
		} else {
			jSystemId = id;
		}
	}
	return jSystemId;
}

function isSystemLabel(label) {
	if (label && label.indexOf(SYSTEM_PREFIX) == 0) {
		// it's jsystem label
		return true;
	} else if (label && (label == GmailAPI.labels.INBOX || label == GmailAPI.labels.CATEGORY_PERSONAL || label == GmailAPI.labels.CATEGORY_PURCHASES || label == GmailAPI.labels.CATEGORY_FINANCE || label == GmailAPI.labels.CATEGORY_SOCIAL || label == GmailAPI.labels.CATEGORY_PROMOTIONS || label == GmailAPI.labels.CATEGORY_UPDATES || label == GmailAPI.labels.STARRED || label == GmailAPI.labels.SENT || label == GmailAPI.labels.UNREAD || label == GmailAPI.labels.IMPORTANT)) {
		// it'a Gmail API system label
		return true;
	} else {
		return false;
	}
	/*
	if (Settings.read("accountAddingMethod") == "autoDetect") {
		if (label && label.indexOf(SYSTEM_PREFIX) == 0) {
			return true;
		} else {
			return false;
		}
	} else {
		if (label && (label == GmailAPI.labels.INBOX || label == GmailAPI.labels.CATEGORY_PERSONAL || label == GmailAPI.labels.CATEGORY_SOCIAL || label == GmailAPI.labels.CATEGORY_PROMOTIONS || label == GmailAPI.labels.CATEGORY_UPDATES || label == GmailAPI.labels.STARRED || label == GmailAPI.labels.SENT || label == GmailAPI.labels.UNREAD || label == GmailAPI.labels.IMPORTANT)) {
			return true;
		} else {
			return false;
		}
	}
	*/
}

function getAllEmails(accounts) {
	return new Promise(function(resolve, reject) {
		var getEmailsCallbackParams = [];
		var promises = [];
		
		$.each(accounts, function (i, account) {
			var promise = account.getEmails().then(function(params) {
				getEmailsCallbackParams.push(params);
			}).catch(function(error) {
				// nothing
			});
			promises.push(promise);
		});
		
		Promise.all(promises).then(function() {
			resolve(getEmailsCallbackParams);
		}).catch(function(error) {
			// resolve anyways
			resolve(getEmailsCallbackParams);
		});
	});
}

function getAccountsSummary(accounts) {
	var signedIntoAccounts = 0;
	var firstNiceError;
	if (accounts.length == 0) {
		if (Settings.read("accountAddingMethod") == "autoDetect") {
			firstNiceError = getMessage("notSignedIn");
		} else {
			firstNiceError = getMessage("addAccount");
		}
	} else {
		accounts.forEach(function(account) {
			if (account.error) {
				if (!firstNiceError) {
					firstNiceError = account.getError().niceError;
				}
			} else {
				signedIntoAccounts++;
			}
		});
	}
	
	return {signedIntoAccounts:signedIntoAccounts, firstNiceError:firstNiceError};
}

function updateBadge(totalUnread) {
	var bg;
	if (window.bg) {
		bg = window.bg;
	} else {
		bg = window;
	}
	
	getDNDState().then(function(dndState) {
		if (totalUnread == null) {
			totalUnread = bg.unreadCount;
		}
		
		var accounts = bg.accounts;
		
		var accountsSummary = getAccountsSummary(accounts);
		
		if (accountsSummary.signedIntoAccounts == 0) {
			bg.buttonIcon.setIcon({signedOut:true});
			if (accountsSummary.firstNiceError) {
				chrome.browserAction.setTitle({ title: accountsSummary.firstNiceError });
			}
		} else if (accounts && accounts.length >= 1) {
			
			if (dndState) {
				chrome.browserAction.setBadgeText({text: getMessage("DND")});
				chrome.browserAction.setTitle({ title: getMessage("doNotDisturb") });
				chrome.browserAction.setBadgeBackgroundColor({color:[0,0,0, 255]});
			} else {
				var hideCount = Settings.read("hide_count");
				if (hideCount || totalUnread < 1) {
					chrome.browserAction.setBadgeText({ text: "" });
				} else {
					chrome.browserAction.setBadgeText({ text: totalUnread.toString() });
				}
			}

			if (!totalUnread || totalUnread <= 0) {
				if (dndState) {
					if (Settings.read("showGrayIconInDND")) {
						bg.buttonIcon.setIcon({signedOut:true});
					} else {
						bg.buttonIcon.setIcon({noUnread:true});
					}
				} else {
					bg.buttonIcon.setIcon({noUnread:true});
					chrome.browserAction.setBadgeBackgroundColor({ color: [110, 140, 180, 255] });
					chrome.browserAction.setTitle({ title: getMessage('noUnreadText') });
				}
			} else {
				if (dndState) {
					if (Settings.read("showGrayIconInDND")) {
						bg.buttonIcon.setIcon({signedOut:true});
					} else {
						bg.buttonIcon.setIcon({unread:true});
					}
				} else {
					bg.buttonIcon.setIcon({unread:true});
					chrome.browserAction.setBadgeBackgroundColor({ color: [232, 76, 61, 255] });
					
					if (Settings.read("showButtonTooltip")) {
						var str = "";
						var mails = getAllUnreadMail(bg.accounts);
						if (mails) {
							mails.forEach(function(mail, mailIndex) {
								str += mail.authorName.getFirstName() + ": " + mail.title + " - " + mail.getLastMessageText({maxSummaryLetters:20, htmlToText:true, EOM_Message:" [" + getMessage("EOM") + "]"}).replace(/\n/g, " ");
								if (mailIndex < mails.length-1) {
									str += "\n";
								}
							});
						}
						chrome.browserAction.setTitle({ title:str });
					} else {
						chrome.browserAction.setTitle({ title:"" });
					}
				}
			}
		
		}		
	}).catch(function(response) {
		// nothing
	});
}

function initPopup(unreadCount) {
	var browserButtonAction = Settings.read("browserButtonAction");
	
	var checkerPlusElseCompose = browserButtonAction == BROWSER_BUTTON_ACTION_CHECKER_PLUS && Settings.read("checkerPlusBrowserButtonActionIfNoEmail") == BROWSER_BUTTON_ACTION_COMPOSE && unreadCount === 0;
	var checkerPlusElseGmailTab = browserButtonAction == BROWSER_BUTTON_ACTION_CHECKER_PLUS && (Settings.read("checkerPlusBrowserButtonActionIfNoEmail") == BROWSER_BUTTON_ACTION_GMAIL_TAB || Settings.read("checkerPlusBrowserButtonActionIfNoEmail") == BROWSER_BUTTON_ACTION_GMAIL_IN_NEW_TAB) && unreadCount === 0;
	var gmailInboxElseCompose = browserButtonAction == BROWSER_BUTTON_ACTION_GMAIL_INBOX && Settings.read("gmailPopupBrowserButtonActionIfNoEmail") == BROWSER_BUTTON_ACTION_COMPOSE && unreadCount === 0;
	var gmailInboxElseGmailTab = browserButtonAction == BROWSER_BUTTON_ACTION_GMAIL_INBOX && (Settings.read("checkerPlusBrowserButtonActionIfNoEmail") == BROWSER_BUTTON_ACTION_GMAIL_TAB || Settings.read("checkerPlusBrowserButtonActionIfNoEmail") == BROWSER_BUTTON_ACTION_GMAIL_IN_NEW_TAB) && unreadCount === 0;
	
	if (browserButtonAction == BROWSER_BUTTON_ACTION_CHECKER_PLUS_POPOUT) {
		chrome.browserAction.setPopup({popup:""});
	} else {
		if (browserButtonAction == BROWSER_BUTTON_ACTION_GMAIL_TAB || browserButtonAction == BROWSER_BUTTON_ACTION_GMAIL_IN_NEW_TAB || browserButtonAction == BROWSER_BUTTON_ACTION_COMPOSE || checkerPlusElseCompose || checkerPlusElseGmailTab || gmailInboxElseCompose || gmailInboxElseGmailTab) {
			// if all accounts in error then display popup so users see errors
			var accountsSummary = getAccountsSummary(chrome.extension.getBackgroundPage().accounts);
			if (accountsSummary.signedIntoAccounts == 0) {
				chrome.browserAction.setPopup({popup: getPopupFile() + "?action=noSignedInAccounts" });
			} else {
				chrome.browserAction.setPopup({popup:""});
			}
		} else {
			chrome.browserAction.setPopup({popup:getPopupFile()});
		}
	}
}

function getPopupFile() {
	if (Settings.read("materialDesign")) {
		return "materialDesign.html";
	} else {
		return "popup.html";
	}
}

function getAccountByEmail(email) {
	var accounts = chrome.extension.getBackgroundPage().accounts;
	for (var a=0; a<accounts.length; a++) {
		if (email == accounts[a].getAddress()) {
			return accounts[a];
		}
	}

	var ignoredAccounts = chrome.extension.getBackgroundPage().ignoredAccounts;
	for (var a=0; a<ignoredAccounts.length; a++) {
		if (email == ignoredAccounts[a].getAddress()) {
			return ignoredAccounts[a];
		}
	}

}

function getAccountById(id) {
	var accounts = chrome.extension.getBackgroundPage().accounts;
	for (var a=0; a<accounts.length; a++) {
		if (id == accounts[a].id) {
			return accounts[a];
		}
	}
}

function ensureContactsWrapper(accounts) {
	return new Promise(function(resolve, reject) {
		if (Settings.read("showContactPhoto")) {
		    var accountsWithUnreadMail = getAccountsWithUnreadMail(accounts);
		    
		    var emailsWithUnreadMail = [];
		    accountsWithUnreadMail.forEach(function(accountWithUnreadMail) {
		    	emailsWithUnreadMail.push(accountWithUnreadMail.getAddress());
		    });

		    bg.oAuthForContacts.ensureTokenForEmail(emailsWithUnreadMail).then(function(response) {
		    	resolve(response);
		    }).catch(function(error) {
		    	// always resolve because we want showcontacts photo to proceed regardless
		    	resolve();
		    });
		} else {
			resolve();
		}
	});
}

function fetchContacts(userEmail) {
	return new Promise(function(resolve, reject) {
		
		var contactsData = Settings.read("contactsData");
		if (!contactsData) {
			contactsData = new Array();
		}
		
		var contactDataItem;
		
		var dataIndex = getContactsDataIndexByEmail(contactsData, userEmail);
		if (dataIndex != -1) {
			contactDataItem = contactsData[dataIndex];
			
			// legacy code: since we introduced the lastmodified let's reset the contacts list once and for all
			if (!contactDataItem.lastModified) {
				contactDataItem.contacts = [];
			}
		} else {
			contactDataItem = {};
			contactDataItem.userEmail = userEmail;
			contactDataItem.contacts = [];
		}
		contactDataItem.lastFetch = now().toString();
		
		var entriesForThisFetch = [];
		var MAX_RECURSIONS = 5;
		var recursions = 0;
		var contactsHaveBeenUpdated = false;
		
		function getContactsByStartIndex(startIndex) {
			return new Promise(function(resolve, reject) {
				var ENTRIES_PER_PAGE = 2000;
				
				var data = {alt:"json", "orderby":"lastmodified", "sortorder":"descending", "max-results":ENTRIES_PER_PAGE, "start-index":startIndex};
				
				if (contactDataItem.lastModified) {
					data["showdeleted"] = true;
					data["updated-min"] = contactDataItem.lastModified;
				}
				
				chrome.extension.getBackgroundPage().oAuthForContacts.send({userEmail:userEmail, url: "https://www.google.com/m8/feeds/contacts/" + userEmail + "/thin", data:data}).then(function(response) {
					if (!response.jqXHR) {
						throw new Error("No jqXHR!");
					} else {
						var data = JSON.parse(response.jqXHR.responseText);
						if (data && data.feed) {
							
							if (data.feed.entry) {
								contactsHaveBeenUpdated = true;
								
								entriesForThisFetch = entriesForThisFetch.concat(data.feed.entry);
								if (contactDataItem.lastModified) {
									data.feed.entry.forEach(function(entry) {
										
										var foundContactsIndex = -1;
										contactDataItem.contacts.some(function(contact, index) {
											if (entry.id["$t"] == contact.id["$t"]) {
												foundContactsIndex = index;
												return true;
											}
										});
										
										// contact was deleted so find and remove it from array
										if (entry["gd$deleted"]) {
											if (foundContactsIndex != -1) {
												console.log("removed: " + entry.id["$t"]);
												contactDataItem.contacts.splice(foundContactsIndex, 1);
											}
										} else {
											if (foundContactsIndex != -1) {
												// edited
												console.log("editing: " + entry.title["$t"]);
												contactDataItem.contacts[foundContactsIndex] = entry;
											} else {
												// added
												console.log("adding: " + entry.title["$t"]);
												contactDataItem.contacts.push(entry);
											}
										}
									});
								} else {
									contactDataItem.contacts = contactDataItem.contacts.concat(data.feed.entry);
								}
							}
							
							// while entries is smaller than total AND fail safe of 
							if (entriesForThisFetch.length < data.feed["openSearch$totalResults"]["$t"] && recursions++ < MAX_RECURSIONS) {
								getContactsByStartIndex(startIndex + ENTRIES_PER_PAGE).then(function(response) {
									resolve(response);
								}).catch(function(errorResponse) {
									throw errorResponse;
								});
							} else {
								resolve(data.feed);
							}
						} else {
							var error = "contacts feed missing 'feed' node: ";
							logError(error, data)
							reject(error + data);
						}
					}			
				}).catch(function(error) {
					reject("error getting contacts: " + error);
				});
			});
		}
		
		getContactsByStartIndex(1).then(function(response) {
			// update last modified date
			contactDataItem.lastModified = response.updated["$t"];
			
			contactDataItem.contacts.sort(function(a, b) {
				if (a.title["$t"] && !b.title["$t"]) {
					return -1;
				} else if (!a.title["$t"] && b.title["$t"]) {
					return 1;
				} else {
					if (a.updated["$t"] > b.updated["$t"]) {
						return -1;
					} else if (a.updated["$t"] < b.updated["$t"]) {
						return 1;
					} else {
						if (a.gd$phoneNumber && !b.gd$phoneNumber) {
							return -1;
						} else if (!a.gd$phoneNumber && b.gd$phoneNumber) {
							return 1;
						} else {
							return 0;
						}
					}
				}
			});
			
			console.log("contacts fetched for account " + userEmail + ": " + contactDataItem.contacts.length);
			resolve({contactDataItem:contactDataItem, contactsHaveBeenUpdated:contactsHaveBeenUpdated});
		}).catch(function(errorResponse) {
			reject(errorResponse);
		});
	});
}

function getContactsDataIndexByEmail(contactsData, email) {
	for (var a=0; a<contactsData.length; a++) {
		if (contactsData[a] && contactsData[a].userEmail == email) {
			return a;
		}
	}
	return -1;
}

function getPeopleDataIndexByEmail(peoplesData, email) {
	for (var a=0; a<peoplesData.length; a++) {
		if (peoplesData[a] && peoplesData[a].email == email) {
			return a;
		}
	}
	return -1;
}

function getContacts(params, callback) {
	var contactsData = Settings.read("contactsData");
	if (contactsData) {
		// maybe update
		if (params.account) {
			var dataIndex = getContactsDataIndexByEmail(contactsData, params.account.getAddress());
			if (dataIndex != -1) {
				callback({contacts:contactsData[dataIndex].contacts});
				//console.log("contacts from cache: " + params.account.getAddress());
			} else {
				callback({error:"Not found in cache"});
				console.log("not found")		
			}
		} else {
			callback({error:"No account passed"});
			console.log("not found")
		}
	} else {
		callback({error:"No cache created yet for contactsData"});
		console.log("no contactsdata; might have not been given permission");
	}
}

function getContact(params, callback) {
	var emailToFind;
	if (params.email) {
		emailToFind = params.email;
	} else {
		emailToFind = params.mail.authorMail;
	}	
	
	var found = false;
	var account;
	if (params.mail) {
		account = params.mail.account
	} else {
		account = params.account;
	}
	getContacts({account:account}, function(params) {
		if (params.contacts) {
			//console.log("contacts: ", params.contacts);
			$.each(params.contacts, function(index, contact) {
				//console.log("contact: ", contact);
				if (contact && contact.gd$email) {
					$.each(contact.gd$email, function(index, contactEmail) {
						if (contactEmail.address && emailToFind && contactEmail.address.toLowerCase() == emailToFind.toLowerCase()) {
							found = true;
							callback(contact);
							return false;
						}
						return true;
					});
					if (found) {
						return false;
					}
				} else {
					//console.warn("no email", contact);
				}
				return true;
			});
		}
		if (!found) {
			callback();
		}
	});
}

//set default icon images for certain emails etc.
function getPresetPhotoUrl(mail) {
	var url;
	if (mail && mail.authorMail) {
		if (mail.authorMail.indexOf("@jasonsavard.com") != -1) { // from forum etc.
			url = "/images/jason.png";
		} else if (mail.authorMail.indexOf("@twitter.com") != -1) {
			url = "/images/logos/twitter.png";
		} else if (mail.authorMail.indexOf("facebookmail.com") != -1) {
			url = "/images/logos/facebook.svg";
		} else if (mail.authorMail.indexOf("@pinterest.com") != -1) {
			url = "/images/logos/pinterest.png";
		} else if (mail.authorMail.indexOf("@linkedin.com") != -1) {
			url = "/images/logos/linkedin.png";
		}
	}
	return url;
}

function getContactPhoto(params, callback) {
	if (Settings.read("showContactPhoto")) {
		getContact(params, function(contact) {
			if (contact) {
				var account;
				if (params.mail) {
					account = params.mail.account;
				} else {
					account = params.account;
				}
				generateContactPhotoURL(contact, account).then(function(response) {
					response.realContactPhoto = true;
					callback(response);
				}).catch(function(error) {
					// no generated url so let's set a preset photo
					callback({photoUrl:getPresetPhotoUrl(params.mail)});
				});
			} else {
				callback({photoUrl:getPresetPhotoUrl(params.mail)});
			}
		});
	} else {
		callback({});
	}
}

function generateContactPhotoURL(contact, account) {
	return new Promise(function(resolve, reject) {
		var photoFound = false;

		var sendResponse = {};
		sendResponse.contact = contact;

		$.each(contact.link, function(a, link) {
			if (link.rel && link.rel.indexOf("#photo") != -1) {
				photoFound = true;
				bg.oAuthForContacts.generateURL(account.getAddress(), link.href).then(function(response) {
					sendResponse = response;
					sendResponse.photoUrl = response.generatedURL;
					resolve(sendResponse);
				}).catch(function(error) {
					reject(error);
				});
				return false;
			}
			return true;
		});
		
		if (!photoFound) {
			reject("photoNotFound");
		}		
	});
}

function convertGmailPrintHtmlToText($node) {
	// removing font tags because Gmail usuaully uses them for the footer/signature and/or the quoted text in the gmail print html 
	$node.find("font[color]").each(function() {
		$(this).remove();
	});

	var html = $node.html();
	
	// replace br with space
	html = html.replace(/<br\s*[\/]?>/gi, " ");
	
	// replace <p> and </p> with spaces
	html = html.replace(/<\/?p\s*[\/]?>/gi, " ");
	
	// add a space before <div>
	html = html.replace(/<\/?div\s*[\/]?>/gi, " ");
	
	// this is usually the greyed out footer/signature in gmail emails, so remove it :)
	//html = html.replace(/<font color=\"#888888\">.*<\/font>/gi, "");
	
	// this is apparently the quoted text
	//html = html.replace(/<font color=\"#550055\">.*<\/font>/gi, "");
	
	var text = html.htmlToText();
	
	// repace new lines with space
	text = text.replace(/\n/g, " ");
	
	// remove 2+ consecutive spaces
	text = text.replace(/\s\s+/g, " ");
	
	return $.trim(text);
}

// parse a string...
// english Wed, Jan 25, 2012 at 1:53 PM
// spanish 24 de septiembre de 2015, 3:28 p. m.
// danish 10. mar. 2012 13.00
// slovak 26. júna 2012 14:07
// english (UK) 22 July 2012 12:16
function parseGoogleDate(dateStr) {
	var d = new Date();

	var pieces = dateStr.match(/(\d\d?).*(\d\d\d\d)/);
	if (pieces) {
		var dateOfMonth = pieces[1];
		var year = pieces[2];
		d.setDate(dateOfMonth);
		
		// try to get month
		var monthFound = false;
		var pieces2 = dateStr.match(/([^ 0-9]{3}[^ 0-9]*) \d/); // atleast 3 non digits ie. letters or more ie. Feb OR  Feb. OR February
		if (!pieces2) { // try the spanish dates 24 de septiembre de 2015, 3:28 p. m.
			pieces2 = dateStr.match(/([^ 0-9]{3}[^ 0-9]*) /);
		}
		if (pieces2 && pieces2.length >= 2) {
			var shortMonthName = pieces2[1];
			shortMonthName = shortMonthName.replace(".", "").substring(0, 3).toLowerCase();
			
			for (var a=0; a<dateFormat.i18n.monthNamesShort.length; a++) {
				if (dateFormat.i18n.monthNamesShort[a].toLowerCase().substring(0, 3) == shortMonthName) {
					d.setMonth(a);
					monthFound = true;
					break;
				}
			}
		}
		
		if (!monthFound) {
			// since couldn't detect the month str we assume it's this month but if the dateof the month is larger than today let's assume it's last month
			if (year == d.getFullYear() && dateOfMonth > d.getDate()) {
				d.setMonth(d.getMonth()-1);
			}
		}
		d.setFullYear(year);
		
		// now get the time
		var timeObj = dateStr.parseTime();
		if (timeObj) {		
			// merge date and time
			d.setHours(timeObj.getHours());
			d.setMinutes(timeObj.getMinutes());
			d.setSeconds(timeObj.getSeconds());
			return d;
		} else {
			// could not find time in str
			return null;
		}
	}	
	return null;
}

function initButtons(buttons) {
	if (!buttons) {
		buttons = Settings.read("buttons");
	}
	
	$("html").removeClass("buttonsoriginal");
	$("html").removeClass("buttonsgreen");
	$("html").removeClass("buttonsdark");
	$("html").removeClass("buttonscustom");
	
	$("html").addClass("buttons" + buttons);
	
	if (buttons == "custom") {
		var $images = $('.button div:empty');
		var $text = $('.button div:not(:empty)');
		
		$images.css('-webkit-filter', Settings.read("buttonFilter"));
		$text.css('-webkit-filter', Settings.read("buttonFilter").replace(/drop-shadow.*?\)/, ""));
	} else {
		$(".button div").css('-webkit-filter', "");
	}

}

function showHideButtons() {
	
	var buttonCount = 0;
	
	// show/hide buttons
	if (Settings.read("showStar")) {
		// not a button so don't count
	} else {
		$(".mail .star, .basicNotificationWindow .star").hide();
	}
	if (Settings.read("showArchive")) {
		buttonCount++;
	} else {
		$(".mail .archive, .basicNotificationWindow .archive").hide();
	}
	if (Settings.read("showSpam")) {
		buttonCount++;
	} else {
		$(".mail .spam, .basicNotificationWindow .spam").hide();
	}
	if (Settings.read("showDelete")) {
		buttonCount++;
	} else {
		$(".mail .delete, .basicNotificationWindow .delete").hide();
	}
	if (Settings.read("showReply")) {
		buttonCount++;
	} else {
		$(".mail .reply, .basicNotificationWindow .reply").hide();
	}
	if (Settings.read("showOpen")) {
		buttonCount++;
	} else {
		$(".mail .open, .basicNotificationWindow .open").hide();
	}
	if (Settings.read("showMarkAsRead")) {
		buttonCount++;
	} else {
		$(".mail .markAsRead").addClass("alwaysHide");
	}
	if (Settings.read("showMarkAsUnread")) {
		// don't count this one
	} else {
		$(".mail .markAsUnread").addClass("alwaysHide");
	}
	
	if (Settings.read("showStar") || buttonCount >= 5) {
		$("html").addClass("lotsOfButtons");
	}
}

function setAccountGradient($node, colorStart, colorEnd) {
	$node.css("background-image", "-webkit-gradient( linear, left bottom, right bottom, color-stop(0.28, " + colorStart + "), color-stop(0.64, " + colorEnd + "))");
}

function sendMessageToCalendarExtension(message) {
	return new Promise(function(resolve, reject) {
		var recipientExtensionId;
		if (chrome.runtime.id == ExtensionId.LocalGmail) {
			recipientExtensionId = ExtensionId.LocalCalendar;
		} else {
			recipientExtensionId = ExtensionId.Calendar;
		}
		
		chrome.runtime.sendMessage(recipientExtensionId, message, function(response) {
			if (chrome.runtime.lastError) {
				console.error("sendMessageToGmailExtension error: " + chrome.runtime.lastError.message);
				reject({notListening:true, error:chrome.runtime.lastError.message});
			} else {
				console.log("response", response);
				resolve(response);
			}
		});
	});
}

function setDNDEndTime(endTime, fromOtherExtension) {
	Settings.store("DND_endTime", endTime);
	updateBadge();
	
	if (!fromOtherExtension && Settings.read("syncDND")) {
		sendMessageToCalendarExtension({action:"setDNDEndTime", endTime:endTime.toJSON()});
	}
}

function setDND_off(fromOtherExtension) {
	if (Settings.read("DND_endTime")) {
		Settings.delete("DND_endTime");
	} else {
		Settings.delete("DND_schedule");
	}
	updateBadge();

	if (!fromOtherExtension && Settings.read("syncDND")) {
		sendMessageToCalendarExtension({action:"turnOffDND"});
	}
}

function setDND_minutes(minutes) {
	var dateOffset = new Date();
	dateOffset.setMinutes(dateOffset.getMinutes() + parseInt(minutes));
	setDNDEndTime(dateOffset);
}

function setDND_today() {
	var tom = tomorrow();
	tom.setHours(7);
	tom.setMinutes(0);
	setDNDEndTime(tom);
}

function openDNDScheduleOptions() {
	chrome.tabs.create({url:"options.html?highlight=DND_schedule"});
}

function setDND_indefinitely() {
	var farOffDate = new Date();
	farOffDate.setYear(2999);
	setDNDEndTime(farOffDate);
}

function getDNDState() {
	return new Promise(function(resolve, reject) {
		chrome.windows.getCurrent(function(currentWindow) {
			var dndByFullscreen;
			if (!chrome.runtime.lastError) {
				dndByFullscreen = currentWindow && currentWindow.state == "fullscreen" && Settings.read("dndInFullscreen");
			}
			resolve(isDNDbyDuration() || isDNDbySchedule() || dndByFullscreen);
		});
	});
}

function isDNDbyDuration() {
	var endTime = Settings.read("DND_endTime");
	return endTime && endTime.isAfter();
}

function isBetweenHours(startHour, endHour) {
	var betweenHours = false;
	
	// Check is different depending on start/end time precedance
	if (startHour < endHour) { // this is for ie. 1am to 6am
		if (startHour <= now().getHours() && now().getHours() < endHour) {
			betweenHours = true;
		}
	} else {
		if (startHour <= now().getHours() || now().getHours() < endHour) {
			betweenHours = true;
		}
	}
	
	return betweenHours;
}

function isDNDbySchedule() {
	var passedDNDRules = true;
	var startHour;
	var endHour;

	if (Settings.read("DND_schedule")) {
		
		var today = new Date();
		
		// sat-sun
		if (today.getDay() == 6 || today.getDay() == 0) {
			startHour = parseInt(Settings.read("DND_scheduleWeekendStartHour"));
			endHour = parseInt(Settings.read("DND_scheduleWeekendEndHour"));
			passedDNDRules = !isBetweenHours(startHour, endHour);
		} else { // mon-fri
			startHour = parseInt(Settings.read("DND_scheduleStartHour"));
			endHour = parseInt(Settings.read("DND_scheduleEndHour"));
			passedDNDRules = !isBetweenHours(startHour, endHour);
		}
		
	}
	
	// reverse logic here
	return !passedDNDRules;
}

function getPopupWindowSpecs(params) {
	params = initUndefinedObject(params);
	if (!params.window) {
		params.window = window;
	}
	var specs = "";
	if (Settings.read("setPositionAndSize") || params.testingOnly) {
		specs += "left=" + (params.window.screen.availLeft+parseInt(Settings.read("popupLeft"))) + ",";
		specs += "top=" + (params.window.screen.availTop+parseInt(Settings.read("popupTop"))) + ",";
		specs += "width=" + Settings.read("popupWidth") + ",";
		specs += "height=" + Settings.read("popupHeight") + ",";
	} else {
		if (!params.width) {
			params.width = Settings.read("popupWidth"); 
		}
		if (!params.height) {
			params.height = Settings.read("popupHeight"); 
		}
	   
		specs += "left=" + (params.window.screen.availLeft+(params.window.screen.width/2)-(params.width/2)) + ",";
		specs += "top=" + (params.window.screen.availTop+(params.window.screen.height/2)-(params.height/2)) + ",";
		specs += "width=" + params.width + ",";
		specs += "height=" + params.height + ",";
	}
	return specs;
}

function generateComposeUrl(params) {

	var url;
	
	function generateRecipients(recipientsArray) {
	   var str = "";
	   for (var a=0; a<recipientsArray.length; a++) {
		   str += recipientsArray[a].email;
		   if (a < recipientsArray.length-1) {
			   str += ",";
		   }
	   }
	   return str;
	}
   
	if (Settings.read("useBasicHTMLView")) {
		url = params.account.getMailUrl({urlParams:"v=b&pv=tl&cs=b&f=1"});
	} else {
		// using /u/1 etc. defaults to /u/0 always, so must use authuser
		url = params.account.getMailUrl({urlParams:"view=cm&fs=1&tf=1&authuser=" + encodeURIComponent(params.account.getAddress())});
	}
   
	if (params.to) {
		params.tos = [params.to];
	}
   
	if (params.generateReplyAll && params.replyAll) {
		if (params.replyAll.tos) {
			url += "&to=" + encodeURIComponent(generateRecipients(params.replyAll.tos));
		}
		if (params.replyAll.ccs) {
			url += "&cc=" + encodeURIComponent(generateRecipients(params.replyAll.ccs));
		}
	} else {
		if (params.tos) {
			url += "&to=" + encodeURIComponent(params.tos.first().email);
		}
	}
	if (params.subject) {
		url += "&su=" + encodeURIComponent(params.subject);
	}
	if (params.message) {
		url += "&body=" + encodeURIComponent(params.message);
	}
   
	return url;
}

function openTabOrPopup(params) {
	if (params.account && params.account.mustResync) {
		chrome.tabs.create({url:params.url});
	} else {
		var url;
		if (params.showReplyAllOption) {
			url = "compose.html";
		} else {
			url = params.url;
		}
		if (Settings.read("openComposeReplyAction") == "tab") {
			chrome.tabs.create({url:url});
		} else {
			var specs = getPopupWindowSpecs(params);
			if (!params.window) {
				params.window = window;
			}
			params.window.open(url, params.name, specs);
		}
	}
} 

function ensureUserHasUnreadEmails(callback) {
	if (bg.unreadCount) {
		callback({hasUnreadEmails:true});
	} else {
		bg.pollAccounts().then(function() {
			callback({hasUnreadEmails:bg.unreadCount});
		});
	}
}

function showNotificationTest(params, callback) {
	params = initUndefinedObject(params);
	callback = initUndefinedCallback(callback);
	
	ensureUserHasUnreadEmails(function(response) {
		if (response.hasUnreadEmails) {
			
			if (params.showAll) {
				// fetch all unread emails
				params.emails = getAllUnreadMail(bg.accounts);
			} else {
				// first only one unread email			
				var email;
				if (bg.accountWithNewestMail) {
					email = bg.accountWithNewestMail.getNewestMail();			
					if (!email) {
						// else get most recent mail (not the newest because it might not have been fetch recently, this shwnotif could be done after a idle etc.)
						email = bg.accountWithNewestMail.getMail().first();
					}
				}
				if (!email) {
					email = getAnyUnreadMail();
				}
				
				// put one email into array to pass to shownotification
				params.emails = [email];
			}
			
			function showNotificationNow() {
				bg.showNotification(params).then(warning => {
					if (warning) {
						niceAlert(warning);
					}
					callback();
				}).catch(error => {
					niceAlert("Error: " + error + " You might have disabled the notifications.");
					callback();
				});
			}
			
			if (bg.notification) {
				bg.notification.close();
				setTimeout(function() {
					showNotificationNow();
				}, 500);
			} else {
				showNotificationNow();				
			}
		} else {
			openGenericDialog({
				content: params.requirementText
			}).then(function() {
				callback();
			});
		}
	});
}

function insertSpeechRecognition(tabId) {
	chrome.tabs.insertCSS(tabId, {file:"css/speechRecognition.css"}, function() {
		chrome.tabs.executeScript(tabId, {file:"js/jquery.js"}, function() {
			if (chrome.runtime.lastError) {
				console.warn(chrome.runtime.lastError.message);
			} else {
				chrome.tabs.executeScript(tabId, {file:"js/speechRecognition.js", allFrames:false});
			}
		});
	});
}

function daysElapsedSinceFirstInstalled() {
	var installDate = bg.Settings.read("installDate");
	if (installDate) {
		try {
			installDate = new Date(installDate);
		} catch (e) {}
		if (installDate) {
			return Math.abs(installDate.diffInDays());
		}
	}
	return -1;
}

function isEligibleForReducedDonation(mightBeShown) {
	
	if (TEST_REDUCED_DONATION) {
		return true;
	}
	
	// not eligable if we already d or we haven't verified payment
	if (pref("donationClicked") || !localStorage["verifyPaymentRequestSentForReducedDonation"]) {
		return false;
	} else {
		if (daysElapsedSinceFirstInstalled() >= 14) { // 14 days
			
			// when called from shouldShowReducedDonationMsg then we can assume we are going to show the ad so let's initialize the daysElapsedSinceEligible
			if (mightBeShown) {
				// stamp this is as first time eligibility shown
				var daysElapsedSinceEligible = localStorage.daysElapsedSinceEligible;
				if (!daysElapsedSinceEligible) {
					localStorage.daysElapsedSinceEligible = new Date();				
				}
			}
			
			return true;
		} else {
			return false;
		}
	}
}

// only display eligible special for 1 week after initially being eligiable (but continue the special)
function isEligibleForReducedDonationAdExpired(mightBeShown) {

	if (TEST_REDUCED_DONATION) {
		return false;
	}
	
	if (localStorage.reducedDonationAdClicked) {
		return true;
	} else {
		var daysElapsedSinceEligible = localStorage.daysElapsedSinceEligible;
		if (daysElapsedSinceEligible) {
			daysElapsedSinceEligible = new Date(daysElapsedSinceEligible);
			if (Math.abs(daysElapsedSinceEligible.diffInDays()) <= 7) {
				return false;
			} else {
				return true;
			}
		}
		return false;
	}
}

function shouldShowReducedDonationMsg(ignoreExpired) {
	if (isEligibleForReducedDonation(true)) {
		if (ignoreExpired) {
			return true;
		} else {
			return !isEligibleForReducedDonationAdExpired();
		}
	}
	//return isEligibleForReducedDonation(true) && !isEligibleForReducedDonationAdExpired();
}

function verifyPayment(accounts, callback) {
	var emails = new Array();
	$.each(accounts, function(i, account) {
		emails.push(account.getAddress());
	});

	bg.Controller.verifyPayment(ITEM_ID, emails, callback);
}

/*
function parseAddresses(addresses) {
	var parsedAddresses = [];
	
	if (addresses) {
		var addressesArray = addresses.split(",");
		$.each(addressesArray, function(index, address) {
			address = address.replace(/\n/g, "")
			
			var fromName = address.split("<")[0];
			fromName = fromName.split("@")[0];
			
			fromName = fromName.replace(/\"/g, "");
			fromName = fromName.replace(/</g, "");
			fromName = fromName.replace(/>/g, "");
			fromName = fromName.replace("&quote;", "");
			fromName = $.trim(fromName);
			// remove ' from start and end
			fromName = fromName.replace(/^'/, "").replace(/'$/, "");
	
			var fromEmail = extractEmails(address);
			if (fromEmail) {
				fromEmail = fromEmail.first();
			}
			
			// there could have been a comma in the to header which wrongly split the name/email pairs as such:      To: "Jason,Savard" <blah@gmail.com>, "Other" <other@gmail.com>
			if (!fromEmail) {
				// make sure were not at end of array
				if ((index+1) < addressesArray.length) {
					addressesArray[index+1] = addressesArray[index] + "," + addressesArray[index+1];
				} else {
					// could be an empy from like  "from: <>"  so push empty object so we don't create null errors in the rest of the code
					parsedAddresses.push({});
				}
			} else {
				// name might have been the same as email ie.  "<blah@hec.ca>" <bkah@hec.ca>   so let's extract the email username
				if (!fromName) {
					fromName = fromEmail.split("@")[0];
				}
				parsedAddresses.push({name:fromName, email:fromEmail});
			}
			
		});
	}
	
   	return parsedAddresses;
	
	
}
*/

function hasUTFChars(str) {
    var rforeign = /[^\u0000-\u007f]/;
    return !!rforeign.test(str);
};

function encodePartialMimeWord(str, encoding, maxlen) {
	var charset = "utf-8";
	
    return str.replace(/[^\s]*[^\s\w\?!*=+-]+[^\s]*(\s+[^\s]*[^\s\w\?!*=+-]+[^\s]*)*/g, (function(str) {
        if (!str.length) {
            return '';
        }

        return mimelib.encodeMimeWord(str, encoding, charset, maxlen)
            .replace(/[^\w\s\?!*=+-]/g, function(chr) {
                var code = chr.charCodeAt(0);
                return "=" + (code < 0x10 ? "0" : "") + code.toString(16).toUpperCase();
            });
    }).bind(this));
};

function convertAddress(address, doNotEncode) {
	var mustEncode = !doNotEncode;
	
	// set them to variables because we don't want to modify the address obj
	var name = address.name;
	var email = address.email;
	email = email.toLowerCase();
	
    // if user part of the address contains foreign symbols
    // make a mime word of it
	if (mustEncode) {
		email = email.replace(/^.*?(?=\@)/, (function(user) {
			if (hasUTFChars(user)) {
				return mimelib.encodeMimeWord(user, "Q", charset);
			} else {
				return user;
			}
		}).bind(this));
	}

    // If there's still foreign symbols, then punycode convert it
    if (mustEncode && hasUTFChars(email)) {
    	// commented because i forget where i got toPunycode ??
        //email = toPunycode(email);
    }

    if (!name) {
        return email;
    } else if (name) {
    	name = $.trim(name);
    	// if name contains a comma ie. Savard, Jason    AND it is not already quoted then let's wrap quotes around it or else we get invalid to header
    	if (name.indexOf("\"") != 0 && name.indexOf(",") != -1) {
    		name = "\"" + name + "\"";
    	}
        if (mustEncode && hasUTFChars(name)) {
            name = encodePartialMimeWord(name, "Q", 52);
        }
        return name + ' <' + email + '>';
    }
};

function pretifyRecipientDisplay(recipientObj, meEmailAddress, includeEmail) {
	var str = "";
	
	// it's this account's email so put 'me' instead
	if (!includeEmail && recipientObj.email && recipientObj.email.equalsIgnoreCase(meEmailAddress)) {
		str += getMessage("me");
	} else {
		if (recipientObj.name) {
			str += recipientObj.name.getFirstName();
			// it's possible gmail print include name with @ so let's spit it here ALSO
			str = str.split("@")[0];
		}
	}

	if (includeEmail) {
		str += " ";
	}
	
	if (!str && !includeEmail) {
		if (recipientObj.email) {
			str += recipientObj.email.split("@")[0];
		}
	} else if (includeEmail) {
		str += "&lt;" + recipientObj.email + "&gt;";
	}
	
	str = str.replace(/</g, "");
	str = str.replace(/>/g, "");
	
	str = "<span title='" + recipientObj.email + "'>" + str + "</span>";
	
	return str;
}

/*
function getSignedInGmailEmails(params, callback) {
	
	var signedInGmailEmails = Settings.read("signedInGmailEmails");
	if (!params.forceResyncAccounts && signedInGmailEmails) {
		console.log("getSignedInGmailEmails [from cache]");
		callback({emails:signedInGmailEmails});
		return;
	} else {
		console.log("getSignedInGmailEmails");
	}
	
	var MAX_ACCOUNTS = 10;
	if (params.accountIndex == undefined) {
		params.accountIndex = 0;
	} else {
		params.accountIndex++;
	}
	if (!params.emails) {
		params.emails = [];
	}
	
	if (params.accountIndex < MAX_ACCOUNTS && isOnline()) {
		console.log("fetch emails for index: " + params.accountIndex);
		$.ajax({
			type: "GET",
			dataType: "text",
			url: MAIL_DOMAIN + MAIL_PATH + "u/" + params.accountIndex + "/feed/atom?timestamp=" + Date.now(),
			timeout: 5000,
			complete: function(jqXHR, textStatus) {
				if (textStatus == "success") {				
					var parser = new DOMParser();
				   	parsedFeed = $(parser.parseFromString(jqXHR.responseText, "text/xml"));
				   
				   	var titleNode = parsedFeed.find('title');
				   	if (titleNode.length >= 1) {
					   	var mailTitle = $(titleNode[0]).text().replace("Gmail - ", "");
					   	// patch because <title> tag could contain a label with a '@' that is not an email address ie. Gmail - Label '@test@' for blah@gmail.com
					   	var emails = mailTitle.match(/([\S]+@[\S]+)/ig);
					   	var email = emails.last();
	
						params.emails.push(email);
	
					   	getSignedInGmailEmails(params, callback);
				   	} else {
				   		var error = "Could not find title node from feed";
				   		logError(error);
				   		callback({error:error});
				   	}				
				} else {
					if (jqXHR.status == 401 || textStatus.toLowerCase() == "unauthorized") {
						// finally reached an unauthorized account so should be the end, let's exit recursion
						Settings.store("signedInGmailEmails", params.emails);
						callback(params);
					} else {						
						// could be timeout so skip this one and keep going
						console.warn("could be timeout so skip this one and keep going: ", textStatus, jqXHR);
						getSignedInGmailEmails(params, callback);
					}
				}
			}
		});
	} else {
		var error = "max accounts reached or not online";
		logError(error);
		callback({error:error});
	}
}
*/

/*
function syncSignedInAccountNumbers(params, callback) {	
	console.log("syncSignedInAccountNumbers");
	getSignedInGmailEmails(params, function(params) {
		if (params.error) {
			callback(params);
		} else {
			console.log("gmail emails: ", params.emails);
			
			$.each(accounts, function(index, account) {
				var accountMatchedSignedInEmail = false;
				console.log("account", account);
				$.each(params.emails, function(signedInEmailIndex, signedInEmail) {
					console.log("signedInEmail", signedInEmail);
					if (account.getAddress().equalsIgnoreCase(signedInEmail)) {
						console.log("signedInEmailIndex", signedInEmailIndex);
						account.setAccountId(signedInEmailIndex);
						accountMatchedSignedInEmail = true;
					}
				});
				if (!accountMatchedSignedInEmail) {
					// this is account is not detected so set an unmatch index to force google's sign in page
					account.setAccountId(UNSYNCHED_ACCOUNT_ID);
				}
			});
			
			callback(params);
		}
	});
}
*/

function generateNotificationDisplayName(mail) {
	var fromName = mail.authorName;
	if (Settings.read("notificationDisplayName") == "firstNameOnly") {		
		var firstName = fromName.getFirstName();
		if (firstName.endsWith("'s")) { // ie. Jason's App forum
			// don't just use (Jason's)
			// instead use the whole name in this case
		} else {
			fromName = firstName;
		}
	}
	return fromName;
}

// point relative links ONLY to gmail.com
function fixRelativeLinks($node) {
	$node.find("a, img, imghidden").each(function() {
		var href = $(this).attr("href");
		var src = $(this).attr("src");
		if (href && href.indexOf("/") == 0) {
			$(this).attr("href", MAIL_DOMAIN + href);
			// these are hosted on mail.google.com so the are safe to show
			if ($(this)[0].tagName == "IMGHIDDEN") {
				$(this).changeNode("img");
			}
		} else if (src && src.indexOf("/") == 0) {
			$(this).attr("src", MAIL_DOMAIN + src);
			// these are hosted on mail.google.com so the are safe to show
			if ($(this)[0].tagName == "IMGHIDDEN") {
				$(this).changeNode("img");
			}
		}
	});
}

function getAllUnreadMail(accounts) {
	var allUnreadMails = [];
	$.each(accounts, function(index, account) {
		allUnreadMails = allUnreadMails.concat(account.getMail());
	});
	return allUnreadMails;
}

function formatEmailNotificationTitle(fromName, subject) {
	var title = fromName;
	if (subject) {
		title += " - " + subject;
	}
	return title;
}

function loadImage($image, callback) {
	return new Promise(function(resolve, reject) {
		$image
			.load(function() {
				resolve($image);
			})
			.error(function(e) {
				reject(e);
			})
		;
	});
}

function getActiveAccounts(accounts) {
	return accounts.filter(function(account, index, ary) {
		return !account.getSetting("ignore");
	});
}

function getFirstActiveAccount(accounts) {
	if (accounts) {
		return getActiveAccounts(accounts).first();
	}
}

function getFirstActiveEmail(accounts) {
	var firstActiveAccount = getFirstActiveAccount(accounts);
	if (firstActiveAccount) {
		return firstActiveAccount.getAddress();
	}
}

function getAccountsWithErrors(accounts) {
	return accounts.filter(function(account, index, ary) {
		return account.error;
	});
}

function getAccountsWithoutErrors(accounts) {
	return accounts.filter(function(account, index, ary) {
		return !account.error;
	});
}

function getAnyUnreadMail() {
	var unreadMail;
	$.each(bg.accounts, function(i, account) {
		if (!account.error) {
			if (account.getUnreadCount() > 0) {
				unreadMail = account.getMail().first();
				// exit loop
				return false;
			}
		}
	});
	return unreadMail;
}

function getAccountsWithUnreadMail(accounts) {
	var accountsWithUnreadMail = [];
	
	$.each(accounts, function(i, account) {
		if (!account.error) {
			if (account.getUnreadCount() > 0) {
				accountsWithUnreadMail.push(account);
			}
		}
	});
	
	return accountsWithUnreadMail;
}

// extracts message id from offline url, ex. https://mail.google.com/mail/mu/mp/166/#cv/Inbox/145994dc0db175a4
function extractMessageIdFromOfflineUrl(url) {
	var matches = url.match(/\/([^\/]+$)/);
	if (matches && matches.length >= 2) {
		return isHex(matches[1]);
	}
}

function initOauthAccounts() {
	bg.accounts = Settings.read("accounts");
	if (!bg.accounts) {
		bg.accounts = [];
	}
	
	// copy array (remove reference to Settings.read) acocunts could be modified and since they were references they would also modify the Settings.read > cache[]  So if we called Settings.read on the same variable it would return the modified cached variables instead of what is in actual storage
	bg.accounts = bg.accounts.slice();
	
	if (bg.accounts) {
		bg.accounts.forEach(function(account, i) {
			console.log("account: ", account);
			bg.accounts[i] = new bg.MailAccount({accountNumber:account.id, mailAddress:account.email});
		});
	} else {
		bg.accounts = [];
	}
}

function reinitOauthAccount(account) {
	bg.accounts.some(function(thisAccount, i) {
		if (thisAccount.getAddress() == account.getAddress()) {
			bg.accounts[i] = new bg.MailAccount({accountNumber:account.id, mailAddress:account.getAddress()});
			return true;
		}
	});
}

function serializeOauthAccounts() {
	// save only email addresses (because i cannot serialize accounts objects with functions)
	var accountsToSerialize = [];
	bg.accounts.forEach(function(account) {
		var account = {id:account.id, email:account.getAddress()};
		accountsToSerialize.push(account);
	});
	
	Settings.store("accounts", accountsToSerialize);
}

function getSignInUrl() {
	// See if any of the email accounts have set the option openLinksToInboxByGmail
	var atleastOneAccountIsUsingInboxByGmail;
	var emailSettings = Settings.read("emailSettings");
	for (email in emailSettings) {
		if (emailSettings[email].openLinksToInboxByGmail) {
			atleastOneAccountIsUsingInboxByGmail = true;
			break;
		}
	}
	   
	var url;
	if (atleastOneAccountIsUsingInboxByGmail) {
		url = INBOX_BY_GMAIL_DOMAIN;
	} else {
		url = MAIL_DOMAIN;
	}
	return url;
}

function ButtonIcon() {
	var self = this;
	
	var canvas = bg.document.getElementById('buttonIconCanvas');
	canvas.width = canvas.height = 19;
	
	var canvasContext = canvas.getContext('2d');
	
	var rotation = 1;
	var factor = 1;
	var animTimer;
	var animDelay = 40;
	var animActive;
	var lastSetIconParams = {};

	var customButtonIconCanvas = document.createElement("canvas");
	var customButtonIconRetinaCanvas = document.createElement("canvas");
	
	function getImageData(img, imageDataCanvas, width, height) {
		var context = imageDataCanvas.getContext("2d");
		context.clearRect(0, 0, imageDataCanvas.width, imageDataCanvas.height);
		context.drawImage(img, 0, 0, width, height);
		var imageData = context.getImageData(0, 0, width, height);
		return imageData;
	}

	this.setIcon = function(params) {
		//console.log("setIcon");
		if (!params) {
			params = lastSetIconParams;
		} else if (params.force) {
			params = lastSetIconParams;
			params.force = true;
		}

		//console.log("params: " + JSON.stringify(params));
		//console.log("last  : " + JSON.stringify(lastSetIconParams));
		if (!params.force && JSON.stringify(params) == JSON.stringify(lastSetIconParams)) {
			//console.log("setIcons cached");
			return;
		}

		var iconSet = Settings.read("icon_set");
		
		if (iconSet == "custom") {
			var src = self.generateButtonIconPath(params);
			
			var img = new Image();
			if (src) {
				img.src = src;
			} else {
				img.src = "images/browserButtons/default/no_new.png";
			}
			console.log("img src: " + img.src);
			
			// use only the 1st 100 characters of the dataurl to identify this icon (because want to save stinrigying on every seticon call)
			var lastSrcId = img.src.substring(0, 100) + "JCutShort";
			if (lastSrcId != lastSetIconParams.src || params.force) {
				lastSetIconParams.src = lastSrcId;

				loadImage($(img)).then(function() {
					var imageData19 = getImageData(img, customButtonIconCanvas, 19, 19);
					var imageData38 = getImageData(img, customButtonIconRetinaCanvas, 38, 38);
					
					chrome.browserAction.setIcon({imageData: {'19':imageData19, '38':imageData38} });
				});
			} else {
				console.log("cached src");
			}
			
		} else {
			if (iconSet == "default") {
				var retinaParams = clone(params);
				retinaParams.retina = true;
				// supports retina
				chrome.browserAction.setIcon({ path: {
						"19": self.generateButtonIconPath(params),
						"38": self.generateButtonIconPath(retinaParams)
					}
				});
			} else {
				chrome.browserAction.setIcon({ path: self.generateButtonIconPath(params) });
			}
		}
		lastSetIconParams = params;
		delete lastSetIconParams.force;
	}
	
	this.startAnimation = function(params) {
		console.log("start animation")
		params = initUndefinedObject(params);
		params.unread = true;
		
		if (Settings.read("animateButtonIcon") === true || params.testAnimation) {
			self.stopAnimation();

			var image = new Image();
			
			if (Settings.read("icon_set") == "custom") {
				var src = Settings.read("customButtonIconUnread");
				if (!src) {
					src = Settings.read("customButtonIconNoUnread");
				}
				if (!src) {
					src = "images/browserButtons/default/new.png";
				}
				image.src = src;
			} else {
				image.src = self.generateButtonIconPath(params);
			}
			
			loadImage($(image)).then(function() {
				
				if (Settings.read("icon_set") == "custom") {
					// use 19px image for rotating
					getImageData(image, customButtonIconCanvas, 19, 19);
					image.src = customButtonIconCanvas.toDataURL();
				}
				
				animActive = true;
				
				if (animTimer) {
					// fix for constantly animating icon: because of the synchronous loadImage above we must make sure to cancel the previous interval. note: calling startAnimate twice in a rows created the bug ie. buttonIcon.startAnimation(); buttonIcon.startAnimation() 
					clearInterval(animTimer);
				}
				animTimer = setInterval(function() {
				   canvasContext.save();
				   canvasContext.clearRect(0, 0, canvas.width, canvas.height);
				   canvasContext.translate(Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
				   canvasContext.rotate(rotation * 2 * Math.PI);
				   canvasContext.drawImage(image, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
				   canvasContext.restore();
				
				   rotation += 0.03 * factor;
				
				   if (rotation <= 0.9 && factor < 0) {
					   factor = 1;
				   } else if (rotation >= 1.1 && factor > 0) {
					   factor = -1;
				   }
				
				   chrome.browserAction.setIcon({imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)});
				}, animDelay);
				
				setTimeout(function() {
					self.stopAnimation(params);
				}, seconds(2));
			});
		}
	}

	this.stopAnimation = function(params) {
		//console.log("stopAnimation");
		params = initUndefinedObject(params);
		
		if (animTimer != null) {
			//console.log("stopAnimation - clearinterface");
			clearInterval(animTimer);
		}
		
		if (animActive) {
			lastSetIconParams.force = true;
			self.setIcon(lastSetIconParams);
		}

		rotation = 1;
		factor = 1;
		
		animActive = false;
	}

	this.generateButtonIconPath = function(params) {
		params = initUndefinedObject(params);
		
		var src;

		if (Settings.read("icon_set") == "custom") {
			if (params.signedOut) {
				src = Settings.read("customButtonIconSignedOut");
				if (!src) {
					src = Settings.read("customButtonIconNoUnread");
				}
			} else if (params.unread) {
				var src = Settings.read("customButtonIconUnread")
				if (!src) {
					src = Settings.read("customButtonIconNoUnread");
				}
			} else {
				src = Settings.read("customButtonIconNoUnread");
			}
		} else {
			src = "images/browserButtons/" + Settings.read("icon_set") + "/";
			if (params.signedOut) {
				src += "not_logged_in";
			} else if (params.unread) {
				src += "new";
			} else {
				src += "no_new";
			}
			if (params.retina) {
				src += "_retina";
			}
			src += ".png";
		}

		return src;
	}
	
}

function resetSettings(accounts) {
	var emailSettings = Settings.read("emailSettings");
	if (!emailSettings) {
		emailSettings = {};
	}

	accounts.forEach(function(account) {
		// Must reset these values because the label names are different from the ids that are being used in oauth
		var emailSetting = emailSettings[account.getAddress()];
		if (!emailSetting) {
			emailSetting = {};
		}
		emailSetting.ignore = false;
		emailSetting.monitorLabel = null;
		emailSetting.openLabel = null;
		emailSetting.notifications = {};
		emailSetting.sounds = {};
		emailSetting.voices = {};
		emailSetting.tabs = {};
	});
	
	Settings.store("emailSettings", emailSettings);
}

function openGmail(accounts) {
	var firstActiveAccount = getFirstActiveAccount(accounts);
	if (firstActiveAccount) {
		firstActiveAccount.openInbox();
	} else {
		chrome.tabs.create({ url: MAIL_DOMAIN });
	}
}

function openQuickCompose() {
	if (Settings.read("quickComposeEmail")) {
		var params = {};
		params.to = {email:Settings.read("quickComposeEmail")};
		getFirstActiveAccount(bg.accounts).openCompose(params);
	} else {
		chrome.tabs.create({url:"options.html?highlight=quickContact#general"});
	}
}

function sendPageLinkToContact(info, tab, email) {
	if (Settings.read("quickComposeEmail")) {
		var params = generateSendPageParams(info, tab);
		params.to = {email:Settings.read("quickComposeEmail")};
		getFirstActiveAccount(accounts).openCompose(params);
	} else {
		chrome.tabs.create({url:"options.html?highlight=quickContact#general"});
	}
}

function removeContextMenu(id) {
	if (id) {
		console.log("remove context: " + id);
		chrome.contextMenus.remove(id);
	}
}

function initQuickContactContextMenu(params) {
	params = initUndefinedObject(params);
	
	var quickComposeEmail = Settings.read("quickComposeEmail");
	var quickComposeEmailAlias = Settings.read("quickComposeEmailAlias");

	var quickComposeEmailContextMenuLabel;
	var emailPageLinkToContactLabel;
	var emailPageLinkToContactWithMessageLabel;
	
	if (quickComposeEmailAlias) {
		quickComposeEmailContextMenuLabel = getMessage("email") + " " + quickComposeEmailAlias;
		emailPageLinkToContactLabel = getMessage("sendPageLinkTitle") + " " + getMessage("to") + " " + quickComposeEmailAlias;
		emailPageLinkToContactWithMessageLabel = getMessage("sendPageLinkTitle") + " " + getMessage("to") + " " + quickComposeEmailAlias + " with message...";
	} else if (quickComposeEmail) {
		quickComposeEmailContextMenuLabel = getMessage("email") + " " + quickComposeEmail;
		emailPageLinkToContactLabel = getMessage("sendPageLinkTitle") + " " + getMessage("to") + " " + quickComposeEmail;
		emailPageLinkToContactWithMessageLabel = getMessage("sendPageLinkTitle") + " " + getMessage("to") + " " + quickComposeEmail + " with message...";
	} else {
		quickComposeEmailContextMenuLabel = getMessage("quickComposeEmail");
	}

	// remove them all and just re-add them
	if (params.update) {
		removeContextMenu(bg.quickComposeEmailMenuId);
		removeContextMenu(bg.sendPageLinkMenuId);
		removeContextMenu(bg.sendPageLinkToContactMenuId);
		removeContextMenu(bg.sendPageLinkToContactWithMessageMenuId);
	}

	// Email [user] ...
	bg.quickComposeEmailMenuId = chrome.contextMenus.create({title:quickComposeEmailContextMenuLabel + "...", contexts: ["browser_action"], onclick:function() {
		openQuickCompose();
	}});

	var contexts;
	if (Settings.read("showContextMenuItem")) {
		// Send page link
		bg.sendPageLinkMenuId = chrome.contextMenus.create({title: getMessage("sendPageLinkTitle") + "...", contexts: ContextMenu.AllContextsExceptBrowserAction, onclick:function(info, tab) {
			sendPageLink(info, tab, accounts.first())
		}});
	}

	if (quickComposeEmail) {
		
		if (Settings.read("showContextMenuItem")) {
			// Send page link to [user]
			bg.sendPageLinkToContactMenuId = chrome.contextMenus.create({title:emailPageLinkToContactLabel, contexts: ContextMenu.AllContextsExceptBrowserAction, onclick:function(info, tab) {
				if (Settings.read("accountAddingMethod") == "autoDetect") {
					sendPageLinkToContact(info, tab);
				} else {
					var sendEmailParams = generateSendPageParams(info, tab);
					sendEmailParams.to = {email:Settings.read("quickComposeEmail")};
					
					var originalMessage = sendEmailParams.message;
					sendEmailParams.htmlMessage = sendEmailParams.message + "<br><br><span style='color:gray'>Sent from <a style='color:gray;text-decoration:none' href='https://jasonsavard.com/Checker-Plus-for-Gmail?ref=sendpage'>Checker Plus for Gmail</a></span>";
					// remove message since we put it into the htmlMessage and because it seems when gmail api sends in html only it generates the text/plain
					sendEmailParams.message = null;
					
					getFirstActiveAccount(accounts).sendEmail(sendEmailParams).then(function() {
						var options = {
								type: "basic",
								title: getMessage("email") + " " + getMessage("sent"),
								message: sendEmailParams.subject,
								contextMessage: originalMessage,
								iconUrl: Icons.NOTIFICATION_ICON_URL
						}
						
						var EMAIL_SENT_NOTIFICATION_ID = "emailSent";
						chrome.notifications.create(EMAIL_SENT_NOTIFICATION_ID, options, function(notificationId) {
							if (chrome.runtime.lastError) {
								console.error(chrome.runtime.lastError.message);
							} else {
								setTimeout(function() {
									chrome.notifications.clear(EMAIL_SENT_NOTIFICATION_ID, function() {});
								}, seconds(4));
							}
						});
					}).catch(function(error) {
						alert("Error sending email: " + error);
					});
				}
			}});
		
			if (Settings.read("accountAddingMethod") == "oauth") {
				// Send page link to [user] with message
				bg.sendPageLinkToContactWithMessageMenuId = chrome.contextMenus.create({title:emailPageLinkToContactWithMessageLabel, contexts: ContextMenu.AllContextsExceptBrowserAction, onclick:function(info, tab) {
					sendPageLinkToContact(info, tab);
				}});
			}
		}
	}
	
}

function sendFVDInfo() {
	fvdSpeedDialLink.setWidgetInfo({
		path: "/widget.html?source=widget&ntp=FVD",
	    widthCells: localStorage.widgetWidth || 1,
	    heightCells: localStorage.widgetHeight || 2
	});
}

function generateSendPageParams(info, tab) {
	console.log("info", info, tab);
	var subject;
	var message;
	
	if (info) {
		// user right clicked on on a link within the page
		if (info.linkUrl) {
			// since we can't fetch the title of that linked page, let's construct a title from the link domain and path
			subject = info.linkUrl.parseUrl().hostname.replace("www.", "") + info.linkUrl.parseUrl().pathname.summarize(70);
			message = info.linkUrl;
		}
		
		if (!message) {
			message = info.pageUrl;
		}
	}
	
	if (!message) {
		message = tab.url;
	}
	
	// quote the text and append url (ie. message) after for news clippings etc.
	if (info && info.selectionText) {
		message = "\"" + info.selectionText + "\"\n\n" + message;
	}
	
	if (!subject) {
		subject = tab.title;
	}
	
	return {
		subject: unescape(subject),
		message: message
	};
}

function sendPageLink(info, tab, account) {
	var params = generateSendPageParams(info, tab);
    // removed next line because created problem loading compose window with russian text ie. "Как мы создали бизнес: Вячеслав Климов о создании «Новой Почты» - AIN.UA"
    //subject = subject.replace('%AB', '%2D'); // Special case: escape for %AB
    
	account.openCompose(params);
}

function openUrl(url, urlToFind, callback) {
	if (!window.inWidget && chrome.tabs) {
		if (urlToFind) {
			createTab({url:url, urlToFind:urlToFind}, function() {
				if (callback) {
					callback();
				}
			});
		} else {
			chrome.tabs.create({url:url});
		}

	} else {
		top.location.href = url;
	}
}

function refreshAccounts() {
	return new Promise(function(resolve, reject) {
		var accountsWithErrors = 0;
		
		var activeAccounts = getActiveAccounts(accounts);
		
		if (activeAccounts) {
			$.each(activeAccounts, function(index, account) {
				if (account.error) {
					accountsWithErrors++;
				}
			});			   
		}
		
		if (activeAccounts && activeAccounts.length >= 1 && !accountsWithErrors) {
			getAllEmails(activeAccounts).then(function() {
				$("#statusMessage").hide();
				bg.mailUpdate();
				resolve();
			});
		} else {
			bg.pollAccounts().then(function() {
				// must call this to resync accounts (because reference to it is lost when initializing accounts = ... inside mailAccount.js
				return getBGObjects().then(function() {
					bg.mailUpdate();
					resolve();
				});
			}).catch(error => {
				reject(error);
			});
		}
	});
}

function showMessageNotification(title, message, error, extensionConflict) {
   var options = {
		   type: "basic",
		   title: title,
		   message: message,
		   iconUrl: Icons.NOTIFICATION_ICON_URL,
		   priority: 1
   }
   
   var notificationId;
   if (error) {
	   var buttonTitle;
	   options.contextMessage = "Error: " + error;
	   if (extensionConflict) {
		   notificationId = "extensionConflict";
		   buttonTitle = "Click here for to resolve issue";
	   } else {
		   notificationId = "error";
		   buttonTitle = "If this is frequent then click here to report it";
	   }
	   options.buttons = [{title:buttonTitle, iconUrl:"images/notifButtons/open.svg"}];
   } else {
	   notificationId = "message";
   }
   
   chrome.notifications.create(notificationId, options, function(notificationId) {
	   if (chrome.runtime.lastError) {
		   console.error(chrome.runtime.lastError.message);
	   } else {
		   setTimeout(function () {
			   chrome.notifications.clear(notificationId);
		   }, error ? seconds(15) : seconds(5));
	   }
   });
}

function showCouldNotCompleteActionNotification(error, extensionConflict) {
	if (extensionConflict) {
		showMessageNotification("Error with last action.", "Try again.", error, extensionConflict);
	} else {
		showMessageNotification("Error with last action.", "Try again or sign out and in.", error);
	}
}

function stopNotificationSound() {
	// stop sound
	if (bg.notificationAudio) {
		bg.notificationAudio.pause();
		bg.notificationAudio.currentTime = 0;
	}
}

function stopVoiceMessageSound() {
	// stop sound
	if (bg.voiceMessageAudio) {
		bg.voiceMessageAudio.pause();
		bg.voiceMessageAudio.currentTime = 0;
	}
}

function stopAllSounds() {
	// stop sound
	stopNotificationSound();
	stopVoiceMessageSound();
	
	// stop voice
	bg.ChromeTTS.stop();
}

function updateContacts() {
	return new Promise(function(resolve, reject) {
		var contactsData = Settings.read("contactsData");
		if (contactsData) {
			var fetchContactPromises = [];
			contactsData.forEach(function(contactData, index) {
				console.log("updating contacts for account: " + contactData.userEmail);
				fetchContactPromises.push( fetchContacts(contactData.userEmail) );
			});
			
			Promise.all(fetchContactPromises).then(function(responses) {
				var someContactsHaveBeenUpdated = false;
				
				responses.forEach(function(response, index) {
					contactsData[index] = response.contactDataItem;
					if (response.contactsHaveBeenUpdated) {
						someContactsHaveBeenUpdated = true;
					}
				});
				
				if (someContactsHaveBeenUpdated) {
					Settings.store("contactsData", contactsData);
				}
				
				resolve();
			}).catch(function(errorResponse) {
				console.error(errorResponse);
				reject(errorResponse);
			});
		} else {
			resolve();
		}
	});
}

// change long ugly links like https://api.yahoo.com?abc=def to https://api.yahoo.com...
function shortenUrls(str) {
	return Autolinker.link(str, {
		truncate: {length: 30},
	    replaceFn : function( autolinker, match ) {
	        switch( match.getType() ) {
	            case 'url' :
	                var tag = autolinker.getTagBuilder().build( match ); 
	        		return tag.innerHtml;
	        }
		}
	});
}