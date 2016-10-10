var loadingGmail;
var totalUnreadCount;
var accounts;
var mouseInWidget;
var barHeight;
var barAnimateTimeout;
var barPosition = "show";

function initBarPosition() {
	$("#bar").css("top", $(window).height() - 42 + "px");
}

function loadAccountInTab(account) {
	chrome.runtime.sendMessage({command:"findOrOpenGmailTab", account:account}, function(response) {
		if (response.noMatchingTab) {
			loadingGmail = true;
			$("#logo, #count").hide();
			$("#loading").show();
			$("#bar").stop(true, true);
			initBarPosition();
			top.location.href = response.url;
		} else {
			// don't have to do anything cause the sendMessage probably already activated the existing tab
		}
	});
}

function renderAccounts() {	
	loadingGmail = false;
	
	chrome.runtime.sendMessage({command:"getEmails"}, function(response) {
		
		accounts = JSON.parse(response);
		
		totalUnreadCount = 0;
		$.each(accounts, function(index, account) {
			
			if (true) { //account.unreadCount
			
				totalUnreadCount += account.unreadCount;
				
				var $account = $("#accountTemplate").clone();
				
				$account
					.removeAttr("id")
					.data("data", account)
				;

				var accountEmailStr = account.email;
				if (account.unreadCount) {
					accountEmailStr += " (" + account.unreadCount + ")";
					$account.find(".accountEmail").addClass("unread");
				}
				
				$account.find(".accountEmail")
					.html(accountEmailStr)
					.click(function() {
						loadAccountInTab(account);
					})
				;
				
				$.each(account.emails, function(emailIndex, email) {
					var $email = $("#emailTemplate").clone();
					$email
						.removeAttr("id")
						.data("data", email)
						//.attr("title", email.title + ":\n" + email.summary)
						.click(function() {
							$(this).slideUp();
							totalUnreadCount--;
							$("#count").text(totalUnreadCount);
							chrome.runtime.sendMessage({command:"findOrOpenGmailTab", account:account, email:email}, function(response) {
								if (response.noMatchingTab) {
									loadingGmail = true;
									$("#logo, #count").hide();
									$("#loading").show();
									$("#bar").stop(true, true).animate({top:'-='+barHeight});
									top.location.href = response.url;
								} else {
									// don't have to do anything cause the sendMessage probably already activated the existing tab
								}
							});
						})
					;
					$email.find(".author").html(email.authorName);
					$email.find(".date").html(email.dateFormatted);
					$email.find(".subject")
						.html(email.title)
					;
					$email.find(".summary").html(email.summary);
					
					$account.find(".emails").append( $email );
					$email.show();
			
				});
				
				$account.show().appendTo(".widget");
				
			}
		});
		
		if (accounts.length == 1 && totalUnreadCount == 0) {
			$("html").addClass("oneAccountNoUnread");
		} else {
			$("html").removeClass("oneAccountNoUnread");
		}
		
		if (totalUnreadCount) {
			$("html").removeClass("noUnread");
		} else {
			$("html").addClass("noUnread");
		}
		
		if (accounts.length) {
			$("#loggedOut").hide();
			if (totalUnreadCount == 1) {
				$(".summary").css("max-height",  "none");
			} else if (totalUnreadCount == 2) {
				$(".summary").css("max-height",  "40px");
			} else {
				$(".summary").css("max-height",  "20px");
			}
			
			$("#count").text(totalUnreadCount);
		} else {
			$("#loggedOut").show();
			$("#count").text("");
		}
		
		initBarPosition();
	});
}

function shouldToggleBar() {
	if (!loadingGmail && ($(window).height() - $(".widget").height() < barHeight) && (totalUnreadCount || accounts.length > 5)) {
		return true;
	} else {
		return false;
	}
}

$(document).ready(function() {
	
	barHeight = $("#bar").height() - 5;
	
	$("#bar").click(function() {
		/*
		if (accounts.length) {
			loadAccountInTab(accounts[0]);
		} else {
			top.location.href = "https://mail.google.com";
		}
		return false;
		*/
	});
	
	renderAccounts();
	
	// attach events only once and NOT in render accounts cause it gets called often
	$("body").mouseenter(function() {
		mouseInWidget = true;
		if (shouldToggleBar()) {
			barAnimateTimeout = setTimeout(function() {
				//$("#bar").stop(true, true).fadeOut();
				barPosition = "hide";
				$("#bar").stop(true, true).animate({top:'+='+barHeight});
			}, 230);
		}
	});
	$("body").mouseleave(function() {
		mouseInWidget = false;
		if (shouldToggleBar()) {
			clearTimeout(barAnimateTimeout);
			//$("#bar").stop(true, true).fadeIn();
			if (barPosition == "hide") {
				barPosition = "show";
				$("#bar").stop(true, true).animate({top:'-='+barHeight});
			}
		}
	});
	
	$("body").click(function(e) {
		if ($("html").hasClass("oneAccountNoUnread")) {
			
			loadAccountInTab(accounts[0]);
			
			e.stopPropagation();
			return false;
		} else {
			return true;
		}
	});
	
	$("#options").click(function() {
		top.location.href = "options.html#6";
		return false;
	});
	
	$(window).resize(function () {
		initBarPosition();
	});


	setInterval(function() {
		// in mouse not in and widget accounts has changed then reload
		if (!mouseInWidget) {
			$(".account:visible").remove();
			renderAccounts();
		}
	}, 10000);
	
});

