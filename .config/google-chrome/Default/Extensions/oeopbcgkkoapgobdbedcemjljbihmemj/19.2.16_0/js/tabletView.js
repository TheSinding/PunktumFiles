// Copyright 2015 Jason Savard

function onLoad() {
	if (location.href.indexOf("mui=checkerPlusForGmail") != -1) {

		var MOBILE_URL_PREFIX = "#tl/";
		var MOBILE_URL_PRIORITY = "priority/";

		var MOBILE_URL_INBOX = MOBILE_URL_PREFIX + encodeURIComponent("^i");
		var MOBILE_URL_IMPORTANT = MOBILE_URL_PREFIX + encodeURIComponent("^io_im");
		var MOBILE_URL_ALL_MAIL = MOBILE_URL_PREFIX + encodeURIComponent("^all");
		var MOBILE_URL_PRIMARY = MOBILE_URL_PREFIX + MOBILE_URL_PRIORITY + encodeURIComponent("^smartlabel_personal");
		var MOBILE_URL_PURCHASES = MOBILE_URL_PREFIX + MOBILE_URL_PRIORITY + encodeURIComponent("^smartlabel_receipt");
		var MOBILE_URL_FINANCE = MOBILE_URL_PREFIX + MOBILE_URL_PRIORITY + encodeURIComponent("^smartlabel_finance");
		var MOBILE_URL_SOCIAL = MOBILE_URL_PREFIX + MOBILE_URL_PRIORITY + encodeURIComponent("^smartlabel_social");
		var MOBILE_URL_PROMOTIONS = MOBILE_URL_PREFIX + MOBILE_URL_PRIORITY + encodeURIComponent("^smartlabel_promo");
		var MOBILE_URL_UPDATES = MOBILE_URL_PREFIX + MOBILE_URL_PRIORITY + encodeURIComponent("^smartlabel_notification");
		var MOBILE_URL_FORUMS = MOBILE_URL_PREFIX + MOBILE_URL_PRIORITY + encodeURIComponent("^smartlabel_group");

		var popupWindowPort;
		
		function addStyle(css){
			var s = document.createElement('style');
			s.setAttribute('id', 'checkerPlusForGmail');
			s.setAttribute('type', 'text/css');
			s.appendChild(document.createTextNode(css));
			return (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
		}
		
		function getCookie(c_name) {
			if (document.cookie.length>0) {
			  c_start=document.cookie.indexOf(c_name + "=");
			  if (c_start!=-1) {
			    c_start=c_start + c_name.length+1;
			    c_end=document.cookie.indexOf(";",c_start);
			    if (c_end==-1) c_end=document.cookie.length;
			    return unescape(document.cookie.substring(c_start,c_end));
			    }
			  }
			return "";
		}
		
		function syncCurrentEmail() {
			popupWindowPort.postMessage({action: "getCurrentEmail", email:getCookie("GAUSR")});
		}
		
		console.log("onload: " + location.href);
		
		// position search button
		setTimeout(function() {
			var menuButton = document.querySelector("[aria-label=\"Menu\"], [onclick=\"_e(event, 'qa')\"]");
			if (menuButton && menuButton.nextSibling) {
				var searchButton = document.createElement("div");
				searchButton.id = "gmailPopupSearch";
				searchButton.style.display = "inline-block";
				searchButton.style.marginLeft = "8px";
				searchButton.innerHTML = "<img src='" + chrome.extension.getURL("images/buttons/default/search.png") + "'/>";
				searchButton.addEventListener('click', function() {
					// must use /Inbox because the back to inbox buttons were not working anymore
					location.href = "#";

					// need to give time for inbox to load before opening search
					setTimeout(function() {
						var searchForm = document.querySelector("form[role='search']");
						if (searchForm) {
							searchForm.style.display = "table";
						}
						
						var searchInput = document.querySelector("#tl_ form input");
						if (searchInput) {
							searchInput.focus();
						}
					}, 300);
				});
						
				menuButton.parentNode.insertBefore(searchButton, menuButton.nextSibling);
			}
		}, 100);
		
		popupWindowPort = chrome.runtime.connect({name: "popupWindowAndTabletFrameChannel"});
		popupWindowPort.onMessage.addListener(function(message) {
			if (message.action == "reloadTabletView") {
				var refreshButton = document.querySelector("[aria-label=\"Refresh\"], [onclick=\"_e(event, 'j')\"]");
				if (refreshButton) {
					refreshButton.first().click();
				} else {
					location.reload();
				}
			} else if (message.action == "goToLabel") {
				if (message.label == "tabInbox") {
					location.href = MOBILE_URL_INBOX;
				} else if (message.label == "tabImportant") {
					location.href = MOBILE_URL_IMPORTANT;
				} else if (message.label == "tabAllMail") {
					location.href = MOBILE_URL_ALL_MAIL;
				} else if (message.label == "tabPrimary") {
					location.href = MOBILE_URL_PRIMARY;
				} else if (message.label == "tabPurchases") {
					location.href = MOBILE_URL_PURCHASES;
				} else if (message.label == "tabFinance") {
					location.href = MOBILE_URL_FINANCE;
				} else if (message.label == "tabSocial") {
					location.href = MOBILE_URL_SOCIAL;
				} else if (message.label == "tabPromotions") {
					location.href = MOBILE_URL_PROMOTIONS;
				} else if (message.label == "tabUpdates") {
					location.href = MOBILE_URL_UPDATES;
				} else if (message.label == "tabForums") {
					location.href = MOBILE_URL_FORUMS;
				} else if (message.label.indexOf("label_") == 0) {
					var label = message.label.substring(6);
					label = label.toLowerCase();
					label = label.replace(/ /g, '-');
					label = encodeURIComponent(label);
					// replace almost all non-ascii characters with dashes
					//label = label.replace(/[^A-Za-z0-9']/g, '-');
					location.href = "#tl/" + label;
				}
			} else if (message.action == "invert") {
				addStyle(" body img {-webkit-filter:invert(100%)} ");
			}
		});
		
		var s = document.createElement('link');
		s.setAttribute("href", chrome.extension.getURL("css/tabletView.css"));
		s.setAttribute("rel", "stylesheet");
		s.setAttribute("type", "text/css");
		document.head.appendChild(s);
		
		// do this once here on load because sometimes the onpopstate is not called because there are no redirects
		// but then also call it on the onpopstate to check for any updates signout/sign etc
		syncCurrentEmail();

		window.onpopstate = function(event) {
			console.log("onpopstate: " + document.location + ", state: " + JSON.stringify(event.state));
			popupWindowPort.postMessage({action: "tabletViewUrlChanged", url:location.href});
			syncCurrentEmail();
		};

		window.addEventListener("hashchange", function() {
			console.log("hashchange: " + location.href);
			//popupWindowPort.postMessage({action: "tabletViewUrlChanged", url:location.href});
		    //chrome.extension.sendMessage({action:"tabletViewUrlChanged", url: location.href}, function(response) {});
		});

		var tooLateForShortcut = false;
		setInterval(function() {tooLateForShortcut=true}, 200);
		window.addEventListener('keydown', function(e) {
			console.log("in tablet view keydown: ", e)
			
			if (!tooLateForShortcut && isCtrlPressed(e)) {
				tooLateForShortcut = true;
				console.log("ctrl held");
				popupWindowPort.postMessage({action: "reversePopupView"});
				return;
			}
		
			if (e.keyCode == 27) {
				parent.close();
			}
		});
	}
}

window.addEventListener("load", onLoad);