// Copyright 2016 Jason Savard

var clickedShareTest = false;

var Settings = bg.getSettings();
var accounts = bg.accounts;
var mouseInPopup = false;
var mouseHasEnteredPopupAtleastOnce = false;

var POPUP_VIEW_TABLET = "tabletView";
var POPUP_VIEW_CHECKER_PLUS = "checkerPlus";

var totalUnreadCount = bg.unreadCount;
var totalVisibleMails;
var photosDisplayed;
var MAX_PHOTOS_TO_SHOW = 20; // so we don't do too many oauth calls
var initialInboxesWidth;
var squezedInboxesWidth;
var FIXED_RIGHT_MARGIN = 20;
var fixedRightMargin = FIXED_RIGHT_MARGIN;
var searchTimeout;
var contacts;
var contactsScrollHeight;
var $scrollingMail;
var scrollingMailInterval;
var scrollingDirection;

var emailCount;
var firstReadEmailPosition;
var lastUnreadEmailPosition;
var showReadEmails;
var previousSelectedLabelIndex = -1;
var lastKeyPressedEvent;
var emailPreviewed = false;
var animationDuration;
var $fixedArea;
var backToInboxClicked;
var popupView;
var reversingView;
var tabletFramePort;
var currentTabletFrameEmail;
var autoSaveInterval;
var replyingToMail;

var lang = Settings.read("language");

if (Settings.read("browserButtonAction") == BROWSER_BUTTON_ACTION_GMAIL_INBOX) {
	if (location.href.indexOf("noSignedInAccounts") != -1) {
		popupView = POPUP_VIEW_TABLET;
	} else {
		if (totalUnreadCount === 0 && Settings.read("gmailPopupBrowserButtonActionIfNoEmail") == BROWSER_BUTTON_ACTION_CHECKER_PLUS) {
			popupView = POPUP_VIEW_CHECKER_PLUS;
		} else {
			popupView = POPUP_VIEW_TABLET;
		}
	}
} else {
	if (location.href.indexOf("noSignedInAccounts") != -1) {
		popupView = POPUP_VIEW_CHECKER_PLUS;
	} else {
		if (totalUnreadCount === 0 && Settings.read("checkerPlusBrowserButtonActionIfNoEmail") == BROWSER_BUTTON_ACTION_GMAIL_INBOX) {
			popupView = POPUP_VIEW_TABLET;
		} else {
			popupView = POPUP_VIEW_CHECKER_PLUS;
		}
	}
}

console.log("view: " + popupView);

function isVisibleInScrollArea( $elm, scrollHeight ) {
	/*
    var vpH = $scroll.height(), // Viewport Height
        st = $scroll.scrollTop(), // Scroll Top
        y = $elm.position().top;
	 */
	var elmTop = $elm.position().top;
    return elmTop >= 0 && elmTop < scrollHeight;
    //return (y > (vpH + st));
}

function showSelectedTab(url) {
	if (url) {
		$(".tab").removeClass("selected");
		
		if (url.endsWith("/%5Ei") || url.endsWith("/Inbox") || url.indexOf("/Inbox/") != -1) {
			$("#tabInbox").addClass("selected");
		} else if (url.endsWith("/Important") || url.indexOf("/Important/") != -1) {
			$("#tabImportant").addClass("selected");
		} else if (url.endsWith("/All%20Mail") || url.indexOf("/All%20Mail/") != -1) {
			$("#tabAllMail").addClass("selected");
		} else if (url.indexOf("smartlabel_personal") != -1) {
			$("#tabPrimary").addClass("selected");
		} else if (url.indexOf("smartlabel_social") != -1) {
			$("#tabSocial").addClass("selected");
		} else if (url.indexOf("smartlabel_promo") != -1) {
			$("#tabPromotions").addClass("selected");
		} else if (url.indexOf("smartlabel_notification") != -1) {
			$("#tabUpdates").addClass("selected");
		} else if (url.indexOf("smartlabel_group") != -1) {
			$("#tabForums").addClass("selected");
		} else {
			// viewing a label: #tl/apps
			// viewing an email inside a label: #cv/apps/47120957120498
			var label = url.match(/#tl\/(.*)/);
			if (!label) {
				label = url.match(/#cv\/(.*)\//);
			}
			if (label) {
				try {
					$("#label_" + label[1]).addClass("selected");
				} catch (e) {
					console.error("error with #label_ : " + label[1], e);
				}
			}
		}
	}
}

function initTabs(email) {
	// init tabs
	var tabs;
	var account = getAccountByEmail(email);
	if (account) {
		tabs = account.getSetting("tabs");
		
		// add enabled tabs only
		var tabsArray = [];
		for (tab in tabs) {
			if (tabs[tab]) { // check if enabled
				tabsArray.push(initTab(account, tab));
			}
		}
		
		tabsArray.sort(function($a, $b) {
			if (parseInt($a.attr("sortIndex")) < parseInt($b.attr("sortIndex"))) {
				return -1;
			} else if (parseInt($a.attr("sortIndex")) > parseInt($b.attr("sortIndex"))) {
				return 1;
			} else {
				return 0;
			}
		});
		
		var SHRINK_TABS_THRESHOLD = 6;
		if (tabsArray.length > SHRINK_TABS_THRESHOLD) {
			$("#tabs").addClass("shrink");
		}
		$("#tabs")
			.empty()
			.append( tabsArray )
		;
		
		if (tabsArray.length) {
			$("html").addClass("hasTabs");
		} else { //if ($.isEmptyObject(tabs)) {
			$("html").removeClass("hasTabs");
		}
		
		resizeFrameInExternalPopup();

		// sync labels after display them (because the callback might delay the tabs from initially showing) remove any renamed or deleted from the settings
		account.getLabels(function(response) {
			console.log("labels", response);
			
			if (response && response.labels && response.labels.length && tabs) {
				var tabsUnsynced;
				for (tab in tabs) {
					console.log("tab", tab);
					
					var tabFoundInLabels = false;
					for (var a=0; a<response.labels.length; a++) {
						if (response.labels[a].id.equalsIgnoreCase(tab)) {
							tabFoundInLabels = true;
							break;
						}
					}
					
					if (!isSystemLabel(tab) && !tabFoundInLabels) {
						console.log("remove this tab from settings: " + tab);
						delete tabs[tab];
						tabsUnsynced = true;
					}
				}
				
				if (tabsUnsynced) {
					console.log("rescyning tabs");
					var emailSettings = Settings.read("emailSettings");
					emailSettings[email].tabs = tabs;
					Settings.store("emailSettings", emailSettings);
					
					// force refresh of labels
					account.getLabels(true, function() {
						showMessage("You have renamed or removed some Gmail labels. You have to re-select them in the extension options.");
					});
				}
			}
		});
	
	}
	
	showSelectedTab(localStorage.tabletViewUrl);
}

function initTab(account, tabName) {
	var $tab = $("<div class='tab visible'/>");
	var tabId;
	var sortIndex;
	if (tabName == SYSTEM_INBOX) {
		tabId = "tabInbox";
		tabTitle = getMessage("inbox");
		sortIndex = 0;
	} else if (tabName == SYSTEM_IMPORTANT) {
		tabId = "tabImportant";
		tabTitle = getMessage("important");
		sortIndex = 1;
	} else if (tabName == SYSTEM_ALL_MAIL) {
		tabId = "tabAllMail";
		tabTitle = getMessage("allMail");
		sortIndex = 2;
	} else if (tabName == SYSTEM_PRIMARY) {
		tabId = "tabPrimary";
		tabTitle = getMessage("primary");
		sortIndex = 3;
	} else if (tabName == SYSTEM_SOCIAL) {
		tabId = "tabSocial";
		tabTitle = getMessage("social");
		sortIndex = 4;
	} else if (tabName == SYSTEM_PROMOTIONS) {
		tabId = "tabPromotions";
		tabTitle = getMessage("promotions");
		sortIndex = 5;
	} else if (tabName == SYSTEM_UPDATES) {
		tabId = "tabUpdates";
		tabTitle = getMessage("updates");
		sortIndex = 6;
	} else if (tabName == SYSTEM_FORUMS) {
		tabId = "tabForums";
		tabTitle = getMessage("forums");
		sortIndex = 7;
	} else {
		if (tabName) {
			var labelName = account.getLabelName(tabName);
			console.log("names: ", tabName, labelName)
			// keep it lower case and insidew tablet.js also, seems that when clicking nonsystem labels it resets to inbox after a few seconds??
			if (labelName) {
				tabId = "label_" + labelName.toLowerCase();
				// Nested labels use / but the /mu/ uses -    ... so let's replace themm all from / to -
				tabId = tabId.replaceAll("/", "-");
				console.log("tabid: " + tabId);
				tabTitle = labelName;
				sortIndex = labelName.toLowerCase().charCodeAt(0);
			}
		}
	}
	
	$tab
		.attr("id", tabId)
		.attr("sortIndex", sortIndex)
		.attr("title", tabTitle)
		.text(tabTitle)
		.addClass("visible")
		.off().on("click", function() {
			var thisTabId = $(this).attr("id");
			tabletFramePort.postMessage({action: "goToLabel", label:thisTabId});
		})
	;

	return $tab;
}

function autoSave() {
	var replyAll = $(".composeWrapper").data("replyAll");
	var message = $(".composeInput").val();
	if (message) {
		console.log("autosave set: " + new Date());
		localStorage.autoSave = JSON.stringify({mailId:replyingToMail.id, replyAll:replyAll, message:message});
	}
}

chrome.runtime.onConnect.addListener(function(port) {
	$(document).ready(function() {
		
		tabletFramePort = port;
		if (tabletFramePort.name == "popupWindowAndTabletFrameChannel") {
			console.log("onconnect")
			
			if (Settings.read("buttons") == "dark") {
				tabletFramePort.postMessage({action: "invert"});
			}
			
			tabletFramePort.onMessage.addListener(function(message) {
				console.log("onMessage: " + message.action);
				if (message.action == "tabletViewUrlChanged") {
					localStorage.tabletViewUrl = message.url;
					showSelectedTab(message.url);
				} else if (message.action == "getCurrentEmail") {
					console.log("current email in popup: " + message.email);
					if (message.email && message.email != currentTabletFrameEmail) {
						initTabs(message.email);
						currentTabletFrameEmail = message.email;
					}
				} else if (message.action == "reversePopupView") {
					// do not obey holding ctrl key when inside popup
					if (location.href.indexOf("externalPopupWindow") == -1) {
						reversePopupView();
					}
				}
			});
		}
		
	});
});

function initPopupView() {
	
	function prepareNoAccountsDisplay() {
		console.log("prepareNoAccountsDisplay");
		$("html").addClass("noAccounts");
	   	if (Settings.read("accountAddingMethod") == "autoDetect") {
	   		$("#signInLink").attr("href", getSignInUrl());
	   	}
   	}
	
	console.log("initpopupview: " + popupView);
	$(document).ready(function() {
		if (popupView == POPUP_VIEW_CHECKER_PLUS) {
			// checker plus view

			$("html")
				.removeClass("tabletView")
				.addClass("checkerPlusView")
			;
			$("#switchView")
				.text(getMessage("switchToInbox"))
				.attr("title", getMessage("switchToInboxToolTip"))
			;

			console.log("accounts", accounts);
			if (accounts.length == 0) {
				prepareNoAccountsDisplay();
			}

		} else {
			// tablet view
			
			$("html")
				.removeClass("checkerPlusView")
				.addClass("tabletView")
			;
			$("#switchView")
				.text(getMessage("switchToCheckerPlus"))
				.attr("title", getMessage("switchToInboxToolTip"))
			;
			
			// display any errors with accounts above
			if (accounts && accounts.length) {
				$.each(accounts, function(index, account) {
					if (account.error) {
						setTimeout(function() {
							showMessage(account.getAddress() + ": " + account.getError().niceError + " - " + account.getError().instructions, true);
						}, 500)
						return false;
					}
				});			   
			} else {
				setTimeout(function() {
					showMessage("Refresh or sign out and in!", true);
				}, 500)
			}
			
			var urlPrefix = "https://mail.google.com/mail/mu/mp/?mui=checkerPlusForGmail&hl=" + lang;

			var url;
			// check if opening popup from notification and thus directly opening message
			var previewMailId = getUrlValue(location.href, "previewMailId");
			if (previewMailId) {
				url = urlPrefix + "#cv/^i/" + previewMailId;
			} else {
				url = localStorage.tabletViewUrl;
			}
			
			if (!url) {
				url = urlPrefix;
			}

			$("#tabletViewFrame")
				.attr("src", url)
				.off("load").on("load", function() {
						// patch for scrollbars
						setTimeout(function() {
							$("body").css("padding-bottom", "1px");
						}, 100)
						
						console.log("frame loaded " + new Date());
						// backup method: if could not detect current email from frame then let's default to first email from accounts detected
						setTimeout(function() {
							console.log("detect email timeout reached " + new Date());
							if (!currentTabletFrameEmail) {
								console.log("timeout default to first detected account");
								initTabs(getFirstActiveEmail(accounts));
							}
						}, 500);
						
					})
				.focus()
			;
			
		}
	});
}

function reversePopupView(force) {
	console.log("reversepopupview");
	if (force || !reversingView) {
		reversingView = true;
		
		// reverse view
		if (popupView == POPUP_VIEW_CHECKER_PLUS) {
			popupView = POPUP_VIEW_TABLET;
		} else {
			popupView = POPUP_VIEW_CHECKER_PLUS;
		}
		console.log("keydown: " + popupView);
		initPopupView();
	}
}

stopAllSounds();

if (false && accounts && accounts.length && accounts.first().getAddress() == atob("amFzb25zYXZhcmRAZ21haWwuY29t")) {
	chrome.tabs.query({active:true}, function(tabs) {
		var gmailTab = tabs[0];
		chrome.tabs.insertCSS(gmailTab.id, {file:"css/speechRecognition.css"}, function() {
			chrome.tabs.executeScript(gmailTab.id, {file: "js/jquery.js"}, function() {
				chrome.tabs.executeScript(gmailTab.id, {file:"js/speechRecognition.js", allFrames:false});
			});
		});
	});
}

var tooLateForShortcut = false;
setTimeout(function() {tooLateForShortcut=true}, 200);
window.addEventListener ("keydown", function(e) {
	
	// for reversing the popup view
	if (!tooLateForShortcut && isCtrlPressed(e) && location.href.indexOf("externalPopupWindow") == -1) {
		tooLateForShortcut = true;
		reversePopupView();
		return;
	}
	
}, false);

function initShowTransitions() {
	if (Settings.read("showTransitions")) {
		animationDuration = 400;
		$.fx.off = false;
	} else {
		animationDuration = 0;
		$.fx.off = true;
	}
}

function temporailyDisableTransitions() {
	$.fx.off = true;
	setTimeout(function() {
		initShowTransitions();		
	}, 1000)
}

function resizeFrameInExternalPopup() {
	// Force resize to resize tabletviewframe
	if (location.href.indexOf("externalPopupWindow") != -1 && popupView == POPUP_VIEW_TABLET) {
		setTimeout(function() {
			$(window).resize();
		}, 10);
	}
}

function showMessage(msg, error) {
	$("#statusMessage")
		.html(msg)
		.toggleClass("error", error === true)
		.css("margin-left", -($("#statusMessage").width() / 2) + "px")
		.show()
	;
	setTimeout(function() {
		$("#statusMessage").fadeOut(function() {
			$(this)
				// reset to loading message
				.text( getMessage("loading") )
				.removeClass("error")
			;
		});
	}, 4000);
}

function stretchWindow() {
	if (location.href.indexOf("externalPopupWindow") == -1) {
		$("#stretcher").show();
		$("#stretcher").width( $("body").width() );
	}
}

function initFixedArea() {
    $fixedArea.addClass('fixed');
    var width = 19; // must balance with scrollbar width ie. :-webkit-scrollbar width:xx 
	$fixedArea.css("right", width + "px");
}

function hideFullEmail(callback) {
	if ($fixedArea) {
		$fixedArea.removeClass('fixed');
	}
	if (!callback) {
		callback = function() {};
	}
   	$("#fullEmail").slideUp();
   	
	$("#inboxes").animate({
	    width: initialInboxesWidth
	}, animationDuration, function() {
		$("#inboxes").removeClass("squished");
		callback();
	});
}

function setFixedWidth() {
	// set an exact width instead of 100%
	initialInboxesWidth = $("#inboxes").width();		
	$("#inboxes").css("width", initialInboxesWidth);
}

function getURLOrRedirectURL($node) {
	var url = $node.attr("href");
	
	// remove google redirection
	// ex. "http://www.google.com/url?q=http%3A%2F%2Fjasonsavard.com%2Fwiki"
	if (url) {
		var urlRedirect = url.match("^https?://www\.google\.com/url\\?q=(.*)");
		if (urlRedirect) {
			// only pull the q param because google redirect adds other params
			url = getUrlValue(url, "q");
			url = decodeURIComponent(url);
		}
	}
	return url;
}

function interceptClicks($node, mail) {
	console.log("intercept redirects");

	// add tooltip for links
	$node.each(function() {
		if (!$(this).attr("title")) {
			var url = getURLOrRedirectURL($(this));
			if (url) {
				$(this).attr("title", url.summarize(50));
			}
		}
	});
	
	// change links if necessary
	$node.off("click").on("click", {mail:mail}, function(event) {
		
		var url = getURLOrRedirectURL($(this));
		
		if (Settings.read("accountAddingMethod") == "autoDetect") {
			$(this).attr("href", url);
		} else {
			// if anchor link just skip every and process it
			if (url.startsWith("#")) {
				// because we sanitized the 'name' attributes of the target anchor we must match it with the subsituted prefix
				$(this).attr("href", "#" + HTML_CSS_SANITIZER_REWRITE_IDS_PREFIX + url.substring(1));
				return true;
			}
			
			$(this)
				.attr("href", url)
				.attr("target", "_blank")
			;
		}
		
		// found relative link which used to be a mailto ex. ?&v=b&cs=wh&to=ebottini@gmail.com
		var mailto = url.match("^\\?.*&to=(.*)");
		if (mailto) {
			// Getting this value from Gmail (notice the 2 question marks! : ?&v=b&cs=wh&to=unsubscribe@salesforce.com?Subject=Opt+Out
			// let's replace all question mark
			url = url.replaceAll("?", "&");
			
			var params = {};
			params.to = getUrlValue(url, "to");
			params.subject = getUrlValue(url, "subject");
			params.message = getUrlValue(url, "body");
			// https://mail.google.com/mail/u/0/?ui=2&view=btop&ver=1pxvtfa3uo81z#to%253Dunsubscribe%252540salesforce.com%2526cmid%253D8
			// ?&v=b&cs=wh&to=unsubscribe@salesforce.com?Subject=Opt+Out

			event.data.mail.account.openCompose(params);
			
			event.preventDefault();
			event.stopPropagation();
		}

		// if user holds ctrl or middle click then open link in a tab while keeping popup window open
		if (isCtrlPressed(event) || event.which == 2) {
			console.log(event);
			chrome.tabs.create({url:url, active:false});
			event.preventDefault();
			event.stopPropagation();
		} else {
			if (url) {
				$(this).attr("href", url);
			}
		}
	});
}

function showImages($node) {
	var html = $node.html();
	html = html.replace(/<imghidden/g, "<img");
	html = html.replace(/\/imghidden>/g, "/img>");
	$node.html( html );
}

function setFocusToComposeInput(scrollIntoView) {
	var $composeInput = $(".composeInput");
	$composeInput
		.click()
		.focus()
	;
	if (scrollIntoView) {
		$composeInput.get(0).scrollIntoView();
	}
}

function addLabelToEmailDisplay($fullEmailLabels, mail, labelId) {
	console.log("add label: ", labelId);
	var labelName;
	if (labelId == GmailAPI.labels.INBOX) {
		labelName = getMessage("inbox");
	} else if (labelId == GmailAPI.labels.CATEGORY_PERSONAL || labelId == GmailAPI.labels.CATEGORY_SOCIAL || labelId == GmailAPI.labels.CATEGORY_PROMOTIONS || labelId == GmailAPI.labels.CATEGORY_UPDATES || labelId == GmailAPI.labels.STARRED || labelId == GmailAPI.labels.SENT || labelId == GmailAPI.labels.UNREAD || labelId == GmailAPI.labels.IMPORTANT) {
		// don't add this, continue loop
		return;
	} else {
		labelName = mail.account.getLabelName(labelId);
	}
	
	console.log("adding: ", labelId, labelName);
	
	var $labelWrapper = $("<div class='fullEmailLabelWrapper'><div class='fullEmailLabel'></div><div class='fullEmailLabelRemove'>x</div></div>");
	$labelWrapper.find(".fullEmailLabel").text(labelName);
	$labelWrapper.find(".fullEmailLabelRemove").click(function() {
		mail.removeLabel(labelId, function() {});
		$(this).closest(".fullEmailLabelWrapper").remove();
	});
	$fullEmailLabels.append($labelWrapper);
}

function generateLabelDropDownItem(params) {
	var $item = $("<div/>");
	$item.text(params.label.name)
	$item.hover(function() {
		$(this).siblings().removeClass("selected");
		$(this).addClass("selected");
	});
	
	$item.click({mail:params.mail, $mail:params.$mail}, function(event) {
		$(".labelsDropDownWrapper").hide();
		if (params.isMove) {
			event.data.mail.moveLabel({newLabel:params.label.id});
			hideFullEmail();
		} else {
			var labelSelected = $(this).text();
			event.data.mail.applyLabel(params.label.id, function(response) {
				if (response.error) {
					showMessage(response.error + " please try again later!", true);
				} else {
					showMessage("The conversation has been added to \"" + labelSelected + "\"");
					if (Settings.read("accountAddingMethod") == "oauth") {
						addLabelToEmailDisplay($("#fullEmailLabels"), event.data.mail, params.label.id);
					}
				}
			});
		}
	});
	return $item;
}

function showFullEmail(params, callback) {
	
	if (!callback) {
		callback = function() {};
	}
	
	if (Settings.read("accountAddingMethod") == "autoDetect") {
		$("#statusMessage").show();
	}
	
	var $mail = params.$mail;
	var mail = $mail.data("data");
	
	if (!initialInboxesWidth) {		
		setFixedWidth();

		var hideLeftColumnWhenPreviewingEmail = !Settings.read("showLeftColumnWhenPreviewingEmail") || params.previewFromNotification;
		if (hideLeftColumnWhenPreviewingEmail) {
			squezedInboxesWidth = 0;
		} else {
			squezedInboxesWidth = initialInboxesWidth * 0.40;
		}
		//$("#scrollArea").css("width", "2200px");
	}	
	
	setTimeout(function() {

		var $fullEmail = $("#fullEmail");
		var currentlyOpenFullEmail = $("#fullEmail").data("data"); 
		
		if (!params.forceDisplayImages && currentlyOpenFullEmail && currentlyOpenFullEmail.id == mail.id && $fullEmail.is(":visible")) {
			hideFullEmail();
			$("#statusMessage").hide();
			callback();
		} else {
			$fullEmail.data("data", mail);
			
			if (mail.account.getSetting("openLinksToInboxByGmail")) {
				$fullEmail.addClass("inboxByGmail");
			}
			
			if (!$("#inboxes").hasClass("squished")) {
				$("#inboxes").addClass("squished");
				
				// because #inboxes has a margin-right:5px so remove it from here
				var marginRight = 6;
				
				stretchWindow();
				
				$("#fullEmailContent").css("width", initialInboxesWidth-squezedInboxesWidth-marginRight);
				
				$("#inboxes").animate({
				    width: squezedInboxesWidth
				}, animationDuration, ["swing"], function() {
					initialInboxesWidth = $("#body").width();
					$("#fullEmailContent").css("width", initialInboxesWidth-squezedInboxesWidth-marginRight);
				});
			}

			$(".mail").removeClass("selected");
			$mail.addClass("selected")

			mail.getThread(params).then(function(response) {
				if (response.error) {
					//alert("Error: " + response.error);
					showMessage(response.error + ", please try again later!", true);
					logError("error in getThread: " + response.error);
					callback();
				} else {
					var markAsReadSetting = Settings.read("showfull_read");
					var zoomChanged = false;
					
					$("#fullEmailActionButtons").find(".emailZoom").val(100);
					
					if (markAsReadSetting || $mail.hasClass("read")) {
						$("#fullEmailActionButtons").find(".markAsRead").hide();
						$("#fullEmailActionButtons").find(".markAsUnread").show();
					} else {
						$("#fullEmailActionButtons").find(".markAsRead").show();
						$("#fullEmailActionButtons").find(".markAsUnread").hide();
					}

					$("#fullEmailActionButtons").find(".markAsUnread").off("click").on("click", {mail:mail, $mail:$mail}, function(event) {						
						markAsUnread(event.data.$mail, event.data.mail);
						hideFullEmail();
						sendGA("emailView", "markAsUnread");
					});

					$("#fullEmailActionButtons").find(".markAsRead").off("click").on("click", {mail:mail, $mail:$mail}, function(event) {
						markAsRead(event.data.$mail);
						hideFullEmail();
						sendGA("emailView", "markAsRead");
					});

					$("#fullEmailActionButtons").find(".listenToEmail").off("click").on("click", {mail:mail, $mail:$mail}, function(event) {
						if ($(this).find("img").attr("src").indexOf("play") != -1) {
							bg.ChromeTTS.queue(event.data.mail.getLastMessageText(), {}, function() {
								$("#fullEmailActionButtons").find(".listenToEmail img").attr("src", "/images/play.png");
							});
							$(this).find("img").attr("src", "/images/stop.png");
						} else {
							bg.ChromeTTS.stop();
							$(this).find("img").attr("src", "/images/play.png");
						}
						sendGA("emailView", "listenToEmail");
					});

					$("#fullEmailActionButtons").find(".emailZoom").off("change").on("change", {mail:mail, $mail:$mail}, function(event) {
						
						if (!zoomChanged) {
							$fullEmailSenderAreas.find(".open, .reply").find("div").addClass("opacityPatch");
						}
						
						var $messageContents = $fullEmailContent.find(".messageContent");
						
					    initFixedArea();
						
					    $messageContents.addClass("zoomed");
					    $messageContents.css("zoom", $(this).val() + "%");
							
			    	  	zoomChanged = true;
					})

					$("#fullEmailActionButtons").find(".delete").off("click").on("click", {mail:mail, $mail:$mail}, function(event) {
						event.data.mail.deleteEmail({instantlyUpdatedCount:true});
						hideFullEmail();
						hideMail(event.data.$mail, "delete");
						sendGA("emailView", "delete");
					});		

					$("#fullEmailActionButtons").find(".archive").off("click").on("click", {mail:mail, $mail:$mail}, function(event) {
						event.data.mail.archive({instantlyUpdatedCount:true});
						hideFullEmail();
						hideMail(event.data.$mail, "archive");
						sendGA("emailView", "archive");
					});		

					$("#fullEmailActionButtons").find(".spam").off("click").on("click", {mail:mail, $mail:$mail}, function(event) {
						event.data.mail.markAsSpam({instantlyUpdatedCount:true});
						hideFullEmail();
						hideMail(event.data.$mail, "spam");
						sendGA("emailView", "spam");
					});		
					
					$("#fullEmailActionButtons").find(".moveLabel, .labels").off("click").on("click", {mail:mail, $mail:$mail}, function(event) {
						var $buttonClicked = $(this);
						$(this).blur();
						
						var $labelsDropDownWrapper = $(".labelsDropDownWrapper");
						if ($labelsDropDownWrapper.is(":visible")) {
							$labelsDropDownWrapper.slideUp();
							return;
						}
						var $labelsDropDown = $labelsDropDownWrapper.find(".labelsDropDown");
						
						$labelsDropDownWrapper.find(".labelsSearch").off("keyup").on("keyup", function(event) {
							$visibleLabels = $labelsDropDown.find("div:visible");
							console.log("visible here top ", $visibleLabels)
							if (event.keyCode == 40) { // down arrow
								var $previousSelected = $visibleLabels.filter(".selected");
								if ($visibleLabels.length == 1) {
									return;
								} else {
									$previousSelected.removeClass("selected");
									if (previousSelectedLabelIndex >= ($visibleLabels.length-1)) { // at end so loop back up
										$visibleLabels.first().addClass("selected");								
										previousSelectedLabelIndex = 0;
									} else { // select next one
										previousSelectedLabelIndex++;
										$visibleLabels.eq(previousSelectedLabelIndex).addClass("selected");
									}
								}
							} else if (event.keyCode == 38) { // up arrow							
								
								var $previousSelected = $visibleLabels.filter(".selected");
								if ($visibleLabels.length == 1) {
									return;
								} else {
									$previousSelected.removeClass("selected");
									if (previousSelectedLabelIndex <= 0) { // at end so loop back bottom
										$visibleLabels.last().addClass("selected");								
										previousSelectedLabelIndex = ($visibleLabels.length-1);
									} else { // select next one
										previousSelectedLabelIndex--;
										$visibleLabels.eq(previousSelectedLabelIndex).addClass("selected");
									}
								}
								
							} else if (event.keyCode == 13) { // up arrow
								$visibleLabels.filter(".selected").click();
							} else {				
								previousSelectedLabelIndex = 0;
								var searchText = $(this).val().toLowerCase();
								$labelsDropDown.find("div").each(function() {
									$(this).removeClass("selected");
									if ($(this).text().toLowerCase().indexOf(searchText) != -1) {									
										$(this).show();
									} else {
										$(this).hide();
									}
								});
								$labelsDropDown.find("div:visible").first().addClass("selected");
							}
						});
						
						$("#statusMessage").show();
						event.data.mail.account.getLabels(false, function(params) {
							console.log("labels", params);
							$("#statusMessage").hide();
							
							$labelsDropDown.empty();
							
							if (params.labels) {
								
								$.each(params.labels, function(i, label) {
									var $item = generateLabelDropDownItem({label:label, isMove:$buttonClicked.hasClass("moveLabel"), mail:mail, $mail:$mail});
									$labelsDropDown.append($item);
								});

								if (Settings.read("accountAddingMethod") == "oauth") {
									// Add categories at end of dropdown
									$labelsDropDown.append( generateLabelDropDownItem({label:{id:GmailAPI.labels.CATEGORY_PERSONAL, name:getMessage("primary")}, isMove:$buttonClicked.hasClass("moveLabel"), mail:mail, $mail:$mail}) );
									$labelsDropDown.append( generateLabelDropDownItem({label:{id:GmailAPI.labels.CATEGORY_SOCIAL, name:getMessage("social")}, isMove:$buttonClicked.hasClass("moveLabel"), mail:mail, $mail:$mail}) );
									$labelsDropDown.append( generateLabelDropDownItem({label:{id:GmailAPI.labels.CATEGORY_PROMOTIONS, name:getMessage("promotions")}, isMove:$buttonClicked.hasClass("moveLabel"), mail:mail, $mail:$mail}) );
									$labelsDropDown.append( generateLabelDropDownItem({label:{id:GmailAPI.labels.CATEGORY_UPDATES, name:getMessage("updates")}, isMove:$buttonClicked.hasClass("moveLabel"), mail:mail, $mail:$mail}) );
									$labelsDropDown.append( generateLabelDropDownItem({label:{id:GmailAPI.labels.CATEGORY_FORUMS, name:getMessage("forums")}, isMove:$buttonClicked.hasClass("moveLabel"), mail:mail, $mail:$mail}) );
								}
								
								var top = $buttonClicked.position().top;
								var left = $buttonClicked.position().left;
								top += $buttonClicked.height() + 11;
								$labelsDropDownWrapper.css("top", top);
								$labelsDropDownWrapper.css("left", left);
								$labelsDropDownWrapper.slideDown();
							} else {
								showMessage("Sorry, problem fetching labels, try again later! Error: " + params.error, true);
								logError("error fetching labels: " + params.error);
							}
							$labelsDropDownWrapper.find(".labelsSearch").focus();
						});
						
						
						sendGA("emailView", "labels");
					});		

					$("#fullEmailContent").off("click")
						.on("click", ".fullEmailSenderArea .star", {mail:mail, $mail:$mail}, function(event) {
							if ($(this).hasClass("active")) {
								if (Settings.read("accountAddingMethod") == "oauth") {
									$(this).removeClass("active");
									event.data.mail.removeStar();
									sendGA("emailView", "removeStar");
								}
							} else {
								$(this).addClass("active");
								event.data.mail.star();
								sendGA("emailView", "star");
							}
							return false;
						})
						.on("click", ".fullEmailSenderArea .open", {mail:mail, $mail:$mail}, function(event) {
							var openParams = {};
							if (isCtrlPressed(event) || event.which == 2) {
								openParams.openInNewTab = true;
							}
							event.data.mail.open(openParams);
							sendGA("emailView", "open");
							setTimeout(function() {
								window.close();
							}, 100);
							return false;
						})
						.on("click", ".fullEmailSenderArea .reply", {mail:mail, $mail:$mail}, function(event) {
							event.data.mail.reply();
							sendGA("emailView", "reply");
							setTimeout(function() {
								window.close();
							}, 100);
							return false;
						})
						.on("click", ".fullEmailSenderArea", {mail:mail, $mail:$mail}, function(event) {
							var $message = $(this).closest(".message");
							$message.toggleClass("collapsed");
							sendGA("emailView", "threadExpand");
							return false;
						})
						.on("click", ".fullEmailShowToCC", {mail:mail, $mail:$mail}, function(event) {
							var message = $(this).closest(".message").data("message");
							
							var $fullEmailToCC = $(this).parent().find(".fullEmailToCC");							
							var fullDetails = $fullEmailToCC.data("fullDetails");							
							$fullEmailToCC.html(fullDetails).addClass("showDetails");							
					   		$(this).hide();
					   		sendGA("emailView", "toCC");
							return false;
						})
					;
					
					$("#fullEmailSubject")
						.html(mail.title)
						.attr("title", mail.title)
					;
					
					var $fullEmailLabels = $("#fullEmailLabels");
					if (Settings.read("accountAddingMethod") == "oauth") {
						$fullEmailLabels.empty();
						mail.labels.forEach(function(labelId) {
							addLabelToEmailDisplay($fullEmailLabels, mail, labelId);
						});
						$fullEmailLabels.show();
					} else {
						$fullEmailLabels.hide();
					}
					
					var $fullEmailBody = $("<div class='fullEmailBody'/>");
					
					console.log("response", response);
					
					if (mail.messages && mail.messages.last()) {
						$.each(response.mail.messages, function(index, message) {

							console.log("message", message);

							var $message = $("<div class='message'/>");
							$message.data("message", message);
							
							// patch for error "Code generation from strings disallowed for this context"
							// the error would occur if I use jQuery's .append but not!!! if I initially set the content with $()
							var $messageContent = $("<div class='messageContent'>" + message.content + "</div>");
							
							fixRelativeLinks($messageContent);
							
							if (Settings.read("alwaysDisplayExternalContent")) {
								// put back the imghidden to img (note: we had to manually change these when retreving the message to avoid fetching the images)
								var filteredHTML = $messageContent.html();
								if (filteredHTML.indexOf("<imghidden") != -1) {
									showImages($messageContent);
								}
							} else {
								var externalContentHidden = false;
	
								if (!params.forceDisplayImages) {
									$messageContent.find("img, imghidden, input[src]").each(function() {
										var src = $(this).attr("src");
										if (src && !src.match(MAIL_DOMAIN + "/")) {
											$(this).removeAttr("src");
											externalContentHidden = true;
										}
									});
	
									$messageContent.find("*[background]").each(function() {
										$(this).removeAttr("background");
										externalContentHidden = true;
									});
									
									$messageContent.find("*[style*='background:'], *[style*='background-image:']").each(function() {
										var style = $(this).attr("style");
										style = style.replace(/background/ig, "backgroundDISABLED");
										$(this).attr("style", style);
										externalContentHidden = true;
									});
								} else if (params.forceDisplayImages && Settings.read("accountAddingMethod") == "oauth") {
									showImages($messageContent);
								}
								
								if (externalContentHidden) {
									$("#fullEmailSubject").addClass("displayImages");
									$("#fullEmailDisplayImagesWrapper").show();
									
									$("#fullEmailDisplayImagesLink, #fullEmailAlwaysDisplayImagesLink").off("click").on("click", {mail:mail, $mail:$mail}, function(event) {
										
										// in autodetect - img is always converted to imghidden (refer to patch 101) so we must refetch the thread
										if (Settings.read("accountAddingMethod") == "autoDetect") {
											event.data.mail.messages = null;
										}
										
										showFullEmail({$mail:event.data.$mail, forceDisplayImages:true});
										
										if ($(this).attr("id") == "fullEmailAlwaysDisplayImagesLink") {
											Settings.store("alwaysDisplayExternalContent", true);
										}
										$("#fullEmailSubject").removeClass("displayImages");
										$("#fullEmailDisplayImagesWrapper").hide();
									});
								} else {
									$("#fullEmailSubject").removeClass("displayImages");
									$("#fullEmailDisplayImagesWrapper").hide();
								}
							}
							
							$messageContent.find(".gmail_extra, blockquote[type='cite']").each(function(index, gmailExtra) {
								var $trimmedContent = $(this);
								$trimmedContent.hide();
								var $elipsis = $("<div class='showTrimmedContent' title='Show trimmed content'>...</div>");
								$elipsis.click(function() {
									$trimmedContent.toggle();
								});
								$trimmedContent.before($elipsis);
							});

							var $threadHeader = $("#mailTemplate").clone();							
							$threadHeader.removeAttr("id");
							
							$threadHeader.find(".author")
								.text( mail.getName(message.from) )
								.attr("title", message.from.email )
							;
							
							var textContent = message.textContent;
							if (textContent) {
								textContent = textContent.summarize(60);
								$threadHeader.find(".summary").html( textContent );
							}
							
							var dateStr = message.dateStr;						
							if (message.date) {
								dateStr = message.date.displayDate({withTimeAgo:true});
								$threadHeader.find(".date")
									.data("data", dateStr)
									.attr("title", message.dateStr)
								;
							}
							$threadHeader.find(".date").html(dateStr);
							
							var toCCArray = [];
							var toFullDetailsArray = [];
							var ccFullDetailsArray = [];
							
							if (message.to) {
								$.each(message.to, function(index, to) {
									toCCArray.push(pretifyRecipientDisplay(to, mail.account.getAddress()));
									toFullDetailsArray.push(pretifyRecipientDisplay(to, mail.account.getAddress(), true));
								});
							}
							if (message.cc) {
								$.each(message.cc, function(index, cc) {
									toCCArray.push(pretifyRecipientDisplay(cc, mail.account.getAddress()));
									ccFullDetailsArray.push(pretifyRecipientDisplay(cc, mail.account.getAddress(), true));
								});
							}

							var toCCHTML = getMessage("to") + " " + toCCArray.join(", ");
							var toCCFullDetailsHTML = getMessage("to") + ": " + toFullDetailsArray.join(", ");
							
							if (message.cc && message.cc.length) {
								toCCFullDetailsHTML += "<br>cc: " + ccFullDetailsArray.join(", ");
							}
							
							if (message.bcc && message.bcc.length) {
								toCCHTML += ", bcc: " + pretifyRecipientDisplay(message.bcc.first(), mail.account.getAddress());
								toCCFullDetailsHTML += "<br>bcc: " + pretifyRecipientDisplay(message.bcc.first(), mail.account.getAddress(), true);
							}
	
							$threadHeader.find(".fullEmailToCC")
								.html(toCCHTML)
								.data("fullDetails", toCCFullDetailsHTML)
							;

							if (Settings.read("showContactPhoto")) {
								var $imageNode = $threadHeader.find(".contactPhoto");
								if (photosDisplayed < MAX_PHOTOS_TO_SHOW) {
									// function required to keep imageNode in scope
									
									// must clone from object so as to not modify it when appending mail ...
									var contactPhotoParams = $.extend({}, message.from);
									contactPhotoParams.mail = mail;
									
									setContactPhoto(contactPhotoParams, $imageNode);								
									photosDisplayed++;
								}
							}

							// only collapse if not the last thread (leave the last one expanded)
							if (index < response.mail.messages.length-1) {
								
								// it's an email from this user, so ignore/collapse it
								if (message.from.email == mail.account.getAddress()) {
									$message.addClass("collapsed");
								} else {
								   if (message.date) {
									   var lastCheckedEmail = localStorage["lastCheckedEmail"];
									   if (lastCheckedEmail) {
										   lastCheckedEmail = new Date(lastCheckedEmail);
										   console.log(" diff ours: " + message.date.diffInHours() + " parse/lastch: " + message.date.diffInSeconds(lastCheckedEmail))
										   console.log(" diff ours: " + message.date.diffInHours() + " parse/lastch: " + message.date.toString() + " " + lastCheckedEmail.toString())
										   
										   // more than 24 hours collapse it before last "supposedly" user checked emails
										   if (message.date.diffInHours() <= -24 || message.date.diffInSeconds(lastCheckedEmail) < 0) {
											   console.log("collapsed")
											   $message.addClass("collapsed");
										   }
									   } else {
										   // never last checked, might be first install or something so collapse all
										   $message.addClass("collapsed");
									   }
								   } else {
									   // can't parse the dtes so let's only collapse last
									   $message.addClass("collapsed");
								   }
								}
							}
							
							if (message.files && message.files.length) {
								var $attachmentDivs = [];
								message.files.forEach(function(file, fileIndex) {
									//var contentDisposition = MyGAPIClient.getHeaderValue(file.headers, "Content-Disposition");
									//if (contentDisposition && contentDisposition.indexOf("attachment;") != -1) {
									// means we have an inline image etc.
									// content id ex. "<image002.jpg@01CFC9BD.81F3BC70>"
									var contentId = MyGAPIClient.getHeaderValue(file.headers, "Content-Id");
									if (contentId) {
										// remove any < or > from start or end
										contentId = contentId.replace(/^</, "").replace(/>$/, "");
									}
									
									if (contentId) {
										// see if we already queued this file for fetching 
										var queuedFile;
										mail.allFiles.some(function(allFile) {
											// we couldn't use attachmentid or even content id because they seemed always unique
											if (allFile.filename == file.filename && allFile.size == file.body.size) {
												queuedFile = allFile;
												return true;
											}
										});
										
										// if not then added it to the queue
										if (!queuedFile) {
											queuedFile = mail.queueFile(message.id, file);
										}
										
										queuedFile.fetchPromise.then(function(response) {
											// $messageContent context is not lost because we are inside the loop function above... $.each(response.mail.messages, function(index, message)
											var blobUrl = generateBlobUrl(response.data, file.mimeType);
											
											console.log("fetch promise", $messageContent.find("img").eq(fileIndex));
											
											$messageContent.find("img").each(function() {
												if ($(this).attr("src").indexOf(FOOL_SANITIZER_CONTENT_ID_PREFIX + contentId) != -1) {
													$(this).attr("src", blobUrl); // "data:" + file.mimeType + ";base64," + response.data
												}
											});
										}).catch(function(errorResponse) {
											console.error("error in fetchpromise", errorResponse);
											$messageContent.find("img").replaceWith("<span>Error loading image: " + errorResponse.error + "</span>");
										});
									} else {
										var $attachmentDiv = $("<div class='attachment'><img class='attachmentIcon' style='width:16px'/> <span class='filename'></span></div>");
										
										var attachmenutImageUrl;
										if (file.mimeType && file.mimeType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
											attachmenutImageUrl = "/images/driveIcons/word.png";
										} else if ((file.mimeType && file.mimeType == "application/pdf") || file.filename.indexOf(".pdf") != -1) {
											attachmenutImageUrl = "/images/driveIcons/pdf.png";
										} else if (file.mimeType && file.mimeType.indexOf("audio/") != -1) {
											attachmenutImageUrl = "/images/driveIcons/audio.png";
										} else if (file.mimeType && file.mimeType.indexOf("image/") != -1) {
											attachmenutImageUrl = "/images/driveIcons/image.png";
										} else if (file.mimeType && file.mimeType.indexOf("application/vnd.ms-excel") != -1) {
											attachmenutImageUrl = "/images/driveIcons/excel.png";
										} else {
											attachmenutImageUrl = "/images/driveIcons/generic.png";
										}
										
										$attachmentDiv.find(".attachmentIcon")
											.attr("src", attachmenutImageUrl)
											.attr("title", file.mimeType)
										;
										$attachmentDiv.find(".filename").text(file.filename);
										$attachmentDiv.click(function() {
											$("#statusMessage").show();
											mail.account.fetchAttachment({messageId:message.id, attachmentId:file.body.attachmentId, size:file.body.size, noSizeLimit:true}).then(function(response) {
												$("#statusMessage").hide();
												
												// limit the size to 100k for opening dataUrl or else it would crash extension
												if (response.size < DATA_URL_MAX_SIZE && file.mimeType.indexOf("image/") != -1) {
													chrome.tabs.create({"url": "data:" + file.mimeType + ";base64," + response.data}); // application/octet-stream
												} else {
													var blobUrl = generateBlobUrl(response.data, file.mimeType);
											        var e = document.createEvent('MouseEvents');
											        var a = document.createElement('a');

												    a.download = file.filename;
												    a.href = blobUrl;
												    a.dataset.downloadurl =  [file.mimeType, a.download, a.href].join(':');
												    
												    // inside extenion popup windows CANNOT use .click() to execute on <a href="#"> instead must use e.init and e.dispatch event
												    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
												    a.dispatchEvent(e);
												}
											}).catch(function(errorResponse) {
												console.error(errorResponse);
												showMessage("Error: " + errorResponse.error, true);
											});
										});
										$attachmentDivs.push($attachmentDiv);
									}
								});
								
								if ($attachmentDivs.length) {
									$messageContent.append($("<div class='filesSep'>&nbsp;</div>"));
									if ($attachmentDivs.length >= 2) {
										$messageContent.append($("<div class='attachmentsCounter'>2 attach</div>"));
										$messageContent.find(".attachmentsCounter").text(getMessage("Xattachments", $attachmentDivs.length));
									}
									$messageContent.append($attachmentDivs);
								}
							}
							
							$threadHeader.show();
							
							// generate header
							var $fullEmailSenderArea = $("<div class='fullEmailSenderArea'/>");
							$fullEmailSenderArea.append($threadHeader);

							// generate message
							$message.append($fullEmailSenderArea);
							$message.append($messageContent);

							$fullEmailBody.append($message);
						});
					} else {
						// happens sometimes if a single message from the thread was deleted (ie. using "Delete this message" from dropdown on the right of message in Gmail)
						$fullEmailBody.html("Problem retreiving message!");
					}
					
					var $fullEmailContent = $("#fullEmailContent");
					$fullEmailContent
						.empty()
						.scrollTop(0)
						.scrollLeft(0)
						.append($fullEmailBody)
					;
					
					// MUST be called after $fullEmailBody is added to DOM, because addClass was not working
					if (mail.hasLabel(SYSTEM_STARRED)) {
						$("#fullEmailContent .fullEmailSenderArea .star").addClass("active");
					}

					var $fullEmailSenderAreas = $fullEmailContent.find(".fullEmailSenderArea");
					
					var $replyArea = $("#composeWrapperTemplate").clone();
					$replyArea.removeAttr("id");
					
					if (Settings.read("showSendAndArchiveButton")) {
						$replyArea.find(".composeRightWrapper").addClass("showSendAndArchive");
					}
					
					if (mail.messages && mail.messages.last()) {
						var totalRecipients = 0;
						if (mail.messages.last().to) {
							totalRecipients += mail.messages.last().to.length;
						}
						if (mail.messages.last().cc) {
							totalRecipients += mail.messages.last().cc.length;
						}
						
						if (totalRecipients >= 2) {
							console.log("show reply all")
							$replyArea.find(".replyToAllText").show();
						}
					}
					
					// reply link
					$replyArea.find(".composeAreaReply").off("click").on("click", function() {
						setFocusToComposeInput();
					});
					
					// reply All link
					$replyArea.find(".replyToAllLink").off("click").on("click", function() {
						console.log("replyall");
						var $composeWrapper = $(this).closest(".composeWrapper");
						$composeWrapper.data("replyAll", true);
						setFocusToComposeInput();
					});
					
					$replyArea.find(".send, .sendAndArchive").off("click").on("click", {mail:mail}, function(e) {
						var $sendingButton = $(this);
						
						// save this varirable because apparently e.data was being lost inside callback of .postReply just below??
						var thisMail = e.data.mail;
						
						$sendingButton.addClass("sendingButton");
						var sendAndArchive = $sendingButton.hasClass("sendAndArchive");
						
						var message = $(".composeInput").val();
						
						var $composeWrapper = $(this).closest(".composeWrapper");
						$composeWrapper.addClass("sending");
						$(this).find("div").text(getMessage("sending") + "...");
						
						thisMail.postReply(message, $composeWrapper.data("replyAll"), function(response) {
							console.log("reply callback", response);
							if (response.error) {
								if (response.sessionExpired) {
									showMessage("Session expired, please save your reply outside of this extension and <a target='_blank' href='" + SESSION_EXPIRED_ISSUE_URL + "'>click here to resolve the issue</a>", true);
								} else {
									showMessage(response.error, true);
								}
								$replyArea.closest(".composeWrapper")
									.removeClass("sending")
								;
								$sendingButton.removeClass("sendingButton");
								$replyArea.find(".send").find("div").text(getMessage("send"));
							} else {
								
								if (sendAndArchive) {
									thisMail.archive();
								}
								
								$replyArea.closest(".composeWrapper")
									.removeClass("sending")
									.addClass("sendingComplete")
								;
								$sendingButton.removeClass("sendingButton");
								
								// this timeout MUST happen BEFORE the next timeout below for hiding the emails
								setTimeout(function() {
									// place this in a timeout to ensure autoSave is removed before it is added on blur event
									console.log("autoSave remove: " + new Date());
									localStorage.removeItem("autoSave");
								}, 200);

								setTimeout(function() {
									if (Settings.read("replyingMarksAsRead")) {
										markAsRead($mail);
									}
									hideFullEmail();
								}, 1000);
							}
						});
					});
					
					$replyArea.show();
					$fullEmailContent.append($replyArea);
					
					$replyArea.find(".composeInput")
						// must declare autoresize after the above methods or else it would cause height issues - it would just keep growing
						.autoResize({animateCallback:function() {
							$(this).get(0).scrollIntoView();
						}})
						.off("keydown").on("keydown", function(e) {
							console.log("keydown: ", e);
							if (isCtrlPressed(e) && e.keyCode == 13) {
								var $button;
								if (Settings.read("showSendAndArchiveButton")) {
									$button = $(".sendAndArchive");
								} else {
									$button = $(".send");
								}
								console.log("button focus click");
								
								// Do this to prevent autoSave from set "after" being removed
								$(this).blur();
								console.log("autoSave remove2: " + new Date());
								localStorage.removeItem("autoSave");

								$button
									.focus()
									.click()
								;
								return false;
							} else {
								return true;
							}
						})						
						.off("focus").on("focus", {mail:mail}, function(e) {
							$replyArea.addClass("clicked");
							replyingToMail = e.data.mail;
							autoSaveInterval = setInterval(function() {
								autoSave();
							}, seconds(3));
						})
						.off("blur").on("blur", {mail:mail}, function(e) {
							clearInterval(autoSaveInterval);
							autoSave();
						})
					;
					
					/*
					var lastCompose = localStorage.lastCompose;
					if (lastCompose) {
						try {
							lastCompose = JSON.parse(lastCompose);
						} catch (e) {
							logError("could not parse lastcompose: " + e);
						}
						if (lastCompose) {
							if (lastCompose.mailId == mail.id && lastCompose.message) {
								if (lastCompose.replyAll) {
									$replyArea.find(".replyToAllLink").click();
								} else {
									$replyArea.find(".composeAreaReply").click();									
								}
								$replyArea.find(".composeInput").val( lastCompose.message );
							}
						}
					}			
					*/		
					
					$fullEmailContent.scroll(function() {
						console.log("scroll calle");
					    var y = $(this).scrollTop();
					    if (typeof fixedAreaTop != "undefined" && y >= (fixedAreaTop-$(this).offset().top)) { //$(this).offset().top
					    	initFixedArea();
					    } else {
					    	var $messageContent = $(this).find(".messageContent");
							if (!$messageContent.hasClass("zoomed")) {
								$fixedArea.removeClass('fixed');
						      
								scrollingWidth = $(".fullEmailBody .message").last().width();
								viewableWidth = $("html").width()

								if (scrollingWidth > viewableWidth) {
									$fixedArea.css("right", scrollingWidth-viewableWidth+fixedRightMargin);
								} else {
									$fixedArea.css("right", "0");
								}
							}
					    }
					});
					
					setTimeout(function() {
						var $contentPossiblyContainingScrollbars;
						if (Settings.read("accountAddingMethod") == "autoDetect") {
							$contentPossiblyContainingScrollbars = $fullEmailContent.find(".messageContent > div");
						} else {
							$contentPossiblyContainingScrollbars = $fullEmailContent.find(".messageContent");
						}
						if ($contentPossiblyContainingScrollbars.hasHorizontalScrollbar()) { //$fullEmailContent.hasHorizontalScrollbar()
							// patch: for some reason .stop() would remove my vertical scrollbars in my #inboxes putting overflow-y:hidden 
							//$("#inboxes").stop();
							$("#inboxes").animate({
							    width: 0
							}, animationDuration, ["linear"], function() {
								initialInboxesWidth = $("#body").width();
								$("#fullEmailContent").css("width", initialInboxesWidth-0-6);
								$("#fullEmailContent").css("overflow-x", "auto");
							});
						}
					}, animationDuration + 100)
					
					interceptClicks($(".fullEmailBody .messageContent a"), mail);
					
					$fullEmail.slideDown(animationDuration, function() {

						$fixedArea = $fullEmailContent.find(".emailDetailsTopRight").last();
						$fixedArea.removeClass('fixed');
						if ($fixedArea.offset()) {
							fixedAreaTop = $fixedArea.offset().top;
						}

						setTimeout(function() {
							console.log("timeout 100 set scorllingwiwdth")
							scrollingWidth = $(".fullEmailBody .message").last().width();
							viewableWidth = $("html").width()
							console.log(scrollingWidth + " " + viewableWidth);
							if (scrollingWidth > viewableWidth) {
								$fixedArea.css("right", scrollingWidth-viewableWidth+fixedRightMargin);
							}		
						}, 100);
						var $firstUncollapsedThread = $fullEmailContent.find(".message:not(.collapsed)").first();
						var topAreaHeight;
						if (Settings.read("accountAddingMethod") == "autoDetect") {
							topAreaHeight = 96;
						} else {
							topAreaHeight = $("#fullEmailActionButtons").height() + $("#fullEmailSubjectArea").height() + 24;
						}
						
						console.log("topareaheight: " + topAreaHeight);
						var targetOffset = $firstUncollapsedThread.position().top - topAreaHeight;
						
						if (targetOffset > 0) {
							console.log('scrolltop')
							$fullEmailContent.animate({scrollTop: targetOffset}, 700);
						}
						
						if (markAsReadSetting) {
							mail.markAsRead({instantlyUpdatedCount:true});
							if (!$mail.hasClass("read")) {
								updateUnreadCount($mail, -1); // must do this before remove 'read' class
								$mail.addClass("read");
							}
						}
					});
					
					// patch: even though we call this scrollTop at the top - it seems that because the inner content is not append until later so the scroll position must be set after appending content
					$fullEmailContent
						.scrollTop(0)
						.scrollLeft(0)
					;
					
					$("#statusMessage").hide();
					callback();
				}
			});
		}

	}, 0);
	
}

function hideMail(o, action, stayOpen) {
	
	bg.updateNotificationTray();
	
	updateUnreadCount(o, -1);
	
	if (totalUnreadCount == 0 || action == "delete" || action == "archive" || action == "spam" || (!Settings.read("rememeberReadEmails") || (Settings.read("rememeberReadEmails") && Settings.read("emailsMarkedAsRead") == "hide"))) {	
	   	var $inbox = $(o).closest(".inbox");
	   	var $mail = $(o).closest(".mail");
	   	var unreadCount = $inbox.find(".unreadCount").text();
	
	   	// save selected mail index before hiding any mails in the list
	   	var $allMail = $(".mail:visible");
	   	var selectedIndex = $allMail.index($allMail.filter(".selected"));
	   	
	   	var windowClosePatch;
	   	// patch for hanging issue with popup window not closing: it happens when window.close is called while the popup window is resizing (usually resizing caused hiding emails with or without jquery animation)
	   	if (!DetectClient.isWindows()) {
	   		windowClosePatch = true;
	   		$.fx.off = true;
	   	}
	   	
		$mail.animate({
		    opacity: 0,
		    height: 0
		}, 200, ["swing"], function() {
			$(this).hide();
			
			// if no more emails in label group remove labelheader
			var $labelGroup = $(o).closest(".labelGroup");
			if ($labelGroup.find(".mail").filter(":visible").length == 0) {
				$labelGroup.slideUp();
			}
			
			// if we just hid the selected mail, then select next one
			if ($mail.hasClass("selected")) {
				
				// not the last one
				console.log((selectedIndex+1) + " " + $allMail.length);
				console.log($allMail);
				if (selectedIndex+1 < $allMail.length) {
					$allMail.eq(selectedIndex+1).addClass("selected");
				} else {
					// we just hid the last one so let's re-select the last one in this new list					
					$(".mail:visible").last().addClass("selected"); // had to use .mail:visible vs $allMail (because it wasn't working) 
				}
			}
			
		   	if (totalUnreadCount == 0) {
				if (!stayOpen) { 
					if (window) {
					  	initPopup(0);

					  	// see if showall emails link is visible AND in display hide read emails
					  	if ($("#showAllEmails:visible").text() == getMessage("hideReadEmails")) {
					  		// don't close window because we are showing all hidden mails and might be perform multiple actions on other emails like inbox management etc.
					  	} else {
					  		if (windowClosePatch) {
					  			setTimeout(function() {
					  				window.close();
					  			}, 150);
					  		} else {
					  			window.close();
					  		}
					  	}
				  	}
			  	}
		   	} else if (unreadCount == 0) {
				$inbox.find('.collapseArrow')
					.addClass("collapsed")
					.addClass('hidden')
				;		  
		   	}
		});
	} else if (action == "markAsRead") {
		o.addClass("read");
	}
}

function displayAccounts() {
	unreadCount = 0;
	photosDisplayed = 0;
	
	emailCount = 0;
	firstReadEmailPosition = -1;
	lastUnreadEmailPosition = -1;
	showReadEmails = true;

	$('#content').empty();

	var onlyCountUnreadEmails = Settings.read("rememeberReadEmails") && Settings.read("emailsMarkedAsRead") == "show";
	
	// count unread FIRST to use the number in rendering after...
	totalVisibleMails = 0;
	$.each(accounts, function (i, account) {
		unreadCount += account.getUnreadCount();

		var emails = account.getMail();
		
		// if setting and in popup window than only show and count unread emails
		if (onlyCountUnreadEmails) {
			for (var a=0; a<emails.length; a++) {
				if (emails[a].lastAction == "markAsRead") {
					if (firstReadEmailPosition == -1) {
						firstReadEmailPosition = emailCount;
					}
				} else {
					totalVisibleMails++;
					lastUnreadEmailPosition = emailCount;
				}
				emailCount++;
			}
		} else {
			if (Settings.read("rememeberReadEmails") && Settings.read("emailsMarkedAsRead") == "hide") {
				totalVisibleMails += account.getUnreadCount();
			} else {
				totalVisibleMails += emails.length;
			}
		}
	});
	
	if (onlyCountUnreadEmails) {
		// if read emails are listed before unread emails and we can't display all the emails in the visible popup without scrolling then hide the read emails
		var MAX_VISIBLE_EMAILS_BEFORE_SCROLLING = 6;
		console.log(emailCount + " " + firstReadEmailPosition + " " + lastUnreadEmailPosition);
		
		if (emailCount > MAX_VISIBLE_EMAILS_BEFORE_SCROLLING && firstReadEmailPosition != -1 && firstReadEmailPosition < lastUnreadEmailPosition) {
			showReadEmails = false;
		} else {
			totalVisibleMails = emailCount;
		}
	}
	
	$.each(accounts, function (i, account) {
		// legacy: detecting the existance of the method so on extension update there are no issues with chrome extensions not reloading etc.
		if (account.hasBeenIdentified) {
			// if last account has not been identified ie. called https://mail.google.com/mail/u/1 ...
			if (i == (accounts.length-1) && !account.hasBeenIdentified()) {
				// do not show account
			} else {
				renderAccount(account);
			}
		} else {					
			renderAccount(account);
		}
	});
	
	// arriving from preview button in notification
	if (!emailPreviewed) {
		emailPreviewed = true;
		var previewMailId = getUrlValue(location.href, "previewMailId");
		if (previewMailId) {
			
			temporailyDisableTransitions();
			
			$(".mail:visible").each(function(index, mailNode) {
				var $mail = $(mailNode);
				var mail = $mail.data("data");
				if (mail.id == previewMailId) {
					showFullEmail({$mail:$mail, previewFromNotification:true});
					return false;
				} else {
					return true;
				}			
			});
		}
	}
	
	updateBadge(unreadCount);
}

function setContactPhoto(params, imageNode) {
	// contact photo
	getContactPhoto(params, function(cbParams) {
		console.log("cbParams", cbParams)
		if (!cbParams.error) {
			imageNode.on("error", function() {
				imageNode.attr("src", "images/noPhoto.png");
			});
			
			// used timeout because it was slowing the popup window from appearing
			setTimeout(function() {
				imageNode.attr("src", cbParams.photoUrl);
			}, 10);
		} else {
			var name, email;			
			if (params.name) {
				name = params.name;
			} else if (params.mail) {
				name = params.mail.getName();
			}
		}
	});
}

function setInboxLabelArea($inbox, unreadCount) {
	var $unreadCountNode = $inbox.find(".unreadCount");
	$unreadCountNode.data("data", unreadCount);
	if (unreadCount >= 1) {
		$unreadCountNode.text("(" + unreadCount + ")");
		if (unreadCount >= 2 && Settings.read("showMarkAllAsRead")) {
			$inbox.find(".markAllAsRead").addClass("inline-block");
		} else {
			$inbox.find(".markAllAsRead").hide();
		}
	} else {
		$unreadCountNode.text("");
		$inbox.find(".markAllAsRead").hide();
	}
	$inbox.find(".inboxLabelArea").toggleClass("hasUnread", unreadCount != 0);	
}

function updateUnreadCount(o, offset) {
	
	if (o.hasClass("read") && offset == -1) {
		// alrady read so don't do anything
		return;
	}
	if (!o.hasClass("read") && offset == 1) {
		// alrady unread so don't do anything
		return;
	}
	
	var $inbox = $(o).closest(".inbox");
	
	$unreadCountNode = $inbox.find(".unreadCount");
	
	var unreadCount = $unreadCountNode.data("data");
	unreadCount += offset;
	
	setInboxLabelArea($inbox, unreadCount);

	totalUnreadCount += offset;
	
	// update background unreadcount because it was out of sync after marking an email as read (since we don't poll immedaitely after), the count will be temporary because it will be overwritten on every poll
	bg.unreadCount = totalUnreadCount;
	
	updateBadge(totalUnreadCount);
}

function markAsRead(o, mail) {
	if (!mail) {
		mail = o.data("data");
	}
	var dfd = mail.markAsRead({instantlyUpdatedCount:true});
	hideMail(o, "markAsRead");
	return dfd;
}

function markAsUnread(o, mail) {
	mail.markAsUnread();
	updateUnreadCount(o, +1); // must do this before remove 'read' class
	o.removeClass("read");
}

function cleanEmail(email) {
	return email.replace("<", "").replace(">", "");
}

function searchContacts(searchTerm) {
	var $contacts = $("#contacts");
	var $contactsTable = $("<table/>");

	$("#contacts table").remove();
  	$.each(contacts, function(a, contact) {
	   if (!searchTerm || contact.formattedTitle.toLowerCase().indexOf(searchTerm) != -1 || contact.formattedPhoneNumbers.toLowerCase().indexOf(searchTerm) != -1 || contact.formattedEmails.toLowerCase().indexOf(searchTerm) != -1 || contact.formattedPostalAddresses.toLowerCase().indexOf(searchTerm) != -1) {
			var $tr
			$tr = $("<tr/>");
			if (Settings.read("showContactPhoto")) {
				$tr.append($("<td class='contactPhotoWrapper'/>").append($("<img class='contactPhoto' src='images/noPhoto.png'/>")));
			}
			$tr.append($("<td class='title'/>").append(contact.formattedTitle));
			$tr.append($("<td/>").append(contact.formattedEmails));
			$tr.append($("<td class='phoneNumber'/>").append(contact.formattedPhoneNumbers));
			$tr.append($("<td class='postalAddress'/>").append(contact.formattedPostalAddresses));
			$tr.data("data", contact);
			$contactsTable.append($tr);
	   }
  	});
  	$contacts.append( $contactsTable );
  	loadContactPhotos()
}

function loadContacts(getContactsParams) {
	return new Promise(function(resolve, reject) {

		if (Settings.read("showContactPhoto")) {
			bg.oAuthForContacts.ensureTokenForEmail(getContactsParams.account.getAddress(), function(cbParams) {
				if (!cbParams.error) {
					console.log("ensureTokenForEmail for showing photos");
					$("#contactsMessage").show();
				} else {
					logError("error loadcontacts: " + cbParams.error);
				}
			});
		}
		
		function maybeFetchContacts(params) {
			return new Promise(function(resolve, reject) {
				if (params.forceUpdate) {
					$("#statusMessage").show();
					fetchContacts(params.account.getAddress()).then(function() {
						resolve();
					}).catch(function(errorResponse) {
						reject(errorResponse);
					});
				} else {
					resolve();
				}
			});
		}
	
		maybeFetchContacts(getContactsParams).then(function(response) {
			getContacts(getContactsParams, function(params) {
				if (params && params.contacts) {
					
					$("#statusMessage").show();
					setTimeout(function() {
						$("#inboxes").hide();
						
						params.contacts.sort(function (a, b) {
							if (a.title.$t.toLowerCase() > b.title.$t.toLowerCase())
								return 1;
							if (a.title.$t.toLowerCase() < b.title.$t.toLowerCase())
								return -1;
							return 0;
						});
			
						contacts = [];
						$.each(params.contacts, function(i, contact) {
							if (contact.title.$t) {
								var phoneNumbers = "";
								if (contact.gd$phoneNumber) {
									$.each(contact.gd$phoneNumber, function(a, phoneNumber) {
										var prefix = "";
										if (phoneNumber.label) {
											prefix = phoneNumber.label;
										} else {
											if (phoneNumber.rel.indexOf("#mobile") != -1) {
												prefix = getMessage("contactsMobile");
											} else if (phoneNumber.rel.indexOf("#home") != -1) {
												prefix = getMessage("contactsHome");
											} else if (phoneNumber.rel.indexOf("#work") != -1) {
												prefix = getMessage("contactsWork");
											} else {
												prefix = getMessage("contactsOther");
											}
										}
										phoneNumbers += "<span class='contactDetailsRel'>" + prefix + ":</span> " + phoneNumber.$t + "<br>";
									});
								}
								var emails = "";
								if (contact.gd$email) {
									$.each(contact.gd$email, function(a, email) {
										emails += "<a target='_blank' href='mailto:" + email.address + "'>" + email.address + "</a>" + "<br>";
									});
								}
								var postalAddresses = "";
								if (contact.gd$postalAddress) {
									$.each(contact.gd$postalAddress, function(a, postalAddress) {
										postalAddresses += "<a target='_blank' href=\"http://maps.google.com?q=" + encodeURIComponent(postalAddress.$t) + "\">" + postalAddress.$t + "</a>" + "<br>";
									});
								}
								
								var contactObj = contact;
								contactObj.formattedTitle = cleanEmail(contact.title.$t);
								contactObj.formattedPhoneNumbers = phoneNumbers;
								contactObj.formattedEmails = emails;
								contactObj.formattedPostalAddresses = postalAddresses;
								contacts.push( contactObj );
							}
						});
						$("#contactsHeader").show();
						$("#contacts").removeClass("hideImportant");
						$("#contacts").data("data", getContactsParams.account);
	
						stretchWindow();
						
						searchContacts();
						$("#statusMessage").hide();
						$("#contactsSearch").focus();
						resolve();
					}, 50);
				} else {
					openContactsPage(getContactsParams.account);
					resolve();
				}
			});		
		}).catch(function(errorResponse) {
			throw errorResponse;
		});
	});
}

function openContactsPage(account) {
	chrome.tabs.create({url:"https://www.google.com/contacts/u/" + account.id + "/"});
	window.close();
}

function generateContactPhotoURLThread($tr, contactsAccount) {
	//console.log("contact data", $tr.data("data"))
   generateContactPhotoURL($tr.data("data"), contactsAccount, function(generateContactPhotoURLResponse) {
	   var $contactPhoto = $tr.find(".contactPhoto");
	   $contactPhoto.on("error", function() {
		   $contactPhoto.attr("src", "images/noPhoto.png");
		});
	   $contactPhoto.on("load", function() {
		   $contactPhoto.fadeIn();
		});
		
		// used timeout because it was slowing the popup window from appearing
		setTimeout(function() {
			$contactPhoto.attr("src", generateContactPhotoURLResponse.photoUrl);
		}, 10);	   
   });
}

function loadContactPhotos() {
	if (Settings.read("showContactPhoto")) {	
		contactsScrollHeight = $("#contacts").height();
		var contactsAccount = $("#contacts").data("data");
		var photosDisplayed = 0;
		  $("#contacts tr").each(function(i, tr) {
		   var $tr = $(tr);
		   if (isVisibleInScrollArea($tr, contactsScrollHeight)) {
			   //$tr.find(".contactPhoto").show();
			   if (photosDisplayed < MAX_PHOTOS_TO_SHOW) {
			   		generateContactPhotoURLThread($tr, contactsAccount);
			   		photosDisplayed++;
			   }		   	
		   }
		  });
	}
}

function renderAccount(account) {
	var emails = account.getMail();
	
	$account = $(".accountTemplate").clone();
	$account
		.removeClass("accountTemplate")
		.addClass("account")
		.data("data", account)
	;

	if (account.getSetting("openLinksToInboxByGmail")) {
		$account.addClass("inboxByGmail");
	}
	
	// must put the '.find's separaterly because you .find().find is aggregate
	var inboxForStr = "<span title='" + account.getAddress() + "'>" + account.getEmailDisplayName() + "</span>";
	
	var $openInboxSelector;
	
	if (account.error) {
		inboxForStr += " <span class='accountErrorWrapper'>";
		inboxForStr += "(<span class='accountError' title=\"" + account.getError().niceError + "\">" + account.getError().niceError + "</span> " + account.getError(true).instructions + ")";
		inboxForStr += "</span>";
		
		$account.find(".inboxActions").hide();
		
		// patch: make the email address text itself clickable or else all previous error links will also bubble to email address label area and click it also
		//$openInboxSelector = $account.find(".inboxLink");
	} else {
		// no errors so make the whole email address "area" clickable
		$openInboxSelector = $account.find(".inboxLabelArea");
		$openInboxSelector.click({account:account}, function(event) {
			var openParams = {};
			if (isCtrlPressed(event) || event.which == 2) {
				openParams.openInNewTab = true;
			}
			event.data.account.openInbox(openParams);
			sendGA("inboxLabelArea", "click");		
		});
	}
	
	$account.find(".inboxFor").html(inboxForStr);

	$account.find(".compose").click({account:account}, function(event) {
		sendGA("inboxLabelArea", "compose");
		event.data.account.openCompose();
		return false;
	});
	$account.find(".markAllAsRead").click(function(event) {
		sendGA("inboxLabelArea", "markAllAsRead");
		
		var $emailsToMarkAsRead = $(this).closest(".account").find(".mail:visible");
		// only marks max 10 as unread so if more than 10 let's refresh the list, and user can choose to mark as read again
		if ($emailsToMarkAsRead.length > MAX_EMAILS_TO_ACTION) {
			showMessage(getMessage("tooManyUnread", [MAX_EMAILS_TO_ACTION]), true);
		} else {
			var deferreds = new Array();
			
			$emailsToMarkAsRead.each(function() {				 
				 var deferred = markAsRead($(this));
				 deferreds.push(deferred);
			});		

		   $.when.apply($, deferreds).always(function() {

		   });

		}
		
		return false;
	});
	$account.find(".sendPageLink").click({account:account}, function(event) {
		chrome.tabs.getSelected(null, function (tab) {
			sendGA("inboxLabelArea", "sendPageLink");
			sendPageLink(null, tab, event.data.account);
			window.close();
		});
		return false;
	});
	$account.find(".contactsLink").click({account:account}, function(event) {
		sendGA("inboxLabelArea", "contactsLink");
		loadContacts({account:account});		
		return false;
	});
	$account.find(".searchLink").click({account:account}, function(event) {
		sendGA("inboxLabelArea", "searchLink");
		var $account = $(this).closest(".account");
		$account.find(".inboxActions").fadeOut();
		$account.find(".searchWrapper").fadeIn();
		$account.find(".searchInput").focus();
		return false;
	});
	$account.find(".searchInput")
		.click({account:account}, function() {
			return false;
		})
		.keypress(function(e) {
			// enter pressed
		    if (e.which == 13) {
		    	var $account = $(this).closest(".account");
		    	$account.find(".search").click();
		    }
		})
	;
	$account.find(".search").click({account:account}, function(event) {
		var $account = $(this).closest(".account");
		var searchStr = $account.find(".searchInput").val();
		event.data.account.openSearch(searchStr);
		return false;
	})
	$account.find(".cancelSearch").click({account:account}, function() {
		$(".searchWrapper").fadeOut();
		$(".inboxActions").fadeIn();
		return false;
	})

	setInboxLabelArea($account.find(".inbox"), account.getUnreadCount());

	$account.fadeIn(500).appendTo("#content");

	var inboxNode = $account.find(".inbox");
	var $emailsNode = $account.find(".emails");	
	var previousLabel = "FIRST_LABEL";
	var $labelGroup;
	var $labelGroupWithMostRecentEmail;
	var mostRecentEmailDate = new Date(1);
	
	if (Settings.read("collapseEmailAccounts")) {
		$emailsNode.hide();
		$account.find(".collapseArrow").addClass("collapsed");
	}

	if (emails) {
		
		var surpassedMaxEmailsToShowPerAccount = false;
		
		emails.every(function(mail, mailIndex) {
			if (mailIndex+1 > ABSOLUTE_MAX_EMAILS_TO_SHOW_IN_POPUP) {
				return false;
			}
			
			$mail = $("#mailTemplate").clone();
			$mail
				.removeAttr("id")
				.data("data", mail)
			;
			
			if (mail.lastAction == "markAsRead") {
				$mail.addClass("read");
			}
			
			if (mailIndex+1 > Settings.read("maxEmailsToShowPerAccount")) {
				$mail.addClass("surpassedMaxEmailsToShowPerAccount");
				surpassedMaxEmailsToShowPerAccount = true;
			}
			
			// add analytics here instead of leaving it to common.js because the .clicks below return falses
			$mail.find(".button, .icon").click(function() {
				id = $(this).attr("class").split(" ")[1];
				// category, action
				sendGA("inbox", id);
			});
			
			$mail.find(".delete").click({account:account, mail:mail, $mail:$mail}, function(event) {
				event.data.mail.deleteEmail({instantlyUpdatedCount:true});
				hideMail(event.data.$mail, "delete");
				return false;
			});		
			$mail.find(".archive").click({account:account, mail:mail, $mail:$mail}, function(event) {
				event.data.mail.archive({instantlyUpdatedCount:true});
				hideMail(event.data.$mail, "archive");
				return false;
			});		
			$mail.find(".spam").click({account:account, mail:mail, $mail:$mail}, function(event) {
				event.data.mail.markAsSpam({instantlyUpdatedCount:true});
				hideMail(event.data.$mail, "spam");
				return false;
			});		
			$mail.find(".markAsRead").click({account:account, mail:mail, $mail:$mail}, function(event) {
				markAsRead(event.data.$mail);
				return false;
			});
			$mail.find(".markAsUnread").click({account:account, mail:mail, $mail:$mail}, function(event) {
				markAsUnread(event.data.$mail, event.data.mail);
				return false;
			});
			
			var selectorsToOpenEmail = ".open";
			if (!Settings.read("emailPreview")) {
				selectorsToOpenEmail += ", .emailDetails";
			}
			
			$mail.find(selectorsToOpenEmail).click({account:account, mail:mail}, function(event) {
				var openParams = {};
				if (isCtrlPressed(event) || event.which == 2) {
					openParams.openInNewTab = true;
				}
				event.data.mail.open(openParams);
				setTimeout(function() {
					window.close();
				}, 100);
				return false;
			});
			
			$mail.find(".reply").click({account:account, mail:mail}, function(event) {
				event.data.mail.reply();
				setTimeout(function() {
					window.close();
				}, 100);
				return false;
			});

			var $star = $mail.find(".star"); 
			if (Settings.read("accountAddingMethod") == "oauth") {
				if (mail.hasLabel(SYSTEM_STARRED)) {
					$star.addClass("active");
				}
			}
			$star.click({mail:mail}, function(event) {
				if ($(this).hasClass("active")) {
					if (Settings.read("accountAddingMethod") == "oauth") {
						$(this).removeClass("active");
						event.data.mail.removeStar();
					}
				} else {
					$(this).addClass("active");
					event.data.mail.star();
				}
				return false;
			});
			
			$mail.find(".author").empty().append( mail.generateAuthorsNode() );
			if ($mail.find(".author").text() == "") {
				$mail.find(".author").html(getMessage("unknownSender"));
			}
			
			$mail.find(".subject").html(mail.title);			
			$mail.find(".date")
				.html(mail.issued.displayDate({relativeDays:true}))
				.data("data", mail.issued)
				.attr("title", mail.issued.toLocaleString())
			;			
			
			if (Settings.read("linesInSummary") != 0) {
				var maxSummaryLetters;
				var LETTERS_PER_LINE = 90;
				var MAX_EMAILS_FOR_SHOWING_SCROLLBARS = 3;
				
				/*
				if (Settings.read("linesInSummary") == "auto") {
					var EMAIL_HEADER_IN_LETTERS = 240; // must included the header taking up space when calculating approx words
					maxSummaryLetters = (2000-(EMAIL_HEADER_IN_LETTERS*unreadCount)) / unreadCount;
					maxSummaryLetters = Math.max(LETTERS_PER_LINE, maxSummaryLetters); // minimum 90 letters
				} else {
					maxSummaryLetters = Settings.read("linesInSummary") * LETTERS_PER_LINE;
				}
				*/

				var EOM_Message = " <span class='eom' title=\"" + getMessage("EOMToolTip") + "\">[" + getMessage("EOM") + "]</span>"
				if (mail.message && mail.message.length && Settings.read("linesInSummary") == "auto" || Settings.read("linesInSummary") == "autoAndImages") {
					maxSummaryLetters = LETTERS_PER_LINE * 2;
					var $summary = $mail.find(".summary");
					if (mail.getLastMessageText().length < maxSummaryLetters || totalVisibleMails > MAX_EMAILS_FOR_SHOWING_SCROLLBARS) {
						var summary = mail.getLastMessageText({maxSummaryLetters:maxSummaryLetters, EOM_Message:EOM_Message});
						$summary.html( summary );
					} else {
						$summary.addClass("scrollbars");
						
						try {
							$threadNode = $("<div>" + mail.messages.last().content + "</div>");
						} catch (e) {
							var error = "Error parsing mail.content: " + e;
							logError(error);
							$threadNode = $("<div/>");
							$threadNode.text(error);
						}						
						
						if (Settings.read("linesInSummary") == "autoAndImages") {
							fixRelativeLinks($threadNode);
							showImages($threadNode);
						}
						
						$threadNode.find("table").first().attr("cellpadding", 0);
						$summary.append( $threadNode );
						
						interceptClicks($summary.find("a"), mail);
					}
				} else {
					maxSummaryLetters = Settings.read("linesInSummary") * LETTERS_PER_LINE;
					$mail.find(".summary").html( mail.getLastMessageText({maxSummaryLetters:maxSummaryLetters, EOM_Message:EOM_Message}) );
				}
			}
			
			if (Settings.read("emailPreview")) {
				$mail.find(".emailDetails").click({account:account, mail:mail, $mail:$mail}, function(event) {
					
					showFullEmail({$mail:event.data.$mail});
					
					sendGA("inbox", "expand");
				});
			}

			$mail.hover(function() {
				$(this).removeClass("hideScrollbars");
			}, function() {
				$(this).addClass("hideScrollbars");
			});
			
			if (Settings.read("showContactPhoto")) {      
				$mail.find(".contactPhoto").css("display", "block");
			}

			if (previousLabel == "FIRST_LABEL" || previousLabel != mail.monitoredLabel) {
				$labelGroup = $("<div class='labelGroup'><div class='labelHeader'></div><div class='labelEmails'></div></div");
				
				var $labelHeader = $labelGroup.find(".labelHeader");
				$labelHeader.text( mail.formattedLabel + "" );
				$labelHeader.attr("title", getMessage("openLabel"));
				if (!Settings.read("groupByLabels")) {
					$labelHeader.hide();
				}
				$labelHeader.click({account:account, label:mail.monitoredLabel}, function(event) {
					event.data.account.openLabel(event.data.label);
					window.close();
				});
				
				$emailsNode.append( $labelGroup );
			}
			$labelEmails = $labelGroup.find(".labelEmails");
			
			if (showReadEmails || (!showReadEmails && mail.lastAction != "markAsRead")) {
				if (Settings.read("rememeberReadEmails") && Settings.read("emailsMarkedAsRead") == "hide" && mail.lastAction == "markAsRead") {
					// don't show
				} else {
					$mail.show();
				}					
			}
			$labelEmails.append( $mail );
			
			if (Settings.read("linesInSummary") == "auto" || Settings.read("linesInSummary") == "autoAndImages") {
				var maxHeightPerMessage = 300;
				$labelEmails.find(".summary.scrollbars").css("max-height", maxHeightPerMessage/totalVisibleMails + "px")
			}
			
			if (mail.issued > mostRecentEmailDate) {
				mostRecentEmailDate = mail.issued;
				$labelGroupWithMostRecentEmail = $labelGroup;
			}
			
			previousLabel = mail.monitoredLabel;
			return true;
		});
		
		if (surpassedMaxEmailsToShowPerAccount && Settings.read("maxEmailsToShowPerAccount") < ABSOLUTE_MAX_EMAILS_TO_SHOW_IN_POPUP) {
			var $maxEmailsToShowPerAccountDiv = $("<div class='maxEmailsToShowPerAccount'>Show more emails</div>");
			$maxEmailsToShowPerAccountDiv.click(function() {
				$(this).closest(".emails").find(".surpassedMaxEmailsToShowPerAccount").removeClass("surpassedMaxEmailsToShowPerAccount");
				$(this).hide();
			});
			$emailsNode.append( $maxEmailsToShowPerAccountDiv );
		}
		
		if (popupView == POPUP_VIEW_CHECKER_PLUS) {
			// hide labels if no visible emails
			$(".labelGroup").each(function() {
				if ($(this).find(".mail").filter(":visible").length == 0) {
					// exception if this option is on than don't hide them
					if (!Settings.read("collapseEmailAccounts")) {
						$(this).hide();
					}
				}
			});
		}
		
		// place grouplabel with most recent email at the top
		//if (inNotificationWindow && mostRecentEmailDate.diffInMinutes() >= -1) {
			//$emailsNode.prepend($labelGroupWithMostRecentEmail);
		//}

		if (emails.length == 0) {
			inboxNode.find(".collapseArrow").addClass("hidden");
		}

		if (Settings.read("showContactPhoto")) {
			bg.oAuthForContacts.ensureTokenForEmail(account.getAddress(), function(cbParams) {
				if (!cbParams.error) {
					$(".mail").each(function() {
						var mail = $(this).data("data");
						if (mail) {
							var $imageNode = $(this).find(".contactPhoto");
							
							if (photosDisplayed < MAX_PHOTOS_TO_SHOW) {
								// function required to keep imageNode in scope
								setContactPhoto({mail:mail}, $imageNode);								
								photosDisplayed++;
							}
						}
					});
				} else {
					logError("error showcontactphoto: " + cbParams.error);
				}
			});
		}

		inboxNode.find(".collapseArrow").click(function () {
			inboxNode.find(".collapseArrow").toggleClass("collapsed");
			inboxNode.find('.emails').slideToggle('fast');			
			sendGA("inboxFold", "click");
		});
	}
	
	if (account.getSetting("useColors")) {
		var $nodesToColorize = $account.find(".inboxLabelAreaWrapper, .labelHeader");

		var colorStart = account.getSetting("colorStart", "colorStart" + (account.id+1));
		var colorEnd = account.getSetting("colorEnd", "colorEnd" + (account.id+1));
		
		setAccountGradient($nodesToColorize, colorStart, colorEnd);
		$account.find(".mail, .emailDetailsTopRight").css("background-color", colorStart);
	}
	
	if (Settings.read("linesInSummary") == "auto" || Settings.read("linesInSummary") == "autoAndImages") {
		setTimeout(function() {
			$account.find(".summary.scrollbars").each(function() {
				var $summary = $(this);
				if ($(this).hasVerticalScrollbar() && $summary.height() >= 30) {
					//console.log($summary.text() + " height: " + $summary.height())
					$(this).siblings(".downArrow").fadeIn();
					$(this).siblings(".upArrow, .downArrow")
						.on("click", {summary:$(this)}, function(event) {
							//event.data.summary.get(0).scrollTop += 50 * scrollingDirection;
							if ($(this).hasClass("upArrow")) {
								event.data.summary.get(0).scrollTop = 0;
							} else {
								event.data.summary.get(0).scrollTop = event.data.summary.prop("scrollHeight");
							}
							event.preventDefault();
							event.stopPropagation();	
						})
						.hover(function() {
							var scrollingSpeed;
							if ($summary.height() < 80) {
								scrollingSpeed = 20;
							} else {
								scrollingSpeed = 9;
							}
							
							scrollingDirection = $(this).hasClass("upArrow") ? -1 : 1;
							scrollingMailInterval = setInterval(function() {
								$summary.get(0).scrollTop += 1 * scrollingDirection;
							}, scrollingSpeed); // 9 = regular
						}, function() {
							clearInterval(scrollingMailInterval);
						});
					;
					$summary.scroll(function() {
						if (this.scrollTop == 0) {
							$(this).siblings(".upArrow").hide();
							$(this).siblings(".downArrow").show();
						} else if (this.scrollTop >= parseInt($(this).prop("scrollHeight")) - $(this).height()) {
							$(this).siblings(".upArrow").show();
							$(this).siblings(".downArrow").hide();
						} else {
							$(this).siblings(".upArrow").fadeIn();
							$(this).siblings(".downArrow").fadeIn();
						}
					});
				}
			});
		}, 50)
	}
	
	// patch: the scroll bars would disappear when users deleted emails and the content and buttons would shift causing users to mistakenly click other buttons - so i force the scrollbars to always show with "scroll"
	if ($("#inboxes").hasVerticalScrollbar()) {
		$("html").addClass("hasVerticalScrollbars");
	}
}

function plusoneCallback() {
	sendGA("plusOne", "click");
}

// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
	  console.log("here");
	ytplayer = document.getElementById("ytPlayer");
	ytplayer.addEventListener("onStateChange", function(state) {
		console.log("playerstate: " + state)
	});
	//ytplayer.addEventListener("onError", "onPlayerError");
	//Load an initial video into the player
	ytplayer.cueVideoById("ObkVpBWxm68");
}

function refresh() {
	// patch bug: on a mac after refreshing the accounts would disappear
	if (DetectClient.isLinux()) {
		location.reload();
	} else {
		if ($("#contacts").is(":visible")) {
			loadContacts({account:$("#contacts").data("data"), forceUpdate:true});
		} else {
			$("#refresh img").addClass("rotate");
			$("#statusMessage").show();

			var accountsWithErrors = 0;
			if (accounts) {
				$.each(accounts, function(index, account) {
					if (account.error) {
						accountsWithErrors++;
					}
				});			   
			}

			if (accounts && accounts.length >= 1 && !accountsWithErrors) {
				getAllEmails(accounts).then(function() {
					$("#statusMessage").hide();
					bg.mailUpdate();
					totalUnreadCount = bg.unreadCount;
					displayAccounts();
					$("#refresh img").removeClass("rotate");
				});
			} else {
				bg.pollAccounts().then(function() {
					bg.mailUpdate();
					location.reload(true);
				});
			}
		}
		sendGA("refresh", "click");
	}
}

initShowTransitions();

$(document).ready(function () {

	if (Settings.read("zoom") != "auto") {
		$("html").css("zoom", Settings.read("zoom"));
	}
	
	if (Settings.read("accountAddingMethod") == "autoDetect") {
		$("html").addClass("autoDetect");
	} else {
		$("html").addClass("oauth");
	}

	// dont call this if reverse view provoked by holding ctrl was pressed
	if (!reversingView) {
		initPopupView();
	}
	
	if (location.href.indexOf("externalPopupWindow") != -1) {
		$("html").addClass("externalPopupWindow");
	}
	
	if (Settings.read("hideByJason")) {
		$("html").addClass("hideByJason");
	}

	if (!Settings.read("showCheckerPlusButtonsOnlyOnHover")) {
		$("html").addClass("alwaysShowButtons");
	}

	var installDate = Settings.read("installDate");
	if (installDate) {
		try {
			installDate = new Date(installDate);
		} catch (e) {
			logError("could not parse installdate");
		}
	}
	
	var gmailInboxAtomFeedIssueFixed = new Date(2014, 5, 14, 23); // month is zero based index
	var maxDateToKeepNotice = gmailInboxAtomFeedIssueFixed.addDays(5);
	// localStorage value was used for yay fixed issue "_gmailFeedIssueDismissed"
	// localStorage value was used for error again :( "_gmailFeedIssueErrorDismissed"
	if (new Date().isBefore(maxDateToKeepNotice)) {
		if (!localStorage.getItem("_gmailFeedIssueDismissed") && installDate && installDate.isBefore(gmailInboxAtomFeedIssueFixed)) {
			$("#notice").show();
			$("#dismissNotice").click(function() {
				localStorage.setItem("_gmailFeedIssueDismissed", new Date());
				$("#notice").slideUp();
			});
		}
	} else {
		localStorage.removeItem("_gmailFeedIssueDismissed");
	}
	
	// show write about me ...
	if (clickedShareTest || (!localStorage.clickedShare && installDate && installDate.diffInDays() <= -3 && installDate.diffInDays() > -10)) { // between 3 and 10 days
		$("html").addClass("hideByJason");
		
		if (!lang || lang.indexOf("en") != -1) {
			$("#shareBlurb").addClass("short");
		} else {
			$("#shareBlurb").addClass("long");
		}
		
		$("#shareBlurbLink").click(function() {
			localStorage.clickedShare = true;

			$("#shareBlurb").fadeOut();
			$("#share").click();
			
			// For message: like it, write about it
			//chrome.tabs.create({url:"https://jasonsavard.com/wiki/Spread_the_word_about_my_extension"});
			//window.close();
			
		});	
	} else if (shouldShowReducedDonationMsg()) { // show reduced donation blurb
		$("#logo, #title").hide();
		$("html").addClass("hideByJason");
		$("#eligibleForReducedDonation").removeClass("hide");
		
		$("#eligibleForReducedDonation").click(function() {
			localStorage.reducedDonationAdClicked = true;
			createTab("donate.html?ref=reducedDonationFromPopup");
			//window.close();
		});
	}
	
	if (bg.notification) {
		bg.notification.close();
	}

	if (!Settings.read("showOptionsButton")) {
		$("#options").hide();
	}
	
	var markAsReadStr = getMessage("readLinkTitleShort");
	if (markAsReadStr) {
		$("#fullEmail .markAsRead div").text(markAsReadStr);
	}
	var markAsUnreadStr = getMessage("unreadLinkTitleShort");
	if (markAsUnreadStr) {
		$("#fullEmail .markAsUnread div").text(markAsUnreadStr);
	}
	
   bg.buttonIcon.stopAnimation();
   
   initButtons();
   showHideButtons();
   
   var delayBeforeDisplaying;

   if (DetectClient.isWindows()) {
	   delayBeforeDisplaying = 0;
   } else {
	   // patch for mac: popup window was distorted
	   delayBeforeDisplaying = localStorage["delayBeforeDisplaying"];
	   if (!delayBeforeDisplaying) {
		   delayBeforeDisplaying = 500;
	   }
   }
   
	$(window).resize(function() {
		console.log("resize");
		$("#contacts").width( $("#body").width() );
		if (location.href.indexOf("externalPopupWindow") != -1) {
			
			if (popupView == POPUP_VIEW_CHECKER_PLUS) {
				// user navigated away from the initially state of opening the popup window to preview an email, so let's remove the preview mail id
				if (backToInboxClicked) {
					var reloadUrl = setUrlParam(location.href, "previewMailId", "");
					location.href = reloadUrl;
				} else {
					location.reload(true);
				}
			} else {
				$("#tabletViewFrame").height( $(window).height() -  $("#tabletViewFrame").offset().top - 10 );
			}
			
		}
	});

	resizeFrameInExternalPopup();
	
   if (isDNDbyDuration()) {
	   //$("#doNotDisturb").addClass("selected");
   } else {
	   $("#DND_off").hide();
   }

   setTimeout(function() {

	   displayAccounts();
	   
	   $(window).unload(function() {
		   if (mouseHasEnteredPopupAtleastOnce) {
			   localStorage["lastCheckedEmail"] = now().toString();
		   }
	   });
	   
		$('body').hover(function () {
			mouseInPopup = true;
			if (!mouseHasEnteredPopupAtleastOnce) {
				console.log("stop any speaking")
				stopAllSounds();
			}
			mouseHasEnteredPopupAtleastOnce = true;
		}, function () {
			mouseInPopup = false;
		});
		
	   $("#refresh, .refreshAccount").click(function() {
		   refresh();
		   if (popupView == POPUP_VIEW_TABLET) {
			   tabletFramePort.postMessage({action: "reloadTabletView"});
		   }
		   return false;
	   });
	   
	   $(".accountOptions").click(function() {
		   chrome.tabs.create({ url: "options.html#2" });
		   window.close();
		   return false;
	   });
	   
	   $("#maximize").mousedown(function(e) {
		   if (isCtrlPressed(e)) {
			   bg.openInPopup();
			   window.close();
		   } else {
			   var currentAccount;
			   if (currentTabletFrameEmail) {
				   currentAccount = getAccountByEmail(currentTabletFrameEmail);
			   }
			   
			   if (currentAccount) {
				   if (localStorage.tabletViewUrl) {
					   var messageId = extractMessageIdFromOfflineUrl(localStorage.tabletViewUrl);
					   if (messageId) {
						   currentAccount.openMessageById({messageId:messageId});
					   } else { // NOT vieing a message, probably in the inbox or something
						   currentAccount.openInbox();
					   }
				   } else {
					   currentAccount.openInbox();
				   }
			   } else {
				   openGmail(accounts);
			   }
			   sendGA("maximize", "click");
			   window.close();
		   }
	   });

	   $("#close").click(function() {
		   sendGA("close", "click");
		   window.close();
	   });

	   $(".backToInbox").click(function() {
		   backToInboxClicked = true;
		   hideFullEmail();
		   sendGA("backToInbox", "click");
	   });

	   $("#contactsSearch").attr("placeholder", getMessage("search"));
	   
	   $("#contactsSearch").on("search", function() {
			$(this).keyup();		   
	   });	   

	   $("#contactsSearch").click(function() {
		 	//$("body").prepend('click' + $(this).val()) 
	   });	   

	   $("#contactsSearch").keyup(function() {
		   clearTimeout(searchTimeout);
		   var searchTerm = $(this).val().toLowerCase();
		   if (searchTerm.length >= 0) {
			   searchTimeout = setTimeout(function() {
				   setTimeout(function() {
					   searchContacts(searchTerm);
				   }, 50);
			   }, 100);
		   } else {
			   $("#contacts tr").show();
		   }
	   });
	   
	   $("#contactsHeader .open").click(function() {
		   openContactsPage($("#contacts").data("data")); 
	   });
	   
	   var contactsScrollTimeout;
	   
	   $("#contacts").scroll(function() {
		   clearTimeout(contactsScrollTimeout);
		   if ($("#contacts").is(":visible")) {
			   contactsScrollTimeout = setTimeout(function() {
				   loadContactPhotos();
			   }, 350);
		   }
	   });
	   
	   // remove it after a little whilte, just irritating
	   setTimeout(function() {
		   $(".emailDetails").removeAttr("title");
	   }, 2000)
	   
	   setInterval(function() {
		   $(".date").each(function(i, element) {
			   var date = $(this).data("data");
			   if (date && date.displayDate) {
			   		$(this).html( date.displayDate({relativeDays:true}) );
			   }
		   });
	   }, ONE_MINUTE);

	   if (Settings.read("rememeberReadEmails") && $("#inboxes .mail").length) {
		   //Settings.read("emailsMarkedAsRead") == "show" &&  && !showReadEmails
		   
		   // if no unread emails, then set the link to hide read mails
		   if (Settings.read("emailsMarkedAsRead") == "show" && totalVisibleMails == $("#inboxes .mail").length) {
			   $("#showAllEmails").text( getMessage("hideReadEmails") );
		   }
		   
		   var showLink = true;
		   if (Settings.read("emailsMarkedAsRead") == "hide" && $("#inboxes .mail.read").length == 0) {
			   showLink = false;
		   }
		   
		   if (showLink) {
			   $("html").addClass("hideByJason");
			   
			   $("#showAllEmails")
		  		.css("display", "inline-block")
		  		.animate({opacity: 1}, 100)
		  		.click(function() {
		  			if ($(this).text() == getMessage("showAllEmails")) {
		  				$(this).text( getMessage("hideReadEmails") );
		  				$(".labelGroup").show();
		  				$(".mail.read").animate({opacity: 'show', height: 'show'}, 400);
		  			} else {
		  				$(this).text( getMessage("showAllEmails") );
		  				$(".mail.read").animate({opacity: 'hide', height: 'hide'}, 400, function() {
		  					// hide labels if no visible emails
		  					$(".labelGroup").each(function() {
		  						if ($(this).find(".mail").filter(":visible").length == 0) {
		  							$(this).slideUp("fast");
		  						}
		  					});
		  				});
		  			}					   			
		  		})
			   ;
		   } else {
			   $("html").removeClass("hideByJason");
		   }
	   }
	   
   }, delayBeforeDisplaying);
   
	$("body").keydown(function(e) {
		
		// if focus is in these elements then don't process these globals keys 
		if ($(e.target).hasClass("searchInput") || $(e.target).hasClass("composeInput") || $(e.target).hasClass("labelsSearch") || $(e.target).attr("id") == "contactsSearch" || $(e.target).attr("id") == "draftSavedTextarea") {
			console.log("Do not process this global key!")
			return;
		}
		
		// find selected mail first
		var $allMail = $(".mail:visible");
		console.log($allMail);
		
		var selectedIndex = $allMail.index($allMail.filter(".selected"));
		
		var hasSelectedMail;
		// none selected, so choose first item
		if (selectedIndex == -1) {
			hasSelectedMail = false;
			selectedIndex = 0;
		} else {
			hasSelectedMail = true;
		}
		
		$selectedMail = $allMail.eq(selectedIndex);
		
		console.log("key:", e)
		
		if (keydown(lastKeyPressedEvent, 'g')) {
			// g then c = Load contacts
			if (keydown(e, 'c')) {
				 $(".account:first .contactsLink").click();
		    }
		} else {
		if (keydown(e, 'j') || keydown(e, 40)) { // down arrow
			console.log("here: " + selectedIndex)
			if (hasSelectedMail) {
				console.log("next visible: " + selectedIndex)
				if (selectedIndex+1 < $allMail.length) {
					$nextMail = $allMail.eq(selectedIndex+1);
					$nextMail.addClass("selected");
					$selectedMail.removeClass("selected");
				} else {
					$allMail.first().addClass("selected");
					$selectedMail.removeClass("selected");
				}
			} else {
				// make sure we have mail or this will triggering the action will recursieve/loop forever
				if ($allMail.length) {
					$selectedMail.addClass("selected");
					
					// re-execute the keydown to select the 2nd one (since we select the 1st one the 1st time)
					$("body").trigger(e);
				}
			}
		} else if (keydown(e, 'k') || keydown(e, 38)) { // up arrow
			if (hasSelectedMail) {
				if (selectedIndex-1 >= 0) {
					console.log("found previous");
					$prevMail = $allMail.eq(selectedIndex-1);
					$prevMail.addClass("selected");
					$selectedMail.removeClass("selected");
				} else {
					$allMail.last().addClass("selected");
					$selectedMail.removeClass("selected");
				}
			} else {
				$(".mail:visible:last").addClass("selected");
			}
		}

		// c = compose
		if (keydown(e, 'c')) {
			$(".account:first .compose").click();
		}

		// o,enter = open
		if (keydown(e, 'o') || e.which == 13) {
			if ($selectedMail.length) { // found unread email so open the email
				if (e.which == 13) {
					
					// enter toggles between preview mode
					if ($("#fullEmail").is(":visible")) {
						$(".backToInbox").click();
					} else {
						$selectedMail.find(".emailDetails").click();						
					}
					
				} else {
					$selectedMail.find(".open").click();
				}
			} else { // no unread email so open the inbox instead
				$(".account:first .inboxActions .open").click();
			}
		}

		// # = delete
		if (keydown(e, 51, {shift:true})) {
			if ($("#fullEmail").is(":visible")) {
				$("#fullEmailActionButtons .delete").click();
			} else {
				$selectedMail.find(".delete").click();
			}
		}

		// e = archive
		if (keydown(e, 'e')) {
			if ($("#fullEmail").is(":visible")) {
				$("#fullEmailActionButtons .archive").click();
			} else {
				$selectedMail.find(".archive").click();
			}
		}

		// ! = spam
		if (keydown(e, 49, {shift:true})) {
			if ($("#fullEmail").is(":visible")) {
				$("#fullEmailActionButtons .spam").click();
			} else {
				$selectedMail.find(".spam").click();
			}
		}

		// s = star
		if (keydown(e, 's')) {
			if ($("#fullEmail").is(":visible")) {
				$("#fullEmail").find(".star").click();
			} else {
				$selectedMail.find(".star").click();
			}
		}

		// r = reply (if setting set for this)
		if (Settings.read("keyboardException_R") == "reply" && keydown(e, 'r')) {
			if ($selectedMail.length) {
				if ($("#fullEmail").is(":visible")) {
					setFocusToComposeInput(true);
				} else {
					showFullEmail({$mail:$selectedMail}, function() {
						setFocusToComposeInput(true);
					});
				}
				return false;
			}
		}

		// a = reply to All
		if (keydown(e, 'a')) {
			if ($selectedMail.length) {
				if ($("#fullEmail").is(":visible")) {
					$(".replyToAllLink").click();
				} else {
					showFullEmail({$mail:$selectedMail}, function() {
						$(".replyToAllLink").click();
					});
				}
				return false;
			}
		}

		/*
		// ar = mark All as Read
		if (keydown(lastKeyPressedEvent, 'a') && keydown(e, 'r')) {
			 $(".account .markAllAsRead").click();
	    }
	    */

			// '/' = Focus on search
			if (keydown(e, 191)) {
				 $(".account .searchLink").click();
				 return false;
		    }

		// Shift + i OR r = mark as Read
		if (keydown(e, 'i', {shift:true}) || (Settings.read("keyboardException_R") == "markAsRead" && keydown(e, 'r'))) {
			if ($("#fullEmail").is(":visible")) {
				$("#fullEmailActionButtons .markAsRead").click();
			} else {
				$selectedMail.find(".markAsRead").click();
			}
		}

		// x = easter egg
		if (keydown(e, 'x')) {
			$("#scrollAreaWrapper").fadeOut();
			$easterEggVideo = $("<iframe id='easterEggVideo' width='100%' height='420' frameborder=0 src='http://apps.jasonsavard.com/easterEgg.php?width=600&height=400&email=" + escape(bg.email) + "'></iframe>");
			$("body").append($easterEggVideo);
		}
		
		// z = easter egg
		if (keydown(e, 'z')) {
			var $jason = $("<img src='http://apps.jasonsavard.com/images/jason.png'/>");
			$jason.css({position:"absolute", "z-index":1000, width:"100%", height:"1px"});
			$("body").append($jason);
			var phrases = new Array(
					"I can't give you a brain, but I can give you a diploma!",
					"Happiness never comes if you fail to appreciate that you already have it",
					"Keep smiling",
					"I love Jason",
					"Have a wonderful day",
					"Google rocks",
					"Please recycle",
					"You look great today");
			var phraseIndex = Math.floor(Math.random() * phrases.length);
			var phrase = phrases[phraseIndex];
			$jason.animate({
				"height": "+500"
			}, 500, function() {
				// complete animation
				//rotate($jason);
			});			
			bg.ChromeTTS.queue(phrase, {}, function() {
				$jason.slideUp(500);
			});
			}
		}

		lastKeyPressedEvent = e; 
	});
	
	$("#switchView").mouseup(function(e) {
		console.log("switch vieww: ", e);
		
		// right click
		if (e.button == 2) {
			chrome.tabs.create({url:"https://jasonsavard.com/wiki/Popup_window?ref=GmailPopup"});
			e.preventDefault();
			return false;
		} else {
			reversePopupView(true);
			sendGA('switchView', popupView);
		}
	});
	
	if (pref("donationClicked")) {
		$("#extraFeatures").hide();
	}

	$("#options").click(function() {
		if ($("#optionsMenu").is(":visible")) {
			$("#optionsMenu").removeClass("visible");
			$("#optionsMenu").slideUp("fast");
		} else {
			$("#optionsMenu").removeClass("visible");
			$("#optionsMenu").slideDown("fast", function() {
				$(this).addClass("visible");
			});
		}
	});
	
	$("#doNotDisturb").click(function() {
		$("#optionsMenu").toggleClass("DNDMenuActive");
	});
	
	if (Settings.read("DND_schedule")) {
		$("#DND_schedule").addClass("selected");
	}
	
	$("#DND_off").click(function() {
		setDND_off();
		$("#optionsMenu").hide();
		window.close();
	});
	
	$(".DND_minutes").click(function() {
		var minutes = $(this).attr("minutes");
		setDND_minutes(minutes);
		$("#optionsMenu").hide();
		window.close();
	});
	
	$("#DND_today").click(function() {
		setDND_today();
		$("#optionsMenu").hide();
		window.close();
	});
	
	$("#DND_schedule").click(function() {
		openDNDScheduleOptions();
	});

	$("#DND_indefinitely").click(function() {
		setDND_indefinitely();
		$("#optionsMenu").hide();
		window.close();
	});
	
	$("#optionsPage").click(function() {
		chrome.tabs.create({url:"options.html?ref=popup"});
	});
	$("#extraFeatures").click(function() {
		chrome.tabs.create({url:"donate.html?ref=popup"});
	});
	$("#changelog").click(function() {
		chrome.tabs.create({url:"https://jasonsavard.com/wiki/Checker_Plus_for_Gmail_changelog?ref=GmailCheckerOptionsMenu"});
	});
	$("#discoverMyApps").click(function() {
		chrome.tabs.create({url:"https://jasonsavard.com?ref=GmailCheckerOptionsMenu"});
	});
	$("#feedback").click(function() {
		chrome.tabs.create({url:"https://jasonsavard.com/forum/categories/checker-plus-for-gmail-feedback?ref=GmailCheckerOptionsMenu"});
	});
	$("#followMe").click(function() {
		chrome.tabs.create({url:"https://jasonsavard.com/?followMe=true&ref=GmailCheckerOptionsMenu"});
	});
	$("#aboutMe").click(function() {
		chrome.tabs.create({url:"https://jasonsavard.com/bio?ref=GmailCheckerOptionsMenu"});
	});
	$("#help").click(function() {
		chrome.tabs.create({url:"https://jasonsavard.com/wiki/Checker_Plus_for_Gmail?ref=GmailCheckerOptionsMenu"});
	});

	if (Settings.read("removeShareLinks")) {
		$("#share").hide();
	}

	$("#share").click(function() {
		if ($("#shareMenu").is(":visible")) {
			$("#shareMenu").removeClass("visible");
			$("#shareMenu").slideUp("fast");
		} else {
			$("#shareMenu").removeClass("visible");
			$("#shareMenu").slideDown("fast", function() {
				$(this).addClass("visible");
			});
		}
		
	});
	
	$("#shareMenu li").click(function() {
		var value = $(this).attr("val");
		
		if (value == "SEP") {
			$("#shareMenu").removeClass("visible");
			$("#shareMenu").slideUp("fast");
		} else {
			sendGA('shareMenu', value);
			
			var urlToShare = "https://jasonsavard.com/Checker-Plus-for-Gmail";
			var imageToShare = "https://jasonsavard.com/images/extensions/mediumCheckerPlusForGmail.png";
			
			if (value == "googlePlus") {
				openWindowInCenter("https://plus.google.com/share?url=" + encodeURIComponent(urlToShare), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', 600, 760);
			} else if (value == "facebook") {
				//openWindowInCenter("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(urlToShare), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', 600, 500);
				openWindowInCenter("https://www.facebook.com/dialog/share?app_id=166335723380890&display=popup&href=" + encodeURIComponent(urlToShare) + "&redirect_uri=" + encodeURIComponent("https://jasonsavard.com/tools/closePopup.htm"), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', 600, 500);
			} else if (value == "twitter") {
				openWindowInCenter("https://twitter.com/share?url=" + encodeURIComponent(urlToShare) + "&text=" + encodeURIComponent(getMessage("shareIntro") + ": " + getMessage("nameNoTM") + " @jasonsavard"), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', 600, 285);
			} else if (value == "pinterest") {
				openWindowInCenter("http://www.pinterest.com/pin/create/button/?url=" + encodeURIComponent(urlToShare) + "&media=" + encodeURIComponent(imageToShare) + "&description=" + encodeURIComponent(getMessage("description")), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', 750, 350);
			} else if (value == "tumblr") {
				openWindowInCenter("http://www.tumblr.com/share/link?url=" + encodeURIComponent(urlToShare) + "&name=" + encodeURIComponent(getMessage("nameNoTM")) + "&description=" + encodeURIComponent(getMessage("description")), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', 600, 600);
			} else if (value == "linkedin") {
				openWindowInCenter("http://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(urlToShare) + "&title=" + encodeURIComponent(getMessage("nameNoTM")) + "&summary=" + encodeURIComponent(getMessage("description")), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', 600, 540);
			} else if (value == "reddit") {
				openWindowInCenter("http://www.reddit.com/submit?url=" + encodeURIComponent(urlToShare) + "&title=" + encodeURIComponent(getMessage("nameNoTM")) + "&summary=" + encodeURIComponent(getMessage("description")), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', 900, 750);
			}
		}
	});

	$(document).click(function(e) {
		if ($(e.target).attr("id") != "options" && $(e.target).closest("#options").length == 0 && $(e.target).attr("id") != "share" && $(e.target).closest("#shareBlurbLink").length == 0 && $(e.target).closest("#share").length == 0 && $(e.target).closest(".menu").length == 0) {
			if ($(".menu").is(":visible")) {
				$(".menu").removeClass("visible");
				$(".menu").slideUp("fast");
			}
		}
	});
	
	$("#title").click(function() {
		if (Settings.read("clickingCheckerPlusLogo") == "openHelp") {
			chrome.tabs.create({url:"https://jasonsavard.com/wiki/Checker_Plus_for_Gmail?ref=GmailChecker"});
		} else {
			openGmail(accounts);
		}
		window.close();
	});
	
	if (localStorage.autoSave) {
		var autoSave = localStorage.autoSave;
		try {
			autoSave = JSON.parse(autoSave);
		} catch (e) {
			logError("could not parse autoSave: " + e);
		}
		if (autoSave && autoSave.message) {
			$("#draftSavedTextarea").val(autoSave.message);
			$("#draftSaved").show();
			
			$("#saveDraftDismiss").click(function() {
				localStorage.removeItem("autoSave");
				$("#draftSaved").slideUp();				
			});
			
			$("#saveDraftCopyAndDismiss").click(function() {
				$("#draftSavedTextarea")
					.focus()
					.select()
				;
				document.execCommand('Copy');
				localStorage.removeItem("autoSave");
				$("#draftSaved").slideUp();
			});
		}
	}
	
});