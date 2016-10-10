// Copyright 2016 Jason Savard

function MailAccount(accountParams) {
	
	this.id = accountParams.accountNumber;
	this.status;
	this.unreadCount = -1;
	this.lastSuccessfulMailUpdate = new Date(1);
	
	var historyId;
	var requestTimeout = 10000;
	var mailArray = [];
	var newestMailArray = [];
	var emailsInAllLabels = [];
	var mailTitle;
	var mailAddress = accountParams.mailAddress;
	var syncSignInIdTimer;
	var lastGmailATFetch = new Date(1);
	var gmailAT;
	var getGmailAtPromise;
	var gmailATProcessing = false;
	var testGmailQuestion = false;

	var labels = null;

	// Without this/that, no internal calls to onUpdate or onError can be made...
	var that = this;
	
   	function filterEmailBody(subject, body) {
	   if (body) {
		   
		   // remove line breaks because regex cannot match content before lines especially with start of line operator ^
		   body = body.replace(/\r\n/g, " ");
		   body = body.replace(/^facebook([a-z])/i, "$1"); // $1 is a regex variable indicating matching everything, remove facebook string because when doing htmlToText ... we get a string like: facebookWilliam da Silva commented on your status.William wrote:
		   
		   var regexs = new Array();
		   
		   regexs.push(/ on [a-z]{3}, [a-z]{3} \d+/i);	// On Wed, Dec 28, 2011 at 12:36 AM, Jason <jaso
		   regexs.push(/ on [a-z]{3} \d+\/\d+\/\d+/i);	// On Wed 15/02/12  8:23 AM , Wade Konowalchuk
		   regexs.push(/ on \d+[\/|-]\d+[\/|-]\d+/i);	// on 2011/12/28 Jason <apps@...
		   regexs.push(/ on \w*, \w* \d+(st)?, \d+,/i);	// On Thursday, October 31, 2013, Jason wrote:   OR   On Wednesday, October 15, 2014, Jason <jasonsavard@gmail.com> wrote:
		   regexs.push(/ >? on \w* \d+, \d+, at/i);	// In!  > On Oct 5, 2014, at 9:32 AM ...
		   regexs.push(/ (on)? ([a-z]{3} )?[a-z]{3} \d+,? \d+ /i); 		// On(optional) Fri(optional) May 04 2012 15:54:46
		   regexs.push(/ (on)? ([a-z]{3} )?\d+,? [a-z]{3}/i); 		// On(optional) Fri(optional) 28 April 2015 at??? 13:17
		   //regexs.push(/ \d+[\/|-]\d+[\/|-]\d+/i);		// 2011/12/28 Jason <apps@...
		   regexs.push(/ [\-]+ original message/i); // -------- Message original -------- 
		   regexs.push(/ [\-]+ message original/i); // -------- original Message -------- 
		   regexs.push(/ ?sent from: /i);
		   regexs.push(/ ?Envoyé de mon i/);
		   regexs.push(/ ?cc: /i);
		   regexs.push(/ date: /i); // removed the '?' because the word up'date' would stop the filter
		   regexs.push(/ ?from: /i); //great From: Jason
		   regexs.push(/ ?Reply to this email to comment on this status./i); // facebook ending
		   regexs.push(/ subject: re: /i); // facebook ending
		   // DONT use because passing subject string with unintential regex syntax screwed it up like ] and [ etc.
		   //regexs.push( new RegExp(" subject: re: " + subject, "i") );	// I can play afterall, any room left ? Subject: Re: Saturday's game Nov 2nd at 2pm From: wade@
		   
		   if (Settings.read("hideSentFrom")) {
			   //regexs.push(/^(.*) ?sent from \w* ?\w* ?$/i); // "Sent from Blackberry" or "Sent from my iPhone"
			   regexs.push(/ ?Sent (wirelessly )?from my /i); // "Sent from my Blackberry" or "Sent from my iPhone"
			   regexs.push(/ ?Sent on the ?\w* \w* network/i); // "Sent on the TELUS Mobility network with BlackBerry"
			   regexs.push(/ ?Sent from \w* mobile/i); // "Sent from Samsung Mobile"
			   regexs.push(/ ?Sent from Windows Mail/i); // "Sent from Samsung Mobile"
		   }
		   
		   for (var a=0; a<regexs.length; a++) {			   
			   /*
			   // max this internal loop to 10: just in case it goes on forever
			   // by the way we re-passing the same regex several times until all occurences of ie from" are gone... "Hello1 from: Hello2 from:"
			   for (var b=0; b<10; b++) {
				   var matches = body.match(regexs[a]);
				   if (matches && matches.length >= 2) {
					   body = matches[1];
				   } else {
					   break;
				   }
			   }
			   */
			   
			   // regex.search = faster ...
			   var searchIndex = body.search(regexs[a]);
			   if (searchIndex != -1) {
				   body = body.substring(0, searchIndex);
			   }
		   }
		   
		   body = $.trim(body);
		   
		   // remove repeated subject line from beginning of the body (ie. emails from facebook tend to do that etc. like William da Silva commented on your status.
		   if (body.indexOf(subject) == 0 && subject && subject.length >= 20) {
			   body = body.substring(subject.length);
		   }
		   
	   } else {
		   body = "";
	   }
	   return body;
   	}

   	function getFeedUnreadCount(params, parsedFeed) {
   		return new Promise(function(resolve, reject) {
   			
   		   var feedUnreadCount = Number(parsedFeed.find('fullcount').text());

 		   // TESTING
 		   //alert('remove test')
 		   //feedUnreadCount = 0;
 		   if (feedUnreadCount) {
 			   resolve(feedUnreadCount);
 		   } else {							   
 			   // patch: because fullcount is 'sometimes' 0 for some user accounts for labels: important or allmail (https://github.com/aceat64/MailCheckerMinus/issues/15 or banko.adam@gmail.com)
 			   feedUnreadCount = Number(parsedFeed.find('entry').length);
 			   
 			   // TESTING
 			   // 20 is the limit to the feed so there might be more unread emails, let's use the basic view to fetch the real total (we can only do this for allmail/unread label because even the basic view only says 1-20 of "about"??? blahblah
 			   if (feedUnreadCount >= MAX_EMAILS_IN_ATOM_FEED && params.monitorLabels[params.monitorLabelsIndex] == SYSTEM_ALL_MAIL) {
 				   console.log("use the basic view to fetch the real total...")
 				   $.ajax({
 					   type: "GET",
 					   timeout: requestTimeout,
 					   url: that.getMailUrl({useBasicGmailUrl:true}) + "?s=q&q=label%3Aunread", // append 'unread' to only fetch unreads of this label of course
 					   complete: function(jqXHR, textStatus) {
 						   if (textStatus == "success") {
 							   try {
 								   // patch: must place wrapper div element because jQuery would generate error when trying to parse the response into the $() contructor ... Uncaught Error: Syntax error, unrecognized expression: <html...
 								   var $responseText = $("<div>" + jqXHR.responseText + "</div>");
 								   var realTotal = $responseText.find("table tr:first-child td b:nth-child(3)").first().text();
 								   if (realTotal && $.isNumeric(realTotal) && realTotal != "0") {
 									   feedUnreadCount = Number(realTotal);
 								   } else {
 									   realTotal = $responseText.find("table tr:first-child td b:nth-child(2)").first().text();
 									   if (realTotal && $.isNumeric(realTotal) && realTotal != "0") {
 										  feedUnreadCount = Number(realTotal);
 									   }
 								   }
 							   } catch (e) {
 								   logError("Could not parse basic view html to get real unread count: " + e);
 							   }
 						   }
 						   resolve(feedUnreadCount);
 					   }
 				   });
 			   } else {
 				   resolve(feedUnreadCount);
 			   }
 		   	}
   		});
   	}
   	
   function addParsedFeed(params, parsedFeed, feedUnreadCount) {
	   // add the parsed feeds and continue for more						   
	   var feedInfo = {label:params.monitorLabels[params.monitorLabelsIndex], parsedFeed:parsedFeed, feedUnreadCount:feedUnreadCount};
	   
	   params.feedsArrayInfo.push(feedInfo);
	   params.monitorLabelsIndex++;
   }
   
   function initErrors(account, jqXHR, error, errorCode) {
	   account.error = error;
	   if (errorCode) {
		   account.errorCode = errorCode;
	   }
	   
	   var error = new Error(error);
	   error.errorCode = errorCode;
	   error.jqXHR = jqXHR;
	   return error;
   }
   
   function fetchFeed(params) {
	   return new Promise(function(resolve, reject) {
		   var atomParam;
		   var label
		   if (params.label) {
			   label = params.label;
		   } else {
			   label = params.monitorLabels[params.monitorLabelsIndex];
		   }
		   
		   if (label) {
			   if (label == SYSTEM_INBOX) {
				   atomParam = AtomFeed.INBOX;
			   } else if (label == SYSTEM_IMPORTANT) {
				   atomParam = AtomFeed.IMPORTANT;
			   } else if (label == SYSTEM_IMPORTANT_IN_INBOX) {
				   atomParam = AtomFeed.IMPORTANT_IN_INBOX;
			   } else if (label == SYSTEM_ALL_MAIL) {
				   atomParam = AtomFeed.UNREAD;
			   } else if (label == SYSTEM_PRIMARY) {
				   atomParam = AtomFeed.PRIMARY;
			   } else if (label == SYSTEM_PURCHASES) {
				   atomParam = AtomFeed.PURCHASES;
			   } else if (label == SYSTEM_FINANCE) {
				   atomParam = AtomFeed.FINANCE;
			   } else if (label == SYSTEM_SOCIAL) {
				   atomParam = AtomFeed.SOCIAL;
			   } else if (label == SYSTEM_PROMOTIONS) {
				   atomParam = AtomFeed.PROMOTIONS;
			   } else if (label == SYSTEM_UPDATES) {
				   atomParam = AtomFeed.UPDATES;
			   } else if (label == SYSTEM_FORUMS) {
				   atomParam = AtomFeed.FORUMS;
			   } else {
				   atomParam = label;
			   }
			   
			   // apparently iPads add these labels with slashes (ie. INBOX/ they are not actually nested labels just labels with slashes in them)
			   atomParam = atomParam.replace(/\//g, "-"); // slashes must had to replaced with - to work (yeah that's gmail wants it)
			   atomParam = encodeURIComponent(atomParam);
		   } else {
			   atomParam = AtomFeed.INBOX;
		   }
		   
		   var labelPath = "feed/atom/" + atomParam;
		   var url = that.getMailUrl({useStandardGmailUrl:true}) + labelPath + "?timestamp=" + Date.now();
		   var jqxhr = $.ajax({
			   type: "GET",
			   dataType: "text",
			   url: url,
			   timeout: requestTimeout,
			   xhr: function() {
				   var xhr = new window.XMLHttpRequest();
				   xhr.onreadystatechange = function(data) {
					   if (xhr.readyState == 4) {
						   // save responseURL onto jqxhr object 
						   jqxhr.responseURL = xhr.responseURL;
					   }
				   };
			       return xhr;
			   },
			   complete: function(jqXHR, textStatus) {
				   
				   // test flag
				   var TEST_FAIL = false;
				   if (TEST_FAIL) {		   
					   textStatus = "jasontimeout";
				   }
				   
				   if (textStatus == "success") {
					   that.error = null;
					   
					   var parser = new DOMParser();
					   parsedFeed = $(parser.parseFromString(jqXHR.responseText, "text/xml"));
					   
					   // detect Google account without Gmail (is usually redirected to an add gmail account page (ie. AddMailService)
					   if (jqXHR.responseURL && jqXHR.responseURL.indexOf("AddMailService") != -1) {
						   // find the email address in response
						   if (jqXHR.responseText) {
							   var emailMatches = extractEmails(jqXHR.responseText);
							   if (emailMatches) {
								   emailMatches.some(function(emailMatch) {
									   // make sure is it NOT @gmail
									   if (emailMatch.indexOf("@gmail.com") == -1) {
										   mailAddress = emailMatch;
										   return true;
									   }
								   });
							   }
						   }
						   
						   if (!mailAddress) {
							   mailAddress = "unknown";
						   }
						   reject(initErrors(that, jqXHR, "Error: Google account without Gmail", JError.GOOGLE_ACCOUNT_WITHOUT_GMAIL));
					   } else if (jqXHR.responseURL && jqXHR.responseURL.indexOf("ServiceNotAllowed") != -1) {
						   // ie. https://accounts.google.com/ServiceLogin?continue=https://admin.google.com/blah.com/ServiceNotAllowed?service=mail&service=CPanel&skipvpage=true&authuser=1
						   var matches = jqXHR.responseURL.match(/continue=(.*)admin.google.com\/(.*)\//);
						   if (matches && matches.length >= 3) {
							   mailAddress = matches[2];
						   }
						   if (!mailAddress) {
							   mailAddress = "unknown";
						   }
						   reject(initErrors(that, jqXHR, "Gmail is not enabled", JError.GMAIL_NOT_ENABLED));
					   } else if (jqXHR.responseURL && jqXHR.responseURL.indexOf("DomainRestrictedNetwork") != -1) {
						   // ie. https://accounts.google.com/b/0/DomainRestrictedNetwork?service=mail&continue=https://mail.google.com/mail/
						   mailAddress = "unknown";
						   reject(initErrors(that, jqXHR, "Gmail is not enabled", JError.GMAIL_NOT_ENABLED));
					   } else if (jqXHR.responseURL && jqXHR.responseURL.indexOf("NewServiceAccount") != -1) {
						   // ie. https://accounts.google.com/b/0/NewServiceAccount?service=mail&continue=https://mail.google.com/mail/
						   mailAddress = "unknown";
						   reject(initErrors(that, jqXHR, "Service account?", JError.GOOGLE_SERVICE_ACCOUNT));
					   } else {
						   if (jqXHR.responseURL && jqXHR.responseURL.indexOf("mail.google.com/mail/u/") == -1) {
							   logError("unrecognized responseURL: " + jqXHR.responseURL);
						   }
						   
						   var titleNode = parsedFeed.find('title');
						   if (titleNode.length >= 1) {			   
							   var titleNodeStr = $(titleNode[0]).text();
							   //titleNodeStr = "access is blocked";
							   mailTitle = titleNodeStr.replace("Gmail - ", "");
							   
							   // patch because <title> tag could contain a label with a '@' that is not an email address ie. Gmail - Label '@test@' for blah@gmail.com
							   var emails = mailTitle.match(/([\S]+@[\S]+)/ig);
							   if (emails) {
								   mailAddress = emails.last();
							   } else {
								   // catch these errors:
								   // Access to this site is blocked
								   // Acceso Denegado
								   // Denied Access Policy
								   
								   mailAddress = "unknown";
								   
								   var logErrorStr = "title node error: ";
								   var error;
								   if (/Google Accounts|My Account/.test(titleNodeStr)) {
									   logErrorStr += titleNodeStr + " responseurl: " + jqXHR.responseURL; // + " ... " + parsedFeed.text().substr(1000);
									   error = "Error: " + "redirection";
								   } else {
									   logErrorStr += titleNodeStr + " responseurl2: " + jqXHR.responseURL;
									   error = "Error: " + titleNodeStr;
								   }

								   reject(initErrors(that, jqXHR, error));
								   logError(logErrorStr);
								   return;
							   }
							   
							   var link = parsedFeed.find('link').attr('href');
							   that.link = link;
						   } else {
							   mailAddress = "Cookie problem, try signing out and in or restart browser!";
						   }
						   
						   params.parsedFeed = parsedFeed;
						   resolve(params);
					   }

				   } else {
					   // jqXHR.status = 401 = unauthorized, 0=timeout
					   // jqXHR.statusText = unauthorized, timeout
					   // textStatus (param) "success", "notmodified", "error", "timeout", "abort", or "parsererror"
					   
					   console.warn("fetchEmailsByLabel error: " + textStatus);

					   if (TEST_FAIL) {
						   setTimeout(function() {
							   reject(initErrors(that, jqXHR, "timeout"));
						   }, 1000);
					   } else {
						   var error;
						   if (jqXHR) {
							   error = jqXHR.statusText;
						   } else {
							   error = textStatus;
						   }
						   
						   reject(initErrors(that, jqXHR, error));
					   }
				   }
			   }
		   });
		   
		   //countEvent("atomFeedLabel");
	   });
   }
   
   function fetchEmailsByLabel(params) {
	   
	   // finished with feeds so exit/callback
	   if (params.monitorLabelsIndex >= params.monitorLabels.length) {
		   return Promise.resolve(params);
	   } else {
		   return fetchFeed(params).then(function(fetchFeedResponse) {
			   
			   var parsedFeed = fetchFeedResponse.parsedFeed;
			   
			   // If previousMonitorLabel not matching current then we are probably fetching this feed for the first time and so now we have the email address, we must now check if the user selected a different label to monitor for this email address, if so stop this one and call the feed again
			   //console.log("params: ", params.monitorLabels)
			   //console.log("getmonitors: ", that.getMonitorLabels())
			   if (params.monitorLabels.toString() != that.getMonitorLabels().toString()) {
				   // this is a safety flag so that they we don't endless recursively call getEmails()
				   if (params.fetchFeedAgainSinceMonitorLabelIsDifferent) {
					   that.error = "JError: recursive error with label";
					   var errorObj = new Error(that.error);
					   errorObj.jqXHR = fetchFeedResponse.jqXHR;
					   return Promise.reject(errorObj);
				   } else {					   
					   // update monitor labels and send it again
					   console.log("call again since fetchFeedAgainSinceMonitorLabelIsDifferent");
					   params.monitorLabels = that.getMonitorLabels();
					   params.fetchFeedAgainSinceMonitorLabelIsDifferent = true;
					   return fetchEmailsByLabel(params);
				   }
			   } else {
				   return getFeedUnreadCount(params, parsedFeed).then(function(feedUnreadCount) {
					   return addParsedFeed(params, parsedFeed, feedUnreadCount);
				   }).then(function() {
					   return fetchEmailsByLabel(params);
				   }).catch(function(error) {
					   return Promise.reject(error);
				   });
			   }
		   });
	   }
   }
   
   function findThreadByMail(threads, mail) {
	   for (var a=0; a<threads.length; a++) {
		   for (var b=0; b<threads[a].messages.length; b++) {
			   alert("need to refactor because mail.id used to be id now it's frontendmessageid");
			   if (threads[a].messages[b]["X-GM-MSGID"] == mail.id) {
				   return threads[a];
			   }
		   }
	   }
   }
   
   function ensureUnreadAndInbox(feed1, feed2) {
	   console.log("ensureUnreadAndInbox");
	   return new Promise(function(resolve, reject) {
		   
		   // Monitoring the Primary/inbox is usually not enough because some users will mark as done/archive emails without marking them as read and thus these "primary"/inbox labelled emails will still show up even though they don't appear in the user's ui
		   // .. so we must also check that the "inbox" to prove they did not mark as done these emails
		   if (feed1 && feed1.feedUnreadCount) {
			   
			   // get previously fetched inbox feed OR get new fetch
			   new Promise(function(resolve, reject) {
				   if (feed2) {
					   resolve(feed2);
				   } else {
					   console.log("must fetch primary/inbox feed")
					   var feed2Label;
					   if (feed1.label == SYSTEM_INBOX) {
						   feed2Label = SYSTEM_PRIMARY;
					   } else if (isMainCategory(feed1.label)) {
						   feed2Label = SYSTEM_INBOX;
					   }
					   fetchFeed({label:feed2Label}).then(function(fetchFeedResponse) {
						   feed2 = fetchFeedResponse;
						   resolve(fetchFeedResponse);
					   }).catch(function(error) {
						   reject(error);
					   });
				   }
			   }).then(function(feed2Response) {
				   console.log("otherFeed", feed2Response);
				   var feed2UnreadCount = Number(feed2Response.parsedFeed.find('entry').length);
				   
				   var lastFeed1Entry = feed1.parsedFeed.find("entry").last();
				   var lastFeed1EntryIssued = Date.parse(lastFeed1Entry.find('issued').text());
				   
				   var lastFeed2Entry = feed2Response.parsedFeed.find("entry").last();
				   var lastFeed2EntryIssued;
				   if (lastFeed2Entry.length) {
					   lastFeed2EntryIssued = Date.parse(lastFeed2Entry.find('issued').text());
				   }
				   
				   console.log("last feed dates", lastFeed1EntryIssued, lastFeed2EntryIssued);
				   
				   // if less than the maximum 20 OR last entry is after last entry of other feed, than we can use this feed to gaurantee we can remove emails from the primary/inbox fetch if they are also not found in this primary/inbox feed
				   // OR if oldest primary/inbox email is within time range of all emails in inbox feed
				   if (feed2UnreadCount < MAX_EMAILS_IN_ATOM_FEED || lastFeed1EntryIssued.isAfter(lastFeed2EntryIssued)) {
					   // transport jquery array to array for speed optimization
					   var feed2Array = [];
					   
					   feed2Response.parsedFeed.find('entry').each(function () {
						   var $entry = $(this);
						   var issued = Date.parse($entry.find('issued').text());
						   var id = getMessageIdFromAtomFeedEntry($entry);
						   feed2Array.push({id:id, issued:issued});
					   });

					   // now let's remove all primary/inbox emails which do not have an inbox/primary label
					   for (var a=0; a<emailsInAllLabels.length; a++) {
						   if (emailsInAllLabels[a].monitoredLabel == feed1.label) {
							   var foundFeed2Label = false;
							   for (var b=0; b<feed2Array.length; b++) {
								   if (emailsInAllLabels[a].id == feed2Array[b].id) {
									   foundFeed2Label = true;
									   break;
								   }
							   }
							   
							   if (foundFeed2Label) {
								   that.unreadCount++;
							   } else {
								   console.log("remove email because did not pass primaryANDinbox test", emailsInAllLabels[a].title);
								   
								   var mailIdNotFoundInBothPrimaryAndInbox = emailsInAllLabels[a].id;
								   
								   emailsInAllLabels.splice(a, 1);
								   a--;
								   //that.unreadCount--;
								   
								   // remove it from newestmailarray also
								   newestMailArray.some(function(newestMail, index) {
									   if (mailIdNotFoundInBothPrimaryAndInbox == newestMail.id) {
										   newestMailArray.splice(index, 1);
										   return true;
									   }
								   });
							   }
						   }
					   }
					   
					   resolve();
				   } else {
					   // since more than 20 (or more) emails than some might have been excluded - so we cannot use this inbox fetch
					   reject(JError.CANNOT_ENSURE_MAIN_AND_INBOX_UNREAD);
				   }
			   }).catch(function(error) {
				   reject(error);
			   });
			   
		   } else {
			   resolve();
		   }
	   });
   }
   
   this.getLabelName = function(labelId) {
	   var labelName;
	   
	   if (Settings.read("accountAddingMethod") == "autoDetect") {
		   labelName = labelId;
	   } else {
		   if (labelId == SYSTEM_PRIMARY) {
			   labelName = getMessage("primary");
		   } else if (labelId == SYSTEM_PURCHASES) {
			   labelName = getMessage("purchases");
		   } else if (labelId == SYSTEM_FINANCE) {
			   labelName = getMessage("finance");
		   } else if (labelId == SYSTEM_SOCIAL) {
			   labelName = getMessage("social");
		   } else if (labelId == SYSTEM_SOCIAL) {
			   labelName = getMessage("social");
		   } else if (labelId == SYSTEM_PROMOTIONS) {
			   labelName = getMessage("promotions");
		   } else if (labelId == SYSTEM_UPDATES) {
			   labelName = getMessage("updates");
		   } else if (labelId == SYSTEM_FORUMS) {
			   labelName = getMessage("forums");
		   } else {
			   if (labels) {
				   labels.some(function(thisLabel) {
					   if (thisLabel.id == labelId) {
						   labelName = thisLabel.name;
						   return true;
					   }
				   });
			   }
		   }
	   }
	   
	   if (!labelName) {
		   labelName = "NewLabelRestart";
	   }
	   
	   return labelName;
   }
   
   this.hasMonitoredLabel = function(labelId) {
	   return that.getMonitorLabels().some(function(monitorLabel) {
		   if (monitorLabel == labelId) {
			   return true;
		   }
	   });
   }
   
   this.setAccountId = function(id) {
	   that.id = id;
   }
   
   this.reset = function() {
	   historyId = null;
	   mailArray = [];
	   newestMailArray = [];
	   emailsInAllLabels = [];
   }
   
   this.syncSignInId = function(secondCall) {
	   console.log("syncSyncInId");
	   return new Promise(function(resolve, reject) {
		   $.ajax(MAIL_DOMAIN_AND_PATH + "u/?authuser=" + encodeURIComponent(mailAddress)).done(function(data, textStatus, jqXHR) {
			   // wrap response in a div because or else the jQuery.find would not work
			   var $html = $("<div/>");
			   $html.html(data);
			   var $metaTag = $html.find("meta[name='application-url']").first();
			   var content = $metaTag.attr("content"); // returns: https://mail.google.com/mail/u/0
			   if (content) {
				   // Patch: seems that on the first call to ?authuser after granting access the response points to /u/0 always, I think by caling it once it then signs in correctly and you can call ?authuser again to get the right index
				   var emails = extractEmails($html.html());
				   if (emails && emails.length && emails.first() == mailAddress) {
					   var parts = content.match(/u\/(\d+)/);
					   var id = parts[1];
					   console.log("setting " + mailAddress + " to id: " + id);
					   that.setAccountId(id);
					   resolve();
				   } else {
					   if (secondCall) {
						   console.log("failed after 2 consecutive authuser calls");
						   reject(new Error("Could not find email in response - might be signed out [12]"));
					   } else {
						   console.log("did not find matching email in authuser response, so call it again");
						   that.syncSignInId(true).then(function() {
							   resolve();
						   }).catch(function(errorResponse) {
							   reject(errorResponse);
						   });
					   }
				   }
			   } else {
				   reject(new Error("Could not find email in response - might be signed out"));
			   }
		   }).fail(function(jqXHR, textStatus, errorThrown) {
			   reject(errorThrown);
		   });
	   });
   }
   
   this.fetchThreads = function(mailArray) {
	   // accounts count will be 0 when you start the extension or pollAccounts (that's ok because initMailAccount sets accounts to 0) once the interval calls this function then the accounts should be 1 or + 
	   var maxGetThreads;
	   if (bg.accounts.length) {
		   // do this to prevent locked accounts (note it used be 20 and no averaging so 20 for each account, i'm such an idiot
		   maxGetThreads = 5 / bg.accounts.length; // because this method will be called for each accounts let's average the number of threads per account
	   } else {
		   maxGetThreads = 1;
	   }
	   
	   var getThreadsCount = 0;
	   var promises = [];
	   
	   $.each(mailArray, function(i, email) {
		   // lots of peeps in the thread so this might be a reply to a conversation (but which was already 'read' by user before so this check does not know the thread's past or initial email etc.) (and thus the summary in the Gmail's feed will not match what this sender wrote, but rather it matches summary of the first email in this thread
		   if (true) { //email.contributors.length || Settings.read("spokenWordsLimit") == "paragraph" || Settings.read("spokenWordsLimit") == "wholeEmail") { 
			   //console.log("has contributors: " + email.contributors.length + " or spokenwordslimit high");
			   if (getThreadsCount < maxGetThreads) {
				   var promise = email.getThread();
				   promises.push(promise);
				   getThreadsCount++;
			   } else {
				   console.warn("MAX fetch last conversations reached, ignoring now.");						   
			   }
		   }
	   });
	   
	   if (promises.length) {
		   console.log("fetchThreads: ", promises);
	   }
	   
	   return Promise.all(promises);
   }
   
   function initLabelDetails(mailObject) {
	   var label = mailObject.monitoredLabel;
	   if (label == SYSTEM_INBOX) {
		   mailObject.formattedLabel = getMessage("inbox");
		   mailObject.labelSortIndex = 0;
	   } else if (label == SYSTEM_IMPORTANT || label == SYSTEM_IMPORTANT_IN_INBOX) {
		   mailObject.formattedLabel = getMessage("importantMail");
		   mailObject.labelSortIndex = 1;
	   } else if (label == SYSTEM_ALL_MAIL) {
		   mailObject.formattedLabel = getMessage("allMail");
		   mailObject.labelSortIndex = 2;
	   } else if (label == SYSTEM_PRIMARY) {
		   mailObject.formattedLabel = getMessage("primary");
		   mailObject.labelSortIndex = 3;
	   } else if (label == SYSTEM_PURCHASES) {
		   mailObject.formattedLabel = getMessage("purchases");
		   mailObject.labelSortIndex = 4;
	   } else if (label == SYSTEM_FINANCE) {
		   mailObject.formattedLabel = getMessage("finance");
		   mailObject.labelSortIndex = 5;
	   } else if (label == SYSTEM_SOCIAL) {
		   mailObject.formattedLabel = getMessage("social");
		   mailObject.labelSortIndex = 6;
	   } else if (label == SYSTEM_PROMOTIONS) {
		   mailObject.formattedLabel = getMessage("promotions");
		   mailObject.labelSortIndex = 7;
	   } else if (label == SYSTEM_UPDATES) {
		   mailObject.formattedLabel = getMessage("updates");
		   mailObject.labelSortIndex = 8;
	   } else if (label == SYSTEM_FORUMS) {
		   mailObject.formattedLabel = getMessage("forums");
		   mailObject.labelSortIndex = 9;
	   } else {
		   mailObject.formattedLabel = mailObject.account.getLabelName(label);
		   if (mailObject.formattedLabel) {
			   mailObject.labelSortIndex = mailObject.formattedLabel.toLowerCase().charCodeAt(0);
		   } else {
			   // empty label, might have once been monitored but now label removed and marked as spam or something
			   // let's move it to the end of the list
			   mailObject.labelSortIndex = 10;
		   }
	   }
   }
   
   function initNewestEmails(mailObject) {
	   initLabelDetails(mailObject);
	   
	   // logic mainly for auto-detect
	   // check if this email appeared in previous label fetches (ie. it was labeled with multiple labels) if so then avoid adding this email again
	   var emailAlreadyFoundInADifferentLabelFetch;
	   //var foundInPrimaryAndInbox;
	   
	   emailsInAllLabels.forEach(function(emailInAllFeeds) {
		   //console.log("emailsInAllLabels", mailObject, emailInAllFeeds);
		   if (emailInAllFeeds.id == mailObject.id) {
			   
			   if (Settings.read("accountAddingMethod") == "autoDetect") {
				   // only for auto-detect because oauth can retrieve all the labels for an email
				   emailInAllFeeds.labels.push( mailObject.monitoredLabel );
			   }
			   
			   if (isMainCategory(mailObject.monitoredLabel) && emailInAllFeeds.monitoredLabel == SYSTEM_INBOX) {
				   // do nothing
				   //foundInPrimaryAndInbox = true;
			   } else {
				   emailAlreadyFoundInADifferentLabelFetch = true;
			   }

		   }
	   });
	   
	   //console.log("emailAlreadyFoundInADifferentLabelFetch: " + emailAlreadyFoundInADifferentLabelFetch);
	   if (!emailAlreadyFoundInADifferentLabelFetch) {
		   emailsInAllLabels.push(mailObject);
		   
		   var mailAlreadyExisted = mailArray.some(function(oldMail) {
			   if (oldMail.id == mailObject.id) {
				   return true;
			   }
		   });
		   if (!mailAlreadyExisted) {
			   newestMailArray.push(mailObject);
		   }
	   }
	   return {emailAlreadyFoundInADifferentLabelFetch:emailAlreadyFoundInADifferentLabelFetch};
   }
   
   function syncMailArray() {
	   // remove emails that have disappeared from the feed (user could have done any number of actions on the emails via the gmail.com etc.
	   for (var a=0; a<mailArray.length; a++) {
		   var emailStillInFeed = false; 
		   for (var b=0; b<emailsInAllLabels.length; b++) {
			   if (mailArray[a].id == emailsInAllLabels[b].id) {
				   emailStillInFeed = true;
				   break;
			   }
		   }
		   if (!emailStillInFeed) {
			   console.log("removing: " + mailArray[a].title);
			   mailArray.splice(a, 1);
			   a--;
		   }
	   }
	   
	   // commented this because i was creating a new array and break polymer's data binding
	   //mailArray = mailArray.concat(newestMailArray);
	   // this will alter the mailArray and keep the polymer data binding
	   Array.prototype.push.apply(mailArray, newestMailArray);

	   sortMailArray();
   }
   
   function sortMailArray() {
	   mailArray.sort(function (a, b) {
		   if (!Settings.read("groupByLabels") || a.monitoredLabel == b.monitoredLabel) {
			   if (a.issued > b.issued)
				   return -1;
			   if (a.issued < b.issued)
				   return 1;
			   return 0;
		   } else {
			   if (Settings.read("groupByLabels")) {
				   if (a.labelSortIndex < b.labelSortIndex) {
					   return -1;
				   } else if (a.labelSortIndex > b.labelSortIndex) {
					   return 1;
				   } else {
					   return 0;
				   }
			   } else {
				   return 0;
			   }
		   }
	   });
   }
   
   this.getError = function(useHtml) {
	   var error;
	   var niceError;
	   var instructions = "";
	   
	   console.log("online: " + navigator.onLine);
	   
	   if (that.errorCode === 0) {
		   error = JError.NETWORK_ERROR;
		   niceError = "Network error!";
	   } else if (that.errorCode == 429) {
		   error = JError.RATE_LIMIT_EXCEEDED;
		   niceError = "Rate limit exceeded!";
	   } else if (that.errorCode == 400 || that.errorCode == 401) {
		   error = JError.ACCESS_REVOKED;
		   niceError = "Access was revoked!";
	   } else if (that.error == JError.NO_TOKEN_FOR_EMAIL) {
		   error = JError.NO_TOKEN_FOR_EMAIL;
		   niceError = "No access token";
	   } else if (that.errorCode == 404) {
		   error = JError.MIGHT_BE_OFFLINE;
		   niceError = "Might be offline";
	   } else if (that.errorCode == 503) {
		   error = JError.GMAIL_BACK_END;
		   niceError = "Gmail service issue: " + that.error;
	   } else if (that.error == "OK") {
		   niceError = "";
	   } else {
		   error = that.error;
		   niceError = that.error;
	   }
	   
	   var refreshHtml = "<paper-button class='refreshAccount'>" + getMessage("refresh") + "</paper-button>";
	   
	   if (Settings.read("accountAddingMethod") == "autoDetect") {
			   if (that.errorCode == JError.GOOGLE_ACCOUNT_WITHOUT_GMAIL) {
				   if (useHtml) {
					   instructions = "<a class='inherit' href='https://jasonsavard.com/wiki/Google_Accounts_without_Gmail?ref=autoDetectPopupError' target='_blank'><paper-button>" + getMessage("moreInfo") + "</paper-button></a>";
				   } else {
					   instructions = "Only Gmail or Google Apps can be polled";
				   }
			   } else if (that.errorCode == JError.GMAIL_NOT_ENABLED) {
				   if (useHtml) {
					   instructions = "<a class='inherit' href='https://support.google.com/a/answer/57919' target='_blank'><paper-button>" + getMessage("moreInfo") + "</paper-button></a>";
				   } else {
					   instructions = "You must enable the Gmail service in your Admin console";
				   }
			   } else if (that.errorCode == JError.CANNOT_ENSURE_MAIN_AND_INBOX_UNREAD) {
				   if (useHtml) {
					   instructions = "Use the <a class='inherit' href='options.html?ref=cannotEnsureMainAndInbox#accounts' target='_blank'><paper-button>" + getMessage("addAccount") + "</paper-button></a> option instead!";
				   } else {
					   instructions = "Use the Add Accounts option instead!";
				   }
			   } else {
				   if (useHtml) {
					   instructions = refreshHtml + " or <a class='inherit' href='https://jasonsavard.com/wiki/Auto-detect_sign_in_issues?ref=autoDetectPopupError' target='_blank'><paper-button>" + getMessage("help") + "</paper-button></a>";
				   } else {
					   instructions = "Refresh or try signing out/in or " + getMessage("addAccount");
				   }
			   }
	   } else {
		   if (error == JError.ACCESS_REVOKED || error == JError.NO_TOKEN_FOR_EMAIL) {
			   instructions = "";
			   if (useHtml) {
				   if (error == JError.ACCESS_REVOKED) {
					   instructions += refreshHtml + " or ";
				   }
				   instructions += "<a class='inherit' href='options.html#accounts' target='_blank'><paper-button>" + getMessage("addAccount") + "</paper-button></a> to re-grant access!";
			   } else {
				   if (error == JError.ACCESS_REVOKED) {
					   instructions += "Refresh or ";
				   }
				   instructions += getMessage("addAccount") + " to re-grant access!";
			   }
		   } else {
			   if (useHtml) {
				   instructions = refreshHtml;
			   } else {
				   instructions = getMessage("refresh");
			   }
		   }
	   }
	   
	   return {error:error, niceError:niceError, instructions:instructions}
   }
   
   function getMessageIdFromAtomFeedEntry($entry) {
	   var link = $entry.find('link').attr('href');
	   var id = link.replace(/.*message_id=(\d\w*).*/, "$1");
	   return id;
   }
   
   function getHistoryActions(history) {
	   var historyActions;
	   var deleted;
	   
	   if (history.messagesAdded) {
		   historyActions = history.messagesAdded;
	   } else if (history.messagesDeleted) {
		   historyActions = history.messagesDeleted;
		   deleted = true;
	   } else if (history.labelsAdded) {
		   historyActions = history.labelsAdded;
	   } else if (history.labelsRemoved) {
		   historyActions = history.labelsRemoved;
	   } else {
		   historyActions = [];
	   }
	   
	   return {historyActions:historyActions, deleted:deleted};
   }
   
   function isUnread(labelIds) {
	   return labelIds.indexOf(GmailAPI.labels.UNREAD) != -1 && labelIds.indexOf(GmailAPI.labels.SPAM) == -1 && labelIds.indexOf(GmailAPI.labels.TRASH) == -1;
   }
   
   function passesLabelTests(historyMessage, account) {
	   var testFlag;
	   var monitoredLabels = account.getMonitorLabels();
	   
	   if (monitoredLabels.indexOf(SYSTEM_ALL_MAIL) != -1) {
		   testFlag = true;
	   } else {
		   testFlag = monitoredLabels.some(function(monitoredLabel) {
			   if (historyMessage.labelIds.indexOf(getGmailAPILabelId(monitoredLabel)) != -1) {
				   if (isMainCategory(monitoredLabel) || monitoredLabel == SYSTEM_IMPORTANT_IN_INBOX) { // check that INBOX is there if monitoring a main category or important+inbox label
					   if (historyMessage.labelIds.indexOf(GmailAPI.labels.INBOX) != -1) {
						   return true;
					   }
				   } else {
					   return true;
				   }
			   }
		   });
	   }
	   
	   return testFlag;
   }
   
   // Retreives inbox count and populates mail array
   this.getEmails = function() {
	   return new Promise(function(resolve, reject) {
		   if (Settings.read("accountAddingMethod") == "autoDetect") {
			   fetchEmailsByLabel({monitorLabels:that.getMonitorLabels(), monitorLabelsIndex:0, feedsArrayInfo:[]}).then(function(fetchEmailsResponse) {
				   var inboxFeed;

				   that.unreadCount = 0;
				   
				   emailsInAllLabels = [];
				   newestMailArray = [];
				   
				   var mainCategoryFeeds = [];
				   
				   if (fetchEmailsResponse.feedsArrayInfo) {
					   $.each(fetchEmailsResponse.feedsArrayInfo, function(feedInfoIndex, feedInfo) {
						   
						   if (feedInfo.label == SYSTEM_INBOX) {
							   inboxFeed = feedInfo;
						   }
						   if (isMainCategory(feedInfo.label)) {
							   mainCategoryFeeds.push(feedInfo);
						   } else {
							   // if NOT main categegory then add here else we add the unread count only if matches main+inbox refer to ensureUnreadAndInbox...
							   that.unreadCount += feedInfo.feedUnreadCount;
						   }
						   
						   // Parse xml data for each mail entry
						   feedInfo.parsedFeed.find('entry').each(function () {
							   
							   var $entry = $(this);
							   
							   var title = $entry.find('title').text();
							   
							   var summary = $entry.find('summary').text();
							   summary = filterEmailBody(title, summary);
							   
							   var issued = Date.parse($entry.find('issued').text());
							   
							   var imapMessageId = $entry.find('id').text().split(":")[2]; // ex. fetch the last number for the messageid... tag:gmail.google.com,2004:1436934733284861101
							   
							   var id = getMessageIdFromAtomFeedEntry($entry);
							   
							   var authorName = $entry.find('author').find('name').text();
							   var authorMail = $entry.find('author').find('email').text();
							   var contributors = $entry.find("contributor");
							   
							   // Encode content to prevent XSS attacks
							   // commend title one because & was converted to &amp; in subject lines 
							   //title = bg.html_sanitize(title);
							   summary = bg.html_sanitize(summary);
							   authorMail = bg.html_sanitize(authorMail);							   
							   
							   var mailObject = new MailObject();
							   mailObject.account = that;
							   mailObject.id = id;
							   mailObject.imapMessageId = imapMessageId;
							   mailObject.title = title;
							   mailObject.summary = summary;
							   mailObject.issued = issued;
							   mailObject.authorName = authorName;
							   mailObject.authorMail = authorMail;
							   mailObject.labels = [feedInfo.label]; // initialize array and make first item in array the default label
							   mailObject.monitoredLabel = feedInfo.label;
							   mailObject.contributors = contributors;
							   
							   var newestEmailsResponse = initNewestEmails(mailObject);
							   if (newestEmailsResponse.emailAlreadyFoundInADifferentLabelFetch) {
								   that.unreadCount--;
							   }
						   });
					   });
				   }
				   
				   // must do it sequentially because we don't want to poll for inbox several times
				   var allPromises = mainCategoryFeeds.reduce(function(sequence, mainCategoryFeed) {
					    return sequence.then(function() {
					    	// fetch next feed
					    	return ensureUnreadAndInbox(mainCategoryFeed, inboxFeed);
					    }).then(function(response) {
					    	// do nothing
					    }).catch(function(error) {
					    	throw error;
					    });
				   }, Promise.resolve());

				   allPromises.then(function(response) {
					   syncMailArray();
					   
					   fetchEmailsResponse.mailAccount = that;
					   fetchEmailsResponse.newestMailArray = newestMailArray;
					   
					   if (newestMailArray.length) {
						   that.fetchThreads(newestMailArray).then(function() {
							   resolve(fetchEmailsResponse);
						   }).catch(function(error) {
							   reject(error);
						   });
					   } else {
						   resolve(fetchEmailsResponse);
					   }
				   }).catch(function(error) {
					   console.error(error);
					   
					   if (error == JError.CANNOT_ENSURE_MAIN_AND_INBOX_UNREAD) {
						   that.error = "Cannot use auto-detect";
						   that.errorCode = JError.CANNOT_ENSURE_MAIN_AND_INBOX_UNREAD;
					   } else {
						   that.error = error;
					   }
					   
					   // always set an error field to the account before rejecting
					   reject("error in ensure in inbox: " + error);
				   });
			   }).catch(function(error) {
				   reject(error);
			   });
		   } else {
			   // added accounts
			   
			   function setAccountError(account, error) {
				   account.error = error;
				   account.errorCode = error.code;
				   
				   console.log("setaccounterror online: " + navigator.onLine);
	
				   if (error == "timeout") {
					   // don't have to display it again since it's logged already
				   } else if (error.code == 429) { // .error = "Rate Limit Exceeded"
					   logError("Caught rate limit exceeded");
				   } else {
					   error += " code: " + error.code;
					   if (error.stack) {
						   error += " stack: " + error.stack;
					   }
					   console.error("setAccountError: ", error);
				   }
			   }
			   
			   function getInitialMessages(params) {
				   return new Promise(function(resolve, reject) {
					   // only pass history id (if we want to skip calling getHistoryForFirstTime again)
					   getMessagesByList({monitoredLabels:params.account.getMonitorLabels(), historyId:params.historyId}).then(function(newestMailArray) {
						   params.getEmailsResponse.newestMailArray = newestMailArray;
						   resolve(params.getEmailsResponse);
					   }).catch(function(error) {
						   setAccountError(that, error);
						   reject(error);
					   });
				   });
			   }
			   
			   function getMatchingMail(message) {
				   var index;
				   var matchingMail;
				   var existingMessage;
				   
				   if (that.getSetting("conversationView")) {
					   index = getMailArrayIndexByThreadId(message.threadId);
					   //console.log("getMatchingMail", mailArray.length, message.threadId, index);
				   } else {
					   index = getMailArrayIndexByMessageId(message.id);
				   }
				   
				   if (index != -1) {
					   matchingMail = mailArray[index];
					   var messageFound = matchingMail.messages.some(function(matchingMessage) {
						   console.log("loop messages", matchingMessage);
						   if (message.id == matchingMessage.id) {
							   console.log("existing", matchingMessage)
							   existingMessage = matchingMessage;
							   return true;
						   }
					   });
				   }
				   
				   return {index:index, matchingMail:matchingMail, existingMessage:existingMessage};
			   }
	
			   // call this to load labels
			   that.getLabels().then(function() {
				   that.error = null;
				   that.errorCode = null;
				   
				   var getEmailsResponse = {};
				   getEmailsResponse.mailAccount = that;
				   var monitoredLabels = that.getMonitorLabels();
				   
				   newestMailArray = [];

				   if (historyId) {
					   var getMessagesByHistoryParams = {historyId:historyId, histories:[]};
					   getMessagesByHistory(getMessagesByHistoryParams).then(function(messagesByHistoryResponse) {
						   return new Promise(function(resolve, reject) {
							   var histories = getMessagesByHistoryParams.histories;
							   if (histories && histories.length) {
								   
								   var processedMessageIds = [];
								   var messagesToFetch = [];
								   var mergeUnreadRelativeCount = 0;
								   
								   histories.forEach(function(history, historyIndex) {
									   var historyActionsResponse = getHistoryActions(history);
									   historyActionsResponse.historyActions.forEach(function(historyAction) {
										   
										   // message could be listed several times in history so only process this message once
										   if (processedMessageIds.indexOf(historyAction.message.id) == -1) {
											   processedMessageIds.push(historyAction.message.id);
											   
											   var message = historyAction.message;
											   
											   // possibly replace message with last message for this message id, because it could have had multiple actions performed on it
											   for (var a=histories.length-1; a>historyIndex; a--) {
												   var lastHistoryActionsResponse = getHistoryActions(histories[a]);
												   lastHistoryActionsResponse.historyActions.some(function(lastHistoryAction) {
													   if (lastHistoryAction.message.id == historyAction.message.id) {
														   console.log("matched more recent history", lastHistoryAction);
														   historyActionsResponse = lastHistoryActionsResponse;
														   message = lastHistoryAction.message;
														   return true;
													   }
												   });
											   }
											   
											   console.log("message", message);
											   
											   var showMailInPopup = !historyActionsResponse.deleted && isUnread(message.labelIds) && passesLabelTests(message, that);
											   console.log("showMailInPopup: " + showMailInPopup + " " + isUnread(message.labelIds) + " " + passesLabelTests(message, that));
											   var matchingMailResponse = getMatchingMail(message);
											   
											   if (matchingMailResponse.matchingMail) {
												   if (showMailInPopup) {
													   // merge messages
													   if (matchingMailResponse.existingMessage) {
														   // update labels, they *might have changed
														   matchingMailResponse.existingMessage.labels = message.labelIds;
													   } else {
														   messagesToFetch.push(message);
													   }
												   } else { // is no longer unread (maybe deleted, archive or marked as read etc.)
													   console.log("remove message: " + message.id);
													   matchingMailResponse.matchingMail.removeMessageById(message.id);
													   
													   // if all messages from thread are no longer unread then remove it from the array
													   var allMessagesRead = matchingMailResponse.matchingMail.messages.every(function(message) {
														   return !isUnread(message.labels);
													   });
													   
													   if (allMessagesRead) {
														   mailArray.splice(matchingMailResponse.index, 1);
														   mergeUnreadRelativeCount--;
													   }
												   }
											   } else {
												   if (showMailInPopup) {
													   messagesToFetch.push(message);
												   } else {
													   // 1) we might have removed it immediately after user action like mark as read
													   // 2) was never in the mailarray and is still not unread: so ignore it :)
												   }
											   }
										   }
									   });
									   
								   });
								   
								   fetchMessagesByIds(messagesToFetch).then(function(fetchMessagesByIdsResponse) {
									   var createResponse = createMailObjects({httpBodies:fetchMessagesByIdsResponse.httpBodies});
									   createResponse.mailObjects.forEach(function(historyMailObject) {
										   // Not Found, so let's generate a stub to pass to mergeMailObject to remove it
										   if (historyMailObject.jerror == JError.NOT_FOUND) {
											   console.error("not found - should i do something")
										   } else {
											   var matchingMailResponse = getMatchingMail(historyMailObject);
											   if (matchingMailResponse.matchingMail) {
												   // merge messages
												   matchingMailResponse.matchingMail.messages.forEach(function(matchingMessage) {
													   var historyMessageFound = historyMailObject.getMessageById(matchingMessage.id);
													   if (!historyMessageFound) {
														   historyMailObject.messages.push(matchingMessage);
													   }
												   });
												   
												   historyMailObject.sortMessages();

												   // let's add this new mailobject to queue and remove it after merging the messages
												   mailArray.push(historyMailObject);
												   mailArray.splice(matchingMailResponse.index, 1);
											   } else {
												   mailArray.push(historyMailObject);
												   mergeUnreadRelativeCount++;
											   }
											   newestMailArray.push(historyMailObject);
											   
											   initLabelDetails(historyMailObject);
										   }
									   });

									   sortMailArray();
									   
									   getEmailsResponse.newestMailArray = newestMailArray;
									   
									   // Fixes this issue: when many emails are unread and you mark some older emails as read it does not reduce the count
									   // if already displaying more emails then the maximum allowed - then we fetch the unreadcount - because we can't rely on detecting if emails were removed since they may not have previously been fetched due to my max limits
									   new Promise(function(resolve, reject) {
										   if (that.unreadCount >= MAX_EMAILS_TO_FETCH) {
											   fetchUnreadCount(monitoredLabels, true).then(function(fetchedUnreadCount) {
												   that.unreadCount = fetchedUnreadCount;
											   }).catch(function() {
												   // ignore error let's just the other logic...
												   that.unreadCount += mergeUnreadRelativeCount;
											   }).then(function() {
												   resolve();
											   });
										   } else {
											   that.unreadCount += mergeUnreadRelativeCount;
											   resolve();
										   }
									   }).catch(function(errorResponse) {
										   console.error(errorResponse);
									   }).then(function() {
										   // this was put in place when monitoring primary label - because we use the resultSizeEstimate which can be wrong - but the newestMailArray should be accurate
										   if (mailArray.length < that.unreadCount || mailArray.length < MAX_EMAILS_TO_FETCH) {
											   that.unreadCount = mailArray.length;
										   }
										   resolve({historyId:messagesByHistoryResponse.historyId});
									   });

								   }).catch(function(errorResponse) {
									   reject(errorResponse);
								   });
								   
							   } else {
								   resolve({historyId:messagesByHistoryResponse.historyId});
							   }
						   });
					   }).then(function(response) {
						   historyId = response.historyId;
						   resolve(getEmailsResponse);
					   }).catch(function(errorResponse) {
						   console.error("error", errorResponse);
						   if (errorResponse.jreason == JError.HISTORY_INVALID_OR_OUT_OF_DATE || errorResponse.jreason == JError.TOO_MANY_HISTORIES || errorResponse == JError.EXCEEDED_MAXIMUM_CALLS_PER_BATCH) {
							   // Must reinitalize
							   console.log(errorResponse.jreason + " - let's reinitalize mail");
							   
							   historyId = null;
							   // REPLICATED LOGIC below
							   getInitialMessages({account:that, getEmailsResponse:getEmailsResponse}).then(function(response) {
								   resolve(response);
							   }).catch(function(error) {
								   reject(error);
							   });
						   } else {
							   setAccountError(that, errorResponse);
							   reject(errorResponse);
						   }
					   });
				   } else {
					   getInitialMessages({account:that, getEmailsResponse:getEmailsResponse}).then(function(response) {
						   resolve(response);
					   }).catch(function(error) {
						   reject(error);
					   });
				   }
			   }).catch(error => {
				   setAccountError(that, error);
				   reject(error);
			   });
		   }
	   });

	   //countEvent("getEmails");
   }
   
   function getMessagesByList(messagesByListParams) {
	   console.log("getMessagesByList");
	   
	   return new Promise(function(resolve, reject) {
		   
		   that.unreadCount = 0;
		   emailsInAllLabels = [];
	
		   var currentHistoryId;
		   
		   var promises = [];
		   promises.push(fetchUnreadCount(messagesByListParams.monitoredLabels));
		   promises.push(new Promise(function(resolve, reject) {
			   // if we already have history then let's just pass it forward
			   if (messagesByListParams.historyId) {
				   resolve({historyId:messagesByListParams.historyId});
			   } else {
				   getHistoryForFirstTime().then(function(response) {
					   resolve(response);
				   }).catch(function(errorResponse) {
					   reject(errorResponse);
				   });
			   }
		   }));
		   
		   Promise.all(promises).then(function(promiseAllResponse) {
			   // fetchUnreadCount response
			   that.unreadCount = promiseAllResponse[0];
			   // getHistoryForFirstTime response
			   return promiseAllResponse[1]; 
		   }).then(function(historyResponse) {
			   currentHistoryId = historyResponse.historyId;
			   return getMessages(messagesByListParams.monitoredLabels, function(getMessagesResponse) {
				   if (getMessagesResponse.fetchMessagesByLabelsResponse) {
					   that.unreadCount -= getMessagesResponse.fetchMessagesByLabelsResponse.oauthEmailAlreadyFoundInADifferentLabelFetch;

					   //that.unreadCount = getMessagesResponse.fetchMessagesByLabelsResponse.totalMessages;
					   console.log("fetchMessagesByLabelsResponse", getMessagesResponse.fetchMessagesByLabelsResponse);
					   getMessagesResponse.fetchMessagesByLabelsResponse.responses.forEach(function(response) {
						   var createResponse = createMailObjects(response);
						   
						   createResponse.mailObjects.forEach(function(mailObject) {
							   var newestEmailsResponse = initNewestEmails(mailObject);
						   });
					   });
					   
					   // add with inbox count
					   getMessagesResponse.fetchMessageIdsByLabelsResponse.httpBodies.some(function(httpBody) {
						   //if ((httpBody.monitoredLabel == SYSTEM_INBOX && that.getSetting("openLinksToInboxByGmail")) || httpBody.monitoredLabel == SYSTEM_PRIMARY) {
						   if (isMainCategory(httpBody.monitoredLabel)) {
							   //mailArray if (mailArray.length < that.unreadCount || mailArray.length < MAX_EMAILS_TO_FETCH) {
							   
							   that.unreadCount += httpBody.resultSizeEstimate;
							   
							   if (newestMailArray.length < that.unreadCount && that.unreadCount < MAX_EMAILS_TO_FETCH) {
								   that.unreadCount = newestMailArray.length;
							   }
							   
							   //return true;
						   }
					   });

				   } else {
					   // no unread messages
					   console.log("no unread messages");
				   }
			   });
		   }).then(function() {
			   syncMailArray();
			   historyId = currentHistoryId;
			   resolve(newestMailArray);
		   }).catch(function(errorResponse) {
			   console.error(errorResponse);
			   reject(errorResponse);
		   });
	   });
   }
   
   function getMailArrayIndexByThreadId(threadId) {
	   for (var a=0; a<mailArray.length; a++) {
		   if (mailArray[a].threadId == threadId) {
			   return a;
		   }
	   }
	   return -1;
   }

   function getMailArrayIndexByMessageId(messageId) {
	   for (var a=0; a<mailArray.length; a++) {
		   if (mailArray[a].id == messageId) {
			   return a;
		   }
	   }
	   return -1;
   }
   
   function getMessagesByHistory(params) {
	   return new Promise(function(resolve, reject) {
		   getHistory(params).then(function(historyResponse) {
			   // if exists history[] then we've had changes since the last historyid - so let's fetch emails
			   if (historyResponse.history) {
				   console.log("history exists");
				   params.histories = params.histories.concat(historyResponse.history);
	
				   // Too many histories so let's just resync
				   if (historyResponse.nextPageToken) {
					   console.log("next page");
					   params.nextPageToken = historyResponse.nextPageToken;
					   if (!params.nextPageTokenCount) {
						   params.nextPageTokenCount = 0;
					   }
					   if (++params.nextPageTokenCount >= MAX_HISTORY_NEXT) {
						   historyResponse.jreason = JError.TOO_MANY_HISTORIES;
						   reject(historyResponse);
					   } else {
						   return getMessagesByHistory(params);
					   }
				   } else {
					   resolve(historyResponse);
				   }
			   } else { // no changes
				   console.log("no changes");
				   resolve(historyResponse);
			   }
		   }).then(function(historyResponse) {
			   // done
			   resolve(historyResponse);
		   }).catch(function(errorResponse) {
			   reject(errorResponse);
		   });
	   });
   }
   
   function getMessages(labels, processMessages) {
	   return new Promise(function(resolve, reject) {
		   fetchMessageIdsByLabels(labels).then(function(fetchMessageIdsByLabelsResponse) {
			   console.log("fetchMessageIdsByLabelsResponse", fetchMessageIdsByLabelsResponse);
			   // detect if any messages found
			   var messagesFound = fetchMessageIdsByLabelsResponse.httpBodies.some(function(httpBody) {
				   if (httpBody.messages && httpBody.messages.length) {
					   return true;
				   }
			   });
			   if (messagesFound) {
				   fetchMessagesByLabels(fetchMessageIdsByLabelsResponse).then(function(fetchMessagesByLabelsResponse) {
					   processMessages({fetchMessageIdsByLabelsResponse:fetchMessageIdsByLabelsResponse, fetchMessagesByLabelsResponse:fetchMessagesByLabelsResponse});
					   resolve();
				   }).catch(function(errorResponse) {
					   reject(errorResponse);
				   });
			   } else {
				   // should still execute processMessages
				   processMessages({fetchMessageIdsByLabelsResponse:fetchMessageIdsByLabelsResponse, labelsWithoutMessages:labels});
				   resolve();
			   }
		   }).catch(function(errorResponse) {
			   reject(errorResponse);
		   });
	   });
   }
   
   function generateFetchMessagesByIdsParams(params) {
	   var oauthEmailAlreadyFoundInADifferentLabelFetch = 0;
	   var messages = [];
	   params.httpMessages.forEach(function(httpMessage) {
		   if (params.allLabelsMessageIdsToFetch && params.allLabelsMessageIdsToFetch.indexOf(httpMessage.id) != -1) {
			   console.log("skip this message because already queued from another label: " + httpMessage.id);
			   oauthEmailAlreadyFoundInADifferentLabelFetch++;
		   } else {
			   var message = {id: httpMessage.id, monitoredLabel:httpMessage.monitoredLabel};
			   messages.push(message);
			   params.allLabelsMessageIdsToFetch.push(httpMessage.id);
		   }
	   });
	   
	   return {messages:messages, oauthEmailAlreadyFoundInADifferentLabelFetch:oauthEmailAlreadyFoundInADifferentLabelFetch};
   }
   
   function fetchMessagesByLabels(fetchMessageIdsByLabelsResponse) {
	   return new Promise(function(resolve, reject) {
		   var fetchMessagesByIdsPromises = [];
		   var errors = [];

		   var allLabelsMessageIdsToFetch = [];
		   var oauthEmailAlreadyFoundInADifferentLabelFetch = 0;

		   fetchMessageIdsByLabelsResponse.httpBodies.forEach(function(httpBody) {
			   if (httpBody.error) {
				   errors.push(httpBody);
			   } else if (httpBody.messages) {
				   
				   httpBody.messages.forEach(function(httpMessage) {
					   httpMessage.monitoredLabel = httpBody.monitoredLabel;
				   });
				   
				   var fetchMessagesByIdsParams = generateFetchMessagesByIdsParams({httpMessages:httpBody.messages, allLabelsMessageIdsToFetch:allLabelsMessageIdsToFetch});
				   // must append this int variable outside of function because it's not passed by reference (but the array allLabelMessages... is)
				   oauthEmailAlreadyFoundInADifferentLabelFetch += fetchMessagesByIdsParams.oauthEmailAlreadyFoundInADifferentLabelFetch;

				   if (fetchMessagesByIdsParams.messages.length) {
					   var fetchMessagesByIdsPromise = fetchMessagesByIds(fetchMessagesByIdsParams.messages);
					   fetchMessagesByIdsPromises.push(fetchMessagesByIdsPromise);
				   }
			   }
		   });
		   
		   Promise.all(fetchMessagesByIdsPromises).then(function(fetchMessagesByIdsPromisesResponses) {
			   if (errors.length) {
				   console.error("found some errors[]", errors);
				   reject(errors);
			   } else {
				   resolve({responses:fetchMessagesByIdsPromisesResponses, oauthEmailAlreadyFoundInADifferentLabelFetch:oauthEmailAlreadyFoundInADifferentLabelFetch});
			   }
		   }).catch(function(errorResponse) {
			   console.error("PromiseAll errors", errorResponse);
			   reject(errorResponse);
		   });
	   });
   }
   
   function createMailObjects(params) {
	   var mailObjects = [];
	   var totalMessagesThatWereGrouped = 0;
	   var errors = [];
	   params.httpBodies.forEach(function(httpBody) {

		   // might be permanently deleted
		   if (httpBody.jerror == JError.NOT_FOUND) { //if (httpBody.error && httpBody.error.code == 404) { // message == Not Found  (might have been permanently deleted)
			   // just push error object into array and continue loop
			   var mailObject = new MailObject();
			   mailObject.account = that;
			   mailObject.labels = [];
			   mailObject.messages = [];
			   mailObject.jerror = httpBody.jerror;
			   mailObjects.push(mailObject);
			   return;
		   } else if (httpBody.error) {
			   console.error("in createmailbojects, this body has this error: " + httpBody.error.message);
			   return;
		   }
		   
		   var headers = httpBody.payload.headers;
		   
		   if (that.getSetting("conversationView")) {
			   // group emails by threadid
			    var threadFound = mailObjects.some(function(existingMailObject) {
			    	console.log("find thread", existingMailObject.threadId + " " + httpBody.threadId)
				   if (existingMailObject.threadId == httpBody.threadId) {
					   var message = generateMessageFromHttpResponseMessage(existingMailObject, httpBody);
					   // add to beginning of array
					   existingMailObject.messages.unshift(message);
					   totalMessagesThatWereGrouped++;
					   return true;
				   }
			   });
			   
			   if (threadFound) {
				   // continue the "batchResponse.httpResponses.forEach" above
				   return;
			   }
		   }
		   
		   var subject = cleanEmailSubject(MyGAPIClient.getHeaderValue(headers, "Subject"));
		   console.log("subject: " + subject);
		   if (!subject) {
			   subject = "";
		   }

		   var summary = httpBody.snippet;
		   summary = filterEmailBody(subject, summary);
		   
		   var issued = getDateFromHttpResponseMessage(httpBody);
		   var from = MyGAPIClient.getHeaderValue(headers, "From");
		   
		   var authorName;
		   var authorMail;
		   
		   var addressObj = addressparser(from).first();
		   if (addressObj) {
			   authorName = addressObj.name;
			   authorMail = addressObj.email;
		   } else {
			   authorName = "";
			   authorMail = "";
			   logError("Problem with addressparser: " + from);
		   }
		   
		   authorMail = bg.html_sanitize(authorMail);
		   
		   var mailObject = new MailObject();
		   mailObject.account = that;
		   mailObject.id = httpBody.id;
		   mailObject.deliveredTo = MyGAPIClient.getAllHeaderValues(headers, "Delivered-To"); // Used to determine any "send mail as" alternate emails etc.
		   mailObject.replyTo = MyGAPIClient.getHeaderValue(headers, "Reply-To"); // might have alternate reply to email
		   mailObject.messageId = MyGAPIClient.getHeaderValue(headers, "Message-ID"); // Used for replying
		   mailObject.threadId = httpBody.threadId;
		   mailObject.title = subject;
		   mailObject.summary = summary;
		   mailObject.issued = issued;
		   mailObject.authorName = authorName;
		   mailObject.authorMail = authorMail; 
		   
		   if (httpBody.labelIds) {
			   mailObject.labels = httpBody.labelIds;
		   } else {
			   mailObject.labels = [];
		   }
		   
		   /*
		   if (params.monitoredLabel) {
			   mailObject.monitoredLabel = params.monitoredLabel;
		   } else {
			   // probably fetched via history so let's just tag the first monitoredlabel to it
			   mailObject.monitoredLabel = that.getFirstMonitoredLabel(httpBody.labelIds);
		   }
		   */
		   
		   if (httpBody.monitoredLabel) {
			   mailObject.monitoredLabel = httpBody.monitoredLabel;
		   } else {
			   // probably fetched via history so let's just tag the first monitoredlabel to it
			   mailObject.monitoredLabel = that.getFirstMonitoredLabel(httpBody.labelIds);
		   }
		   
		   mailObject.contributors = [];
		   
		   // init first conversation message, which is same as mailobject message
		   mailObject.messages = [];
		   var message = generateMessageFromHttpResponseMessage(mailObject, httpBody);
		   mailObject.messages.push(message);
		   
		   mailObjects.push(mailObject);
	   });
	   
	   mailObjects.forEach(function(mailObject) {
		   mailObject.sortMessages();
		   // Make sure last convesation date is synced with mailobject date/issue (issue doesn't have happen on extension load but it does upon detecting history changes)
		   var lastMessage = mailObject.messages.last();
		   if (lastMessage) {
			   mailObject.issued = lastMessage.date;
		   }
	   });
	   
	   return {mailObjects:mailObjects, totalMessagesThatWereGrouped:totalMessagesThatWereGrouped};
   }
   
   function fetchMessageIdsByLabels(monitoredLabels) {
	   console.log("fetchMessageIdsByLabels");

	   return new Promise(function(resolve, reject) {
		   var mygapiClient = getMyGAPIClient();

		   /*
		    	decided not to finish this code because usually sent emails are never unread! , but use this in the future if have to include sent emails in message history
		   		var monitoredLabelsAndSent = monitoredLabels.concat([GmailAPI.labels.SENT]);
		    	other notes...
		    	test conversation view disabled for sent emails
				that.unreadCount -= getMessagesResponse.fetchMessagesByLabelsResponse.oauthEmailAlreadyFoundInADifferentLabelFetch;
				if can't match threadid remove it because we don't want a loan sent email
				might have to sort sent email into messages list (not just append/prepend etc.)
		    */
		   
		   monitoredLabels.forEach(function(monitoredLabel) {
			   var path = GmailAPI.PATH + "messages?labelIds=" + GmailAPI.labels.UNREAD + "&maxResults=" + MAX_EMAILS_TO_FETCH;
			   if (monitoredLabel != SYSTEM_ALL_MAIL) {
				   path += "&labelIds=" + getGmailAPILabelId(monitoredLabel);
			   }

			   // if a primary category (primary, promots etc.) or important+inbox then let's ensure they are also labeled "inbox"
			   if (isMainCategory(monitoredLabel) || monitoredLabel == SYSTEM_IMPORTANT_IN_INBOX) {
				   path += "&labelIds=" + GmailAPI.labels.INBOX;
			   }

			   var httpRequest = mygapiClient.request({
				   path: path,
				   method: "GET"
			   });
			   mygapiClient.HttpBatch.add(httpRequest);
		   });

		   mygapiClient.HttpBatch.execute({oauthRequest:bg.oAuthForEmails, email:mailAddress}).then(function(batchResponse) {
			   // tag monitored label to httpbodies
			   batchResponse.httpBodies.forEach(function(httpBody, httpBodyIndex) {
				   httpBody.monitoredLabel = monitoredLabels[httpBodyIndex];
			   });
			   resolve({httpBodies:batchResponse.httpBodies});
		   }).catch(function(errorResponse) {
			   reject(errorResponse);
		   });
	   });
   }

   function fetchMessagesByIds(messages) {
	   console.log("fetchMessagesByIds", messages);
	   
	   return new Promise(function(resolve, reject) {
		   var mygapiClient = getMyGAPIClient();
		   
		   messages.forEach(function(message) {
			   console.log("messageid: " + message.id);
			   
			   var httpRequest = mygapiClient.request({
				   path: GmailAPI.PATH + "messages/" + message.id,
				   method: "GET"
			   });
			   mygapiClient.HttpBatch.add(httpRequest);
		   });

		   mygapiClient.HttpBatch.execute({oauthRequest:bg.oAuthForEmails, email:mailAddress}).then(function(batchResponse) {
			   // tag monitored label to httpbodies
			   batchResponse.httpBodies.forEach(function(httpBody, httpBodyIndex) {
				   httpBody.monitoredLabel = messages[httpBodyIndex].monitoredLabel;
			   });
			   
			   resolve({httpBodies:batchResponse.httpBodies});
		   }).catch(function(errorResponse) {
			   reject(errorResponse);
		   });
	   });
   }
   
   function processPart(part, message) {
	   if (part.mimeType == "text/plain") { // message/rfc822
		   message.textContent += decodeBase64UrlSafe(part.body.data);
		   
		   var MAX_CONTENT_LENGTH = 1000000;
		   
		   if (message.textContent && message.textContent.length > MAX_CONTENT_LENGTH) {
			   message.textContent = message.textContent.substr(0, MAX_CONTENT_LENGTH) + " ... (truncated by extension)";
		   }
		   
		   if (message.content == null) {
			   message.content = "";
		   }
	   } else if (part.mimeType == "text/html") {
		   if (part.body.data) {
			   message.content = decodeBase64UrlSafe(part.body.data);
			   
			   // Must keep content-id reference for inline images, so let's fool sanitizer to by prefixing it with "http://"
			   message.content = message.content.replace(/src=\"cid:/g, "src=\"" + FOOL_SANITIZER_CONTENT_ID_PREFIX);
			   message.content = message.content.replace(/src=\'cid:/g, "src=\'" + FOOL_SANITIZER_CONTENT_ID_PREFIX);
			   
			   message.content = bg.html_sanitize(message.content, bg.allowAllUrls, bg.rewriteIds);
			   // just remove img altogether
			   if (message.content) {
				   message.content = message.content.replace(/<img /g, "<imghidden ");
				   message.content = message.content.replace(/\/img>/g, "/imghidden>");
			   }
		   }
	   } else if (part.parts && part.parts.length) { // do this after searching text and html, part.mimeType == "multipart/mixed" || part.mimeType == "multipart/alternative" || part.mimeType == "multipart/related" || part.mimeType == "multipart/relative" || part.mimeType == "multipart/parallel" || part.mimeType == "multipart/multipart" || part.mimeType == "multipart/report" || part.mimeType == "multipart/signed"
		   part.parts.forEach(function(part) {
			   processPart(part, message);
		   });
	   } else if (part.mimeType && part.mimeType.indexOf("image/") != -1) { // this one appears with parent mimetype "multipart/multipart" like cra emails
		   message.files.push(part);
	   } else if (part.filename) {
		   message.files.push(part);
	   } else if (part.mimeType == "message/delivery-status" || part.mimeType == "message/rfc822") { // mail server errors: refer to email from my user: Yu ENOKIBORI
		   // ignore these because typically the text/plain also exists
	   //} else if (part.mimeType == "text/watch-html") {
		   // ignore this for Apple Watch display
	   } else if (part.mimeType == "application/octet-stream") {
		   if (!message.content) {
			   message.content = "";
		   }
		   message.content += " [File attached] But this extension could not process it. Use <a href='https://jasonsavard.com/forum/categories/checker-plus-for-gmail-feedback?ref=unknownMimeType'>Checker Plus forum</a> to help me with this issue.";
	   } else {
		   if (!message.textContent && !message.content) {
			   logError("must add logic for mimetype: " + part.mimeType, part);
			   message.content = "Error unknown mimetype: " + part.mimeType + " <br><br>Search or post this bug on the <a href='https://jasonsavard.com/forum/categories/checker-plus-for-gmail-feedback?ref=unknownMimeType'>Checker Plus forum</a>";
		   } else {
			   logError("must add logic for mimetype (but found other content): " + part.mimeType, part);
		   }
	   }
   }
   
   function generateMessageFromHttpResponseMessage(mail, httpResponseMessage) {
	   var headers = httpResponseMessage.payload.headers;
	   
	   var message = {};
	   
	   message.id = httpResponseMessage.id;
	   message.labels = httpResponseMessage.labelIds;
	   
	   message.to = [];
	   message.cc = [];
	   message.bcc = [];
	   
	   message.files = [];
	   
	   message.date = getDateFromHttpResponseMessage(httpResponseMessage);

	   var subject = MyGAPIClient.getHeaderValue(headers, "Subject");
	   
	   var from = MyGAPIClient.getHeaderValue(headers, "From");
	   message.from = addressparser(from).first();
	   
	   var to = MyGAPIClient.getHeaderValue(headers, "To");
	   message.to = addressparser(to);
	   var cc = MyGAPIClient.getHeaderValue(headers, "CC");
	   message.cc = addressparser(cc);
	   var bcc = MyGAPIClient.getHeaderValue(headers, "BCC");
	   message.bcc = addressparser(bcc);
	   
	   message.textContent = "";

	   processPart(httpResponseMessage.payload, message);
	   
	   // if no text content then use the html content
	   if (!message.textContent) {
		   if (message.content) {
			   message.textContent = message.content.htmlToText();
		   }
		   if (!message.textContent) {
			   message.textContent = "";
		   }
	   }
	   
	   // if no html content then use the text content
	   if (!message.content) {
		   if (message.textContent) {
			   message.content = convertPlainTextToInnerHtml(message.textContent);
			   message.content = bg.html_sanitize(message.content, bg.allowAllUrls, bg.rewriteIds);
		   }
		   if (!message.content) {
			   message.content = "";
		   }
	   }
	   
	   message.textContent = filterEmailBody(subject, message.textContent);
	   message.textContent = bg.html_sanitize(message.textContent);
	   
	   // must mimic everything here for the auto-detect method and vica versa
	   message.mail = mail;

	   return message;
   }
   
   function getDateFromHttpResponseMessage(httpResponseMessage) {
	   var headers = httpResponseMessage.payload.headers;

	   /*
	   var date = MyGAPIClient.getHeaderValue(headers, "Date");
	   if (date) {
		   date = new Date(date);
		   if (isNaN(date.getTime())) {
			   console.error("could not parse date: " + date);
			   date = new Date();
		   }
	   } else {
		   console.error("date header not found");
		   date = new Date();
	   }
	   return date;
	   */
	   
	   var date = new Date(parseInt(httpResponseMessage.internalDate));
	   return date;
   }
   
   function fetchUnreadCount(labelIds, fetchWithInboxCount) {
	   console.log("fetchUnreadCount");
	   
	   return new Promise(function(resolve, reject) {
		   var mygapiClient = getMyGAPIClient();
		   
		   labelIds.forEach(function(labelId) {
			   var path = null;
			   // exclude primary because we need to count primary+inbox labelled emails (not just primary) we fetch that unread count using the resultSizeEstimate later in the code
			   //if ((labelId == SYSTEM_INBOX && that.getSetting("openLinksToInboxByGmail")) || labelId == SYSTEM_PRIMARY) {
			   if (isMainCategory(labelId)) {
				   if (fetchWithInboxCount) {
					   if (that.getSetting("conversationView")) {
						   path = GmailAPI.PATH + "threads";
					   } else {
						   path = GmailAPI.PATH + "messages";
					   }
					   path += "?labelIds=" + GmailAPI.labels.UNREAD + "&labelIds=" + GmailAPI.labels.INBOX + "&labelIds=" + getGmailAPILabelId(labelId) + "&maxResults=1";
				   } else {
					   // no path here because we will fetch the resultSizeEstimate size later
				   }
			   } else {
				   path = GmailAPI.PATH + "labels/";
				   if (labelId == SYSTEM_ALL_MAIL) {
					   path += GmailAPI.labels.UNREAD;
				   } else {
					   path += getGmailAPILabelId(labelId);
				   }
			   }
			   
			   if (path) {
				   var httpRequest = mygapiClient.request({
					   method: "GET",
					   path: path
				   });
				   mygapiClient.HttpBatch.add(httpRequest);
			   }
		   });

		   mygapiClient.HttpBatch.execute({oauthRequest:bg.oAuthForEmails, email:mailAddress}).then(function(batchResponse) {
			   var unreadCount = 0;
			   batchResponse.httpBodies.forEach(function(httpBody) {
				   // when using messages.list API
				   if (typeof httpBody.resultSizeEstimate !== "undefined") {
					   unreadCount += httpBody.resultSizeEstimate;
				   } else {
					   if (that.getSetting("conversationView")) {
						   unreadCount += httpBody.threadsUnread;
					   } else {
						   unreadCount += httpBody.messagesUnread;
					   }
				   }
			   });
			   resolve(unreadCount);
		   }).catch(function(errorResponse) {
			   reject(errorResponse);
		   });
	   });
   }
   
   function getHistoryForFirstTime() {
	   return new Promise(function(resolve, reject) {
		   bg.oAuthForEmails.send({userEmail:mailAddress, url: GmailAPI.URL + "profile", noCache:true}).then(function(response) {
			   var data = JSON.parse(response.jqXHR.responseText);
			   resolve(data);
		   }).catch(function(error) {
			   reject(error);
		   });
	   });
   }
   
   function getHistory(params) {
	   console.log("getHistory");
	   return new Promise(function(resolve, reject) {
		   // Fetch the latest historyid by passing the history id of the last message. I'm only passing the labelid=inbox to minimize response data
		   var data = {labelId:GmailAPI.labels.UNREAD, startHistoryId:params.historyId, maxResults:MAX_EMAILS_HISTORIES, fields:"history(labelsAdded,labelsRemoved,messagesAdded,messagesDeleted),historyId,nextPageToken"};
		   if (params.nextPageToken) {
			   data.pageToken = params.nextPageToken;
		   }
		   var sendParams = {userEmail:mailAddress, url: GmailAPI.URL + "history", data:data, noCache:true};
		   if (!params.labelId || params.labelId == SYSTEM_ALL_MAIL) {
			   // do not send any label id params
		   } else {
			   sendParams.data.labelId = params.labelId;
		   }
		   bg.oAuthForEmails.send(sendParams).then(historyResponse => {
			   data = JSON.parse(historyResponse.jqXHR.responseText);
			   if (params.labelId) {
				   data.historyLabelId = params.labelId;
			   }
			   resolve(data);
		   }).catch(error => {
			   if (error.code == 404) {
				   error.jreason = JError.HISTORY_INVALID_OR_OUT_OF_DATE;
			   }
			   reject(error);
		   });
	   });
   }
   
   this.fetchAttachment = function(params) {
	   console.log("fetchAttachment");
	   return new Promise(function(resolve, reject) {
		   if (!params.noSizeLimit && params.size > FETCH_ATTACHMENT_MAX_SIZE) {
			   reject("Size too large");
			   return;
		   }
		   
		   var sendParams = {userEmail:mailAddress, url: GmailAPI.URL + "messages/" + params.messageId + "/attachments/" + params.attachmentId};
		   bg.oAuthForEmails.send(sendParams).then(historyResponse => {
			   response = JSON.parse(historyResponse.jqXHR.responseText);
			   // Because API returns base64 url safe strings
			   response.data = replaceBase64UrlSafeCharacters(response.data);
			   resolve(response);
		   }).catch(error => {
			   reject(error);
		   });
	   });
   }

   function executeGmailHttpAction(params) {
	   return new Promise(function(resolve, reject) {
		   var ajaxParams = {
			   url: that.getMailUrl({useBasicGmailUrl:true}) + Math.ceil(1000000 * Math.random()) + "/",
			   method: "POST"
		   }
		   
		   var COMMON_PARAMS = "?t=" + params.mail.id + "&at=" + gmailAT + "&";
		   var ACT_PARAM_NAME = "act=";
		   
		   if (params.action == MailAction.MARK_AS_READ) {
			   //ajaxParams.url += COMMON_PARAMS + ACT_PARAM_NAME + "rd";
			   ajaxParams.data = {at:gmailAT, t:params.mail.id, tact:"rd", nvp_tbu_go:"Go", bact:""};
		   } else if (params.action == MailAction.MARK_AS_UNREAD) {
			   //ajaxParams.url += COMMON_PARAMS + ACT_PARAM_NAME + "ur";
			   ajaxParams.data = {at:gmailAT, t:params.mail.id, tact:"ur", nvp_tbu_go:"Go", bact:""};
		   } else if (params.action == MailAction.DELETE) {
			   //ajaxParams.url += COMMON_PARAMS + ACT_PARAM_NAME + "tr";
			   ajaxParams.data = {at:gmailAT, t:params.mail.id, nvp_a_tr:"Delete", tact:"", bact:""};
		   } else if (params.action == MailAction.ARCHIVE) {
			   //ajaxParams.url += COMMON_PARAMS + ACT_PARAM_NAME + "arch";
			   ajaxParams.data = {at:gmailAT, t:params.mail.id, nvp_a_arch:"Archive", tact:"", bact:""};
		   } else if (params.action == MailAction.MARK_AS_SPAM) {
			   //ajaxParams.url += COMMON_PARAMS + ACT_PARAM_NAME + "sp";
			   ajaxParams.data = {at:gmailAT, t:params.mail.id, nvp_a_sp:"Report Spam", tact:"", bact:""};
		   } else if (params.action == MailAction.APPLY_LABEL) {
			   ajaxParams.url += COMMON_PARAMS + ACT_PARAM_NAME + "ac_" + encodeURIComponent(params.label);
		   } else if (params.action == MailAction.REMOVE_LABEL) {
			   if (params.label == SYSTEM_INBOX) {
				   params.action = MailAction.ARCHIVE;
				   executeGmailHttpAction(params).then((response) => {
					   resolve(response);
				   }).catch(error => {
					   reject(error); 
				   });
				   return;
			   } else {
				   ajaxParams.url += COMMON_PARAMS + ACT_PARAM_NAME + "rc_" + encodeURIComponent(params.label);
			   }
		   } else if (params.action == MailAction.UNTRASH) {
			   ajaxParams.url += COMMON_PARAMS + "s=t&nvp_a_ib=Move to Inbox"; // nvp_a_ib is required but could be set to any value apparently
		   } else if (params.action == MailAction.STAR) {
			   /*
		   	   if (params.mail.labels.first() == SYSTEM_INBOX) { //inbox usually
		   		   ajaxParams.url += COMMON_PARAMS + ACT_PARAM_NAME + "st";
		   	   } else {
		   		   ajaxParams.url += COMMON_PARAMS + "tact=st&nvp_tbu_go=Go&s=a";
			   }
			   */
			   ajaxParams.data = {at:gmailAT, t:params.mail.id, nvp_tbu_go:"Go", tact:"st", bact:""};
		   	   params.mail.labels.push(SYSTEM_STARRED);
		   } else if (params.action == MailAction.REMOVE_STAR) {
			   //ajaxParams.url += COMMON_PARAMS + "tact=xst&nvp_tbu_go=Go&s=a";
			   ajaxParams.data = {at:gmailAT, t:params.mail.id, nvp_tbu_go:"Go", tact:"xst", bact:""};
			   var index = params.mail.labels.indexOf(SYSTEM_STARRED);
			   if (index != -1) {
				   params.mail.labels.splice(index, 1);
			   }
		   } else if (params.action == MailAction.REPLY) {
			   if (params.replyAllFlag) {
				   var data = "";

				   function appendLine(str) {
					   data += str + "\n";
				   }
				   
				   var boundary = "----WebKitFormBoundarythAbRn0cGJ9FBoKg";
				   
				   appendLine("--" + boundary);
				   appendLine("Content-Disposition: form-data; name=\"redir\"");
				   appendLine("");
				   appendLine("?th=" + params.mail.id + "&v=c&s=l");
				   
				   appendLine("--" + boundary);
				   appendLine("Content-Disposition: form-data; name=\"at\"");
				   appendLine("");
				   appendLine(gmailAT);
				   
				   appendLine("--" + boundary);
				   appendLine("Content-Disposition: form-data; name=\"to\"");
				   appendLine("");
				   
				   var replyObj = params.mail.generateReplyObject(params);
				   var toStr = "";
				   if (replyObj) {
					   replyObj.tos.forEach(function(to, index) {
						   if (index != 0) {
							   toStr += ", ";
						   }
						   toStr += convertAddress(to, true);
					   });
				   } else {
					   toStr = convertAddress(params.to, true);
				   }
				   
				   appendLine(toStr);
				   
				   appendLine("--" + boundary);
				   appendLine("Content-Disposition: form-data; name=\"cc\"");
				   appendLine("");
				   
				   var ccStr = "";
				   if (replyObj && replyObj.ccs && replyObj.ccs.length) {
					   replyObj.ccs.forEach(function(cc, index) {
						   if (index != 0) {
							   ccStr += ", ";
						   }
						   ccStr += convertAddress(cc, true);
					   });
				   }
				   
				   appendLine(ccStr);

				   appendLine("--" + boundary);
				   appendLine("Content-Disposition: form-data; name=\"bcc\"");
				   appendLine("");
				   appendLine("");

				   appendLine("--" + boundary);
				   appendLine("Content-Disposition: form-data; name=\"file0\"; filename=\"\"");
				   appendLine("Content-Type: application/octet-stream");
				   appendLine("");
				   appendLine("");

				   appendLine("--" + boundary);
				   appendLine("Content-Disposition: form-data; name=\"subject\"");
				   appendLine("");
				   appendLine(params.mail.title);
				   
				   appendLine("--" + boundary);
				   appendLine("Content-Disposition: form-data; name=\"body\"");
				   appendLine("");
				   appendLine(params.message);
				   appendLine("");
				   appendLine("> " + params.mail.getLastMessageText());

				   appendLine("--" + boundary);
				   appendLine("Content-Disposition: form-data; name=\"nvp_bu_send\"");
				   appendLine("");
				   appendLine("Send");

				   appendLine("--" + boundary + "--");
				   

				   ajaxParams.contentType = "multipart/form-data; boundary=" + boundary;
				   ajaxParams.url += "?fv=b&cs=c&pv=cv&th=" + params.mail.id + "&rm=" + params.mail.id + "&cpt=r&v=b&s=l";
				   ajaxParams.processData = false;
				   ajaxParams.data = data;
			   } else {
				   // when replying to emails with no inbox label ie. just Apps label, then we need to add s=l and also encoded s=l insie last param redir= 
				   ajaxParams.url += COMMON_PARAMS + "v=b&qrt=n&pv=cv&s=l&fv=cv&cs=qfnq&rm=" + params.mail.id + "&th=" + params.mail.id + "&qrr=" + "o" + "&body=" + encodeURIComponent(params.message) + "&nvp_bu_send=Send&haot=qt&redir=" + encodeURIComponent("?v=c&s=l");
			   }
		   } else {
			   reject("action not found: " + params.action);
		   }
		   
		   console.log("ajaxParams", ajaxParams);
		   $.ajax(ajaxParams).done(function(data, textStatus, jqXHR) {
			   if (params.action == MailAction.REPLY) {
				   console.log("reply response: ", data);
				   if (data && (data.indexOf("#FAD163") != -1 || data.toLowerCase().indexOf("your message has been sent") != -1)) {
					   resolve("success");
				   } else {
					   var error = "Send error: Could not confirm action";
					   //callback({error:error, sessionExpired:true});
					   reject(error);
				   }
			   } else {
				   // if no alert found non-english platform this might fail
				   // jun. 22 2015 seems it fails occasionally (used to blame it on session) but it returns data just not the alert message i think
				   // example response: <td bgcolor="#FAD163" role="alert">&nbsp;&nbsp;&nbsp;<b>The conversation has been marked read.</b>&nbsp;&nbsp;&nbsp;</td>
				   if (data && data.indexOf("No conversations selected.") == -1 && (data.indexOf("role=\"alert\"") != -1 || data.toLowerCase().indexOf("the conversation has been") != -1)) {
					   resolve();
				   } else {
					   var error = "Error: Could not confirm action: " + params.action;
					   logError(error);
					   if (data) {
						   logError("not confirm action data: " + data.substr(0, 100));
					   }
					   //createTab(SESSION_EXPIRED_ISSUE_URL);
					   //showCouldNotCompleteActionNotification();
					   //callback({error:error, sessionExpired:true});
					   reject(error);
				   }
			   }
		   }).fail(function(jqXHR, textStatus, errorThrown) {
			   var error = new Error(textStatus);
			   error.errorCode = jqXHR.status;
			   if (jqXHR) {
				   error.jqXHR = jqXHR;
			   }
			   reject(error);
		   });
		   
		   if (params.action == MailAction.DELETE || params.action == MailAction.MARK_AS_READ || params.action == MailAction.ARCHIVE) {
			   if (localStorage["_conversationView"] == "false" && !localStorage["_conversationViewWarningShown"]) {
				   createTab("https://jasonsavard.com/wiki/Conversation_View_issue");
				   localStorage["_conversationViewWarningShown"] = new Date();
			   }
		   }
	   });
   }
   
   function executeGmailAPIAction(params) {
	   return new Promise(function(resolve, reject) {
		   // save the quota by using messages vs threads depending on conversation view
		   var requestPath;
		   
		   // is request path overridden here?
		   if (params.requestPath) {
			   requestPath = params.requestPath;
		   } else {
			   var gmailAPIaction = params.gmailAPIaction;
			   // default action is modify
			   if (!gmailAPIaction) {
				   gmailAPIaction = "modify";
			   }
			   if (params.mail.account.getSetting("conversationView")) {
				   requestPath = "threads/" + params.mail.threadId + "/" + gmailAPIaction;
			   } else {
				   requestPath = "messages/" + params.mail.id + "/" + gmailAPIaction;
			   }
		   }
		   
		   var url;
		   var contentType;
		   
		   //if (params.attachment) {
			   //url = GmailAPI.UPLOAD_URL;
			   //contentType = "message/rfc822";
		   //} else {
			   url = GmailAPI.URL;
			   contentType = "application/json";
		   //}
		   url += requestPath;
		   
		   var sendParams = {userEmail:mailAddress, type:"POST", contentType:contentType, processData:false, url:url, timeout:params.timeout};
		   if (params.data) {
			   sendParams.data = JSON.stringify(params.data);
		   }
		   bg.oAuthForEmails.send(sendParams).then(response => {
			   data = JSON.parse(response.jqXHR.responseText);
			   console.log("execute history response", data);
			   resolve(data);
		   }).catch(error => {
			   reject(error); 
		   });		   
	   });
   }
   
   function executeMailAction(params) {
	   console.log("in executeMailAction", params);
	   
	   return new Promise(function(resolve, reject) {
		   if (Settings.read("accountAddingMethod") == "autoDetect") {

			   getGmailAT().then(function(gmailAT) {
				   return executeGmailHttpAction(params);
			   }).then(function(response) {
   				   that.getEmails().then(function() {
					   bg.mailUpdate(params);
					   resolve(response);
				   }).catch(function(error) {
					   reject(error);
				   });
			   }).catch(error => {
				   showCouldNotCompleteActionNotification(error, true);
				   console.error("executeGmailAPIAction: ", error);
				   reject(error);
			   });
		   } else { // oauth submit

			   var promise;
			   
			   if (params.action == MailAction.MARK_AS_READ) {
				   params.data = {removeLabelIds:[GmailAPI.labels.UNREAD]};
				   promise = executeGmailAPIAction(params);
			   } else if (params.action == MailAction.MARK_AS_UNREAD) {
				   params.data = {addLabelIds:[GmailAPI.labels.UNREAD]};
				   promise = executeGmailAPIAction(params);
			   } else if (params.action == MailAction.DELETE) {
				   params.gmailAPIaction = "trash";
				   return executeGmailAPIAction(params);
			   } else if (params.action == MailAction.UNTRASH) {
				   params.gmailAPIaction = "untrash";
				   promise = executeGmailAPIAction(params).then(function() {
					   // must also reapply "inbox" label
					   params.action = MailAction.APPLY_LABEL;
					   delete params.gmailAPIaction;
					   params.data = {addLabelIds:[GmailAPI.labels.INBOX]};
					   return executeGmailAPIAction(params);
				   });
			   } else if (params.action == MailAction.ARCHIVE) {
				   params.data = {removeLabelIds:[GmailAPI.labels.INBOX]};
				   promise = executeGmailAPIAction(params);
			   } else if (params.action == MailAction.MARK_AS_SPAM) {
				   params.data = {addLabelIds:[GmailAPI.labels.SPAM]};
				   promise = executeGmailAPIAction(params);
			   } else if (params.action == MailAction.APPLY_LABEL) {
				   params.data = {addLabelIds:[params.label]};
				   promise = executeGmailAPIAction(params).then(function(executeResponseParams) {
					   params.mail.labels.push(params.label);
					   return Promise.resolve(executeResponseParams);
				   });
			   } else if (params.action == MailAction.REMOVE_LABEL) {
				   params.data = {removeLabelIds:[params.label]};
				   promise = executeGmailAPIAction(params).then(function(executeResponseParams) {
					   var foundIndex = params.mail.labels.indexOf(params.label);
					   params.mail.labels.splice(foundIndex, 1);
					   return Promise.resolve(executeResponseParams);
				   });
			   } else if (params.action == MailAction.STAR) {
				   params.data = {addLabelIds:[GmailAPI.labels.STARRED]};
				   promise = executeGmailAPIAction(params).then(function() {
					   params.mail.labels.push(GmailAPI.labels.STARRED);
					   return Promise.resolve();
				   });
			   } else if (params.action == MailAction.REMOVE_STAR) {
				   params.data = {removeLabelIds:[GmailAPI.labels.STARRED]};
				   promise = executeGmailAPIAction(params).then(function() {
					   var index = params.mail.labels.indexOf(GmailAPI.labels.STARRED);
					   if (index != -1) {
						   params.mail.labels.splice(index, 1);
					   }
					   return Promise.resolve();
				   });
			   } else if (params.action == MailAction.SEND_EMAIL) {
				   params = generateExecuteGmailAPIActionParams(params);
				   params.timeout = minutes(2);
				   promise = executeGmailAPIAction(params);
			   } else if (params.action == MailAction.REPLY) {
				   params = generateExecuteGmailAPIActionParams(params);
				   params.timeout = minutes(2);
				   promise = executeGmailAPIAction(params);
			   } else {
				   var error = "action not found: " + params.action;
				   logError(error);
				   promise = Promise.reject(error);
			   }
			   
			   promise.then(function(response) {
				   // let's save some quota and not call .getEmails
				   var removedEmail;
				   
				   if (params.action == MailAction.MARK_AS_READ || params.action == MailAction.DELETE || params.action == MailAction.ARCHIVE || params.action == MailAction.MARK_AS_SPAM || (params.action == MailAction.REMOVE_LABEL && params.mail && params.mail.monitoredLabel == params.label)) {
					   if (that.removeMail(params.mail.id)) {
						   removedEmail = true;
						   --that.unreadCount; // account specific (not the global bg.unreadCount)
						   console.log("removemail unreadcount: " + that.unreadCount);
					   }
				   }
				   
				   if (removedEmail && !params.instantlyUpdatedCount) {
					   // use bg.unreadCount because that is the global unreadcount (as opposed to just unreadCount which is local to this mailAccount)
					   var newBadgeCount = bg.unreadCount - 1;
					   console.log("updatebadge: " + newBadgeCount);
					   updateBadge(newBadgeCount);
				   }
				   
				   resolve(response);
			   }).catch(function(error) {
				   showCouldNotCompleteActionNotification(error.toString());
				   console.error("executeGmailAPIAction: " + error);
				   reject(error);
			   })
		   }
	   });
   }
   
   this.testGmailAT = function(force) {
	   return getGmailAT(force);
   }
   
   // acts as a singleton so that it can handle multiple calls
   function getGmailAT(force) {
	   if (!gmailATProcessing || force) {
		   gmailATProcessing = true;
		   getGmailAtPromise = new Promise(function(resolve, reject) {
			   
			   // every 5 minutes
			   if (!gmailAT || lastGmailATFetch.diffInMinutes() <= -5 || force) {
				   
				   fetchGmailAT1().then(function(response) {
					   gmailAT = response;
					   lastGmailATFetch = new Date();
					   console.log("get at: " + gmailAT);
					   resolve(response);
				   }).catch(function(error) {
					   logError(error);
					   fetchGmailAT2().then(function(response) {
						   gmailAT = response;
						   lastGmailATFetch = new Date();
						   console.log("get at2: " + gmailAT);
						   resolve(response);
					   }).catch(function(error) {
						   logError(error);
						   reject(error);
					   });
				   });
				   
			   } else {
				   resolve(gmailAT);
			   }
			   
		   });
	        
		   getGmailAtPromise.then(function() {
			   gmailATProcessing = false;
		   }).catch(function() {
			   gmailATProcessing = false;
		   });
	   }
	   return getGmailAtPromise;
   }

   function fetchGmailAT1() {
	   return new Promise(function(resolve, reject) {
		   var url = that.getMailUrl({useBasicGmailUrl:true}) + Math.ceil(1000000 * Math.random());
		   var fetchPromise = Promise.resolve($.ajax(url));
		   
		   fetchPromise.then(function(data) {
			   // must keep the \b because some emails had content like ... format=123  and the at=123 was matched!
			   var matches = data.match(/\bat\=([^\"\&]*)/); //  new one:   /at\=([^\"\&]*)/     old one: /\at=([^"&]+)/
			   if (matches && matches.length) { // sample at: AF6bupND7QvFVgjkbg_PAWf7jUnB-zQFTQ   xF6bupMdRlq_g8bP0qwnUMLHR3_PwMA7PA  xF6bupMQ3nNhcKWmba7nVIHX8Am4WaH_qQ  
				   var foundAT;
				   for (var a=1; a<matches.length; a++) {
					   // if between 20 and 50 characters then say it's valid and don't match any html like ... 0</font></span></a></td><td nowrap>Apr OR 0%3C/font%3E%3C/span%3E%3C/a%3E%3C/td%3E%3Ctd%20nowrap%3EApr
					   if (matches[a].length >= 20 && matches[a].length <= 50 && matches[a].indexOf("<") == -1 && matches[a].indexOf(">") == -1 && matches[a].indexOf("/") == -1 && matches[a].indexOf(" ") == -1) {
						   foundAT = matches[a];
						   break;
					   }
				   }
				   if (foundAT) {
					   resolve(foundAT);
				   } else {
					   reject("gmail at error, no valid AT found");
				   }
			   } else {
				   reject("gmail at error parsing");
			   }
		   }).catch(function(response) {
			   reject("gmail AT error: " + response.status);
		   });
	   });
   }

   function fetchGmailAT2() {
	   return new Promise(function(resolve, reject) {
		   var url = that.getMailUrl();
		   var fetchPromise = Promise.resolve($.ajax(url));
		   
		   fetchPromise.then(function(data) {
			   var tmp = /GM_ACTION_TOKEN\=\"([^\"]*)\"/.exec(data);
			   if (tmp && tmp.length >= 2) {
				   resolve(tmp[1]);
			   } else {
				   reject("gmail at error2 parsing");
			   }
		   }).catch(function(response) {
		       reject("gmail at error2: " + response.status);
		   });
	   });
   }
      
   function generateExecuteGmailAPIActionParams(params) {
	   var account;
	   if (params.account) {
		   account = params.account;
	   } else if (params.mail) {
		   account = params.mail.account;
	   }
	   
	   var replyObj;
	   
	   if (params.action == MailAction.REPLY) {
		   replyObj = params.mail.generateReplyObject(params);
		   console.log("replyobj in generaetexec", replyObj);
	   }

	   var mimeMessage = "";
	   
	   mimeMessage += "MIME-Version: 1.0" + "\n";
	   
	   if (params.action == MailAction.REPLY) {
		   mimeMessage += "In-Reply-To: " + params.mail.messageId + "\n";
		   mimeMessage += "References: " + params.mail.messageId + "\n";
	   }
	   
	   var fromObj = {};
	   
	   var fromEmail;
	   // if from found might have been from a "send mail as" email address
	   if (replyObj && replyObj.from) {
		   fromObj = replyObj.from;
	   } else {
		   fromObj.email = that.getAddress();
	   }
	   
	   // commented because users had "private" aliases they did not want showing in from
	   //fromObj.name = that.getSetting("alias");
	   if (account) {
		   var profileInfo = account.getSetting("profileInfo");
		   if (profileInfo) {
			   fromObj.name = profileInfo.displayName;
		   }
	   }
	   
	   // test
	   //fromObj.name = "hello - dude";
	   //fromObj.email = "richiefarret@gmail.com";
	   
	   mimeMessage += "From: " + convertAddress(fromObj) + "\n";
	   
	   var tos = [];
	   if (replyObj) {
		   tos = replyObj.tos;
	   } else if (params.tos) {
		   tos = params.tos;
	   } else {
		   tos = [params.to];
	   }
	   
	   var toStr = "";
	   tos.forEach(function(to, index) {
		   if (index != 0) {
			   toStr += ", ";
		   }
		   toStr += convertAddress(to);
	   });
	   
	   //toStr = convertAddress({name:"Lord, Elgin", email:"richiefarret@gmail.com"});
	   console.info("to: " + toStr);
	   mimeMessage += "To: " + toStr + "\n";
	   //mimeMessage += 'To: Lord Melissa <richiefarret@gmail.com>' + '\n';

	   var ccs = [];
	   if (replyObj && replyObj.ccs && replyObj.ccs.length) {
		   ccs = replyObj.ccs;
	   } else if (params.ccs) {
		   ccs = params.ccs;
	   } else if (params.cc) {
		   ccs = [params.cc];
	   }

	   if (ccs.length) {
		   var ccStr = "";
		   ccs.forEach(function(cc, index) {
			   if (index != 0) {
				   ccStr += ", ";
			   }
			   ccStr += convertAddress(cc);
		   });
		   mimeMessage += "Cc: " + ccStr + "\n";
	   }

	   var subject;
	   if (params.action == MailAction.REPLY) {
		   subject = params.mail.title;
	   } else {
		   subject = params.subject;
	   }
	   
	   //mimeMessage += "Subject: " + subject + "\n";
	   //mimeMessage += "Content-type: text/html; charset=UTF-8" + "\n";
	   //mimeMessage += "Content-Transfer-Encoding: 8bit" + "\n";
	   //subject = "=?iso-8859-1?Q?=D0=9D=D1=8B=D0=BA =D0=B0=D0=BD =D0=BC=D1=8E=D0=BD=D0=B4=D0=B9 =D0=BA=D0=BE==D0=BD=D0=B2=D1=8B=D0=BD=D1=91=D1=80=D1=8B";
	   //subject = "=?UTF-8?B?PT91dGYtOD9CP1IyeGxaWG9nUTAxVElDMGcw?=";
	   //subject = "=?UTF-8?Q?a=C3=A9riennes?=";
	   // "Уже пожертвовали?"
	   if (subject) {
		   //subject = escapeToMime(subject, "quoted-printable", "UTF8");
		   subject = mimelib.mimeFunctions.encodeMimeWords(subject, "Q");
	   } else {
		   subject = "";
	   }
	   mimeMessage += "Subject: " + subject + "\r\n";
	   
	   /*
	    * Gmail API nuances
	    * I used to send text/plain and text/html but the Gmail API would overwrite/derive the text/plain part from the text/html with it's own logic
	    * Can't attachments + send text/plain together or else only text/plain would go through
	    */
	   if (!params.message && !params.htmlMessage && !params.attachment) {
		   // send nothing!
	   } else if (params.message && !params.htmlMessage && !params.attachment) {
		   mimeMessage += "\n";
		   mimeMessage += params.message;
	   } else {
		   var BOUNDARY = "c4d5d00c4725d9ed0b3c8b";
		   mimeMessage += "Content-Type: multipart/related; boundary=" + BOUNDARY + "\n";
		   mimeMessage += "\n";
		   mimeMessage += "--" + BOUNDARY + "\n";
		   mimeMessage += "Content-Type: text/html;charset=utf-8" + "\n";
		   mimeMessage += "\n";
		   mimeMessage += params.htmlMessage;
		   mimeMessage += "\n\n";
		   
		   if (params.attachment) {
			   mimeMessage += "--" + BOUNDARY + "\n";
			   mimeMessage += "Content-Type: " + params.attachment.contentType + "\n";
			   mimeMessage += "Content-Disposition: attachment; filename=" + params.attachment.filename + "\n";
			   mimeMessage += "Content-Length: " + params.attachment.data.length + "\n";
			   if (params.attachment.duration) {
				   mimeMessage += "X-Content-Duration: " + params.attachment.duration + "\n";
			   }
			   mimeMessage += "Content-Transfer-Encoding: base64" + "\n";
			   mimeMessage += "\n";
			   mimeMessage += params.attachment.data;
		   }
		   mimeMessage += "--" + BOUNDARY + "--" + "\n";		   
	   }
	   
	   params.requestPath = "messages/send"; // ?uploadType=multipart 
	   
	   params.data = {};
	   params.data.raw = encodeBase64UrlSafe(mimeMessage);
	   if (params.action == MailAction.REPLY) {
		   params.data.threadId = params.mail.threadId;
	   }
	   return params;
   }

   // Opens the inbox
   this.openInbox = function(params) {
	   console.log("openinbox");
	   params = initUndefinedObject(params);

	   params.label = that.getOpenLabel();
	   params.useGmailUI = true;
	   	
	   if (params.openInNewTab) {
		   var newURL = that.getMailUrl(params);
		   createTab(newURL);
	   } else {
		   that.findOrOpenGmailTab(params);
	   }
   }
   
   this.openLabel = function(label) {
	   that.findOrOpenGmailTab({label:label});
   }
   
   this.openSearch = function(searchStr, params) {
	   params = initUndefinedObject(params);
	   
	   params.label = "search";
	   params.searchStr = searchStr;
	   //params.detectInboxByGmail = false;
	   that.findOrOpenGmailTab(params);
   }
   
   this.openMessageById = function(params) {
	   if (!params.label) {
		   params.label = SYSTEM_ALL_MAIL;
	   }
	   
	   that.findOrOpenGmailTab(params);
   }
   
   function loadMailInGmailTab(params, callback) {
	   // focus window
	   chrome.windows.update(params.tab.windowId, {focused:true}, function() {
		   
		   // focus/update tab
		   var newURL = params.account.getMailUrl(params);
		   
		   // if same url then don't pass url parameter or else chrome will reload the tab
		   if (params.tab.url == newURL) {
			   chrome.tabs.update(params.tab.id, {active:true}, callback);
		   } else {
			   chrome.tabs.update(params.tab.id, {active:true, url:newURL}, callback);

			   // patch for issue when your newly composing an email, it seems if you navigate away Gmail with change the url back #compose after this initial change, so we have to change it twice with a delay
			   if (params.tab.url.endsWith("#compose")) {
				   setTimeout(function() {
					   chrome.tabs.update(params.tab.id, {active:true, url:newURL}, callback);
				   }, 3000);
			   }
		   }
		   
	   });
   }
   
   this.findOrOpenGmailTab = function(params) {
	   // unless overridden, then set default to true
	   if (params.detectInboxByGmail !== false) {
		   params.detectInboxByGmail = true;
	   }
	   params.useGmailUI = true;
	   
	   var mailUrl = that.getMailUrl(params);

	   var domainAndPath;
	   var multiAccountPath;
	   var firstMultiAccountPath;
	   
	   if (that.getSetting("openLinksToInboxByGmail")) {
		   domainAndPath = INBOX_BY_GMAIL_DOMAIN_AND_PATH;
		   multiAccountPath = "/u/";
		   firstMultiAccountPath = "/u/0";
	   } else {
		   domainAndPath = MAIL_DOMAIN_AND_PATH;
		   multiAccountPath = "/mail(/ca)?/u/";
		   firstMultiAccountPath = "/mail/u/0";
	   }
	   
	   // get all gmail windows
	   chrome.tabs.query({url:domainAndPath + "*"}, function(tabs) {
		   
		   var defaultMailURLTab;
		   var exactMailURLTab;

		   $.each(tabs, function(index, tab) {
			   // apparently a launching Gmail in Chrome application shortcut is windowType = "popup" ???		   
			   if (!tab.url.match(multiAccountPath)) {
				   // no account # appended so could be the default url /mail/ (ie. NOT /mail/u/0/ etc..
				   defaultMailURLTab = tab;
				   params.account = getAccountById(0);
			   } else if (tab.url.match(multiAccountPath + that.id)) {
				   exactMailURLTab = tab;
				   params.account = getAccountById(that.id);
				   return false;
			   }
		   });
		   
		   // if 1st account then look for default url just /mail/ and not /mail/u/0/
		   if (mailUrl.indexOf(firstMultiAccountPath) != -1 && defaultMailURLTab) {
			   params.tab = defaultMailURLTab;
			   loadMailInGmailTab(params);
		   } else if (exactMailURLTab) {
			   params.tab = exactMailURLTab;
			   loadMailInGmailTab(params);
		   } else {
			   if (params.noMatchingTabFunction) {
				   params.noMatchingTabFunction(mailUrl);
			   } else {
				   createTab(mailUrl);
			   }
		   }
		   
	   });
	   
	   if (params.mail && !that.getSetting("openLinksToInboxByGmail")) {
		   params.mail.markAsRead().then(function() {
			   that.getEmails().then(function() {
				   bg.mailUpdate();
			   });
		   });
	   }
	   
   }

   // Fetches content of thread
   function fetchThread(params) {
	   return new Promise(function(resolve, reject) {
		   var mail = params.mail;
		   
		   console.log("fetchthread: " + mail.title);
		   
		   var url = that.getMailUrl({useBasicGmailUrl:true}).replace('http:', 'https:') + Math.ceil(1000000 * Math.random()) + "/?v=pt&th=" + mail.id;
		   
		   var jqxhr = $.ajax({
			   type: "GET",
			   timeout: requestTimeout,
			   url: url,
			   xhr: function() {
				   var xhr = new window.XMLHttpRequest();
				   xhr.onreadystatechange = function(data) {
					   if (xhr.readyState == 4) {
						   // save responseURL onto jqxhr object 
						   jqxhr.responseURL = xhr.responseURL;
					   }
				   };
			       return xhr;
			   },
			   complete: function(jqXHR, textStatus) {
				   
				   console.log("complete", jqXHR, textStatus);
	
				   if (textStatus == "success") {
					   
					   mail.messages = [];
	
					   // patch 101 to not load any images because apparently $("<img src='abc.gif'");  will load the image even if not displayed
					   var responseText = jqXHR.responseText;
					   
					   // Gmail question patch
					   if (testGmailQuestion || (jqXHR.responseURL && jqXHR.responseURL.indexOf("v=lui") != -1)) {
						   testGmailQuestion = false;
						   console.log("Detected HTML Gmail question");
						   if (params.secondAttempt) {
							   reject("second attempt failed: " + textStatus);
						   } else {
							   console.log("second attempt");
							   params.secondAttempt = true;
							   
							   var matches = responseText.match(/action\=\"([^\"\&]*)/);
							   var actionUrl = matches[1];
							   
							   matches = responseText.match(/value\=\"([^\"\&]*)/);
							   thisGmailAT = matches[1];
							   
							   $.ajax({
								   type: "POST",
								   url: actionUrl,
								   data: "at=" + thisGmailAT,
								   complete: function(jqXHR, textStatus) {
									   if (textStatus == "success") {
										   fetchThread(params).then(function(response) {
											   resolve(response);
										   }).catch(function(error) {
											   reject("failed inner fetchThread");
										   });
									   } else {
										   reject("failed to post to html Gmail version: " + textStatus);
									   }
								   }
							   });
						   }
					   } else {
						   if (!params.forceDisplayImages) {
							   // just remove img altogether
							   if (responseText) {
								   responseText = responseText.replace(/<img /g, "<imghidden ");
								   responseText = responseText.replace(/\/img>/g, "/imghidden>");
							   }
						   }
						   
						   // need to add wrapper so that this jquery call workes "> table" ???
						   // patch for error "Code generation from strings disallowed for this context"
						   // the error would occur if I use jQuery's .append but not!!! if I initially set the content with $()
						   var $responseWrapper = $("<div id='$responseWrapper'>" + responseText + "</div>");
		
						   // before google changed print page layout
						   var $tables = $responseWrapper.find("> table");
						   if ($tables.length) {
							   $tables = $tables.splice(0, 1);
						   } else {
							   // new layout
							   $tables = $responseWrapper.find(".maincontent .message");
						   }
						   
						   if ($tables.length && $tables.each) {
							   $tables.each(function(i) {
								   
								   var message = {};
								   message.to = [];
								   message.cc = [];
								   message.bcc = [];
								   
								   var $messageNode = $(this);
								   
								   // get from via by parsing this string:  John Poon <blah@hotmail.com>
								   var from = $messageNode.find("tr:eq(0)").find("td").first().text();
								   message.from = addressparser(from).first();
		
								   // get date from first line ex. Chloe De Smet Allègre via LinkedIn <member@linkedin.com>	 Sun, Jan 8, 2012 at 12:14 PM
								   message.dateStr = $.trim( $messageNode.find("tr:first").find("td").last().text() );
								   if (message.dateStr) {
									   message.date = parseGoogleDate(message.dateStr); // "Thu, Mar 8, 2012 at 12:58 AM";
								   }
		
								   // get to/CC
								   var $toCCHTML = $messageNode.find("tr:eq(1)").find("td");
		
								   var divs = $toCCHTML.find("div");							   
								   divs.each(function(i) {
		
									   // if 2 divs the first line is usually the reply-to line so ignore it
									   if (i == 0 && divs.length >= 2 && divs.eq(1).text().toLowerCase().indexOf("cc:") == -1) {
										   return true;
									   }
									   // remove to:, cc: etc...
									   var emails = $(this).text();
									   emails = emails.replace(/.*:/, "");
									   
									   if ($(this).text().toLowerCase().indexOf("bcc:") != -1) {
										   message.bcc = addressparser(emails);
									   } else if ($(this).text().toLowerCase().indexOf("to:") != -1) {
										   message.to = addressparser(emails);
									   } else if ($(this).text().toLowerCase().indexOf("cc:") != -1) {
										   message.cc = addressparser(emails);
									   } else {
										   // could not detect to or cc, could be in another language like chinese "收件者："
										   message.to = addressparser(emails);
									   }
		
								   });
		
								   var $gmailPrintContent = $messageNode.find("> tbody > tr:last-child table td");
								   
								   // remove some styling
								   $gmailPrintContent.find("div").first().removeAttr("style");
								   $gmailPrintContent.find("font").first().removeAttr("size");
								   
								   message.content = $gmailPrintContent.html();
								   
								   //message.textContent = htmlToText(message.content);
								   message.textContent = convertGmailPrintHtmlToText($gmailPrintContent);
								   
								   // cut the summary to lines before the [Quoted text hidden] (in any language)
								   var quotedTextHiddenArray = new Array("Quoted text hidden", "Texte des messages précédents masqué");
								   for (var a=0; a<quotedTextHiddenArray.length; a++) {
									   var idx = message.textContent.indexOf("[" + quotedTextHiddenArray[a] + "]");
									   if (idx != -1) {
										   message.textContent = message.textContent.substring(0, idx);
										   break;
									   }
								   }
								   
								   message.textContent = filterEmailBody(mail.title, message.textContent);
								   
								   message.textContent = bg.html_sanitize(message.textContent);
								   
								   message.mail = mail;
								   
								   mail.messages.push(message);
							   });
						   } else {
							   var message = {};
							   console.warn("Could not parse body from print page: ", $responseWrapper);
							   message.from = {name:mail.getName(), email:mail.authorMail}; 
							   message.content = $responseWrapper.html();
							   
							   // remove script tags to bypass content_security_policy
							   message.content = message.content.replaceAll("<script", "<div style='display:none'");
							   message.content = message.content.replaceAll("</script>", "</div>");
							   
							   message.textContent = convertGmailPrintHtmlToText($responseWrapper);
							   message.textContent = bg.html_sanitize(mail.textContent);
							   mail.messages.push(message);
						   }
						   
						   resolve({mail:mail});			   
					   }
				   } else {
					   reject(jqXHR.statusText);
				   }
			   }
		   });
		   
		   //countEvent("fetchThread");
	   });
   }
   
   this.getSetting = function(attributeName, settingsName) {
	   
	   // if no settingsname passed just use attribute
	   if (!settingsName) {
		   settingsName = attributeName;
	   }
	   
	   var emailSettings = Settings.read("emailSettings");
	   if (emailSettings) {
		   var accountEmailSettings = emailSettings[that.getAddress()];
		   if (accountEmailSettings) {
			   if (accountEmailSettings[attributeName] != undefined) {
				   return accountEmailSettings[attributeName];
			   } else {
				   return Settings.read(settingsName);
			   }
		   } else {
			   return Settings.read(settingsName);
		   }
	   } else {
		   return Settings.read(settingsName);
	   }
   }
   
   this.deleteSetting = function(key) {
	   return that.saveSetting(key, null);
   }
   
   this.saveSetting = function(key, value) {
	   var emailSettings = Settings.read("emailSettings");
	   var accountEmailSettings;
	   if (!emailSettings) {
		   emailSettings = {}
	   }
	   accountEmailSettings = emailSettings[that.getAddress()];
	   if (!accountEmailSettings) {
		   // do this so that accountEmailSettings is references to emailSettings
		   emailSettings[that.getAddress()] = {};
		   accountEmailSettings = emailSettings[that.getAddress()];
	   }
	   
	   if (value == null) {
		   delete accountEmailSettings[key];
	   } else {
		   accountEmailSettings[key] = value;
	   }
	   Settings.store("emailSettings", emailSettings);
   }

   this.getSettingForLabel = function(key, label, defaultObj) {
	   	var labelSettings = that.getSetting(key);
	   	
		if (!labelSettings) {
			labelSettings = {};
		}

		var value;
		if (typeof labelSettings[label] == "undefined") {
			value = defaultObj;
		} else {
			value = labelSettings[label];
		}
		return value;
   }

   this.saveSettingForLabel = function(key, label, value) {
		var labelSettings = that.getSetting(key);
		if (!labelSettings) {
			labelSettings = {};
		}
		labelSettings[label] = value;
		that.saveSetting(key, labelSettings);
   }
   
   this.getMonitorLabels = function() {	   
	   var monitorLabels = that.getSetting("monitorLabel", "monitor_label");
	   return monitorLabels;
   }
   
   this.getFirstMonitoredLabel = function(gmailAPILabelIds) {
	   var monitoredLabels = that.getMonitorLabels();
	   for (var a=0; a<monitoredLabels.length; a++) {
		   for (var b=0; b<gmailAPILabelIds.length; b++) {
			   if (getGmailAPILabelId(monitoredLabels[a]) == gmailAPILabelIds[b]) {
				   return monitoredLabels[a];
			   }
		   }
	   }
   }

   this.getOpenLabel = function() {
	   var openLabel;
	   openLabel = that.getSetting("openLabel", "open_label");
	   
	   // let's try guessing what the user wants
	   /*
	   if (that.hasMonitoredLabel(SYSTEM_ALL_MAIL)) {
		   openLabel = SYSTEM_ALL_MAIL;
	   } else {
		   openLabel = that.getSetting("openLabel", "open_label");
	   }
	   */
	   return openLabel;
  }

   // Retrieves unread count
   this.getUnreadCount = function () {
	   if (that.unreadCount < 0) {
		   that.unreadCount = 0;
	   }
	   /*
	   if (unreadCount <= 0) {
		   return 0;
	   } else {
		   return unreadCount;
	   }
	   */
	   return that.unreadCount;
   }
   
   this.getEmailDisplayName = function() {
	   var alias = that.getSetting("alias");
	   if (alias) {
		   return alias;
	   } else {
		   return that.getAddress();
	   }
   }

   this.getMailUrl = function (params) {
	   params = initUndefinedObject(params);
	   
	   var mailUrl;
	   var mailPath;
	   var usingInboxByGmail;

	   if (params.detectInboxByGmail && that.getSetting("openLinksToInboxByGmail")) {
		   mailUrl = INBOX_BY_GMAIL_DOMAIN;
		   mailPath = INBOX_BY_GMAIL_PATH;
		   usingInboxByGmail = true;
	   } else {
		   mailUrl = MAIL_DOMAIN;
		   mailPath = MAIL_PATH;
	   }
	   
	   if (accountParams.domain != null) {
		   // This is a GAFYD account
		   mailUrl += "/a/" + accountParams.domain + "/";
	   } else if (that.id != null && !that.mustResync) {
		   // This is a Google account with multiple sessions activated
		   if (params.useBasicGmailUrl || (!params.useStandardGmailUrl && Settings.read("useBasicHTMLView"))) {
			   mailUrl = MAIL_DOMAIN_AND_PATH + "u/" + that.id + "/h/";
		   } else {
			   mailUrl += mailPath + "u/" + that.id + "/";
		   }
	   } else {
		   // Standard one-session Gmail account
		   console.trace("no account id");
		   mailUrl += mailPath;
		   if (params.useGmailUI && that.mustResync) {
			   mailUrl = setUrlParam(mailUrl, "authuser", encodeURIComponent(that.getAddress()));
			   // leave some grace time for user to sign in if they get they are prompted for password to sign into their gmail
			   // stop previous timer (if any)
			   clearTimeout(syncSignInIdTimer);
			   if (that.resyncAttempts > 0) {
				   syncSignInIdTimer = setTimeout(function() {
					   that.resyncAttempts--;
					   that.syncSignInId().then(function() {
						   serializeOauthAccounts();
						   that.mustResync = false;
					   }).catch(function(errorResponse) {
						   console.error("syncsignin error: " + errorResponse);
					   });
				   }, seconds(20));
			   }
		   }
	   }
	   
	   if (params.useGmailUI && !usingInboxByGmail) {
	   	   var labelToUse;
	   	   if (params.label != undefined) {
	   		   labelToUse = params.label;
	   	   } else {
	   		   if (Settings.read("accountAddingMethod") == "autoDetect") {
		   		   labelToUse = params.mail.labels.first();
	   		   } else {
	   			   //labelToUse = params.mail.account.getFirstMonitoredLabel(params.mail.labels);
	   			   //labelToUse = getJSystemLabelId(id);
	   			   labelToUse = params.mail.monitoredLabel;
	   		   }
	   	   }
	   	   
	   	   if (labelToUse == SYSTEM_INBOX || labelToUse == SYSTEM_IMPORTANT || labelToUse == SYSTEM_IMPORTANT_IN_INBOX || labelToUse == SYSTEM_PRIMARY || labelToUse == SYSTEM_PURCHASES || labelToUse == SYSTEM_FINANCE || labelToUse == SYSTEM_SOCIAL || labelToUse == SYSTEM_PROMOTIONS || labelToUse == SYSTEM_UPDATES || labelToUse == SYSTEM_FORUMS) {
	   		   labelToUse = "inbox"; // mbox changed to inbox
	   	   } else if (labelToUse == SYSTEM_ALL_MAIL) {
	   		   labelToUse = "all";
	   	   } else if (labelToUse == SYSTEM_UNREAD) {
	   		   labelToUse = "search/label%3Aunread";
	   	   } else if (labelToUse == "search") {
	   		   var searchStrFormatted = encodeURIComponent(params.searchStr);
	   		   searchStrFormatted = searchStrFormatted.replace(/%20/g, "+");
	   		   labelToUse = "search/" + searchStrFormatted;
	   	   } else {
	   		   if (params.mail) {
	   			   labelToUse = params.mail.account.getLabelName(labelToUse);
	   		   } else {
	   			   labelToUse = that.getLabelName(labelToUse);
	   		   }
	   		   labelToUse = "label/" + labelToUse;
	   	   }
	   	   
	   	   mailUrl += "#" + labelToUse;
	   	   
	   	   var messageId;
	   	   
	   	   // passed directly
	   	   if (params.messageId) {
	   		   messageId = params.messageId;
	   	   } else if (params.mail) { // passed via mail object
	   		   messageId = params.mail.id;
	   	   }
	   	   
		   if (messageId) {
		   	   if (Settings.read("useBasicHTMLView")) {
		   		   mailUrl = setUrlParam(mailUrl, "th", messageId);
		   	   } else {
		   		   mailUrl += "/" + messageId;
		   	   }
		   }   

	   } else if (params.useGmailUI && usingInboxByGmail && params.searchStr) {
   		   var searchStrFormatted = encodeURIComponent(params.searchStr);
   		   mailUrl += "search/" + searchStrFormatted;
	   }
	   
	   if (params.urlParams) {
		   if (mailUrl.indexOf("?") != -1) {
			   mailUrl += "&"
		   } else {
			   mailUrl += "?";
		   }
		   mailUrl += params.urlParams;
	   }
	   
	   return mailUrl;
   }
   
   // Returns the email address for the current account
   this.getAddress = function () {
	   if (mailAddress) {
		   return mailAddress;
	   } else {
		   return that.getMailUrl();
	   }
   }
   
   this.hasBeenIdentified = function() {
	   return mailAddress;
   }

   // Returns the mail array
   this.getMail = function () {
	   return mailArray;
   }
   
   this.getMailIndexById = function(id) {
	   for (var a=0; a<mailArray.length; a++) {
		   if (mailArray[a].id == id) {
			   return a;
		   }
	   }
	   return -1;
   }

   this.getMailById = function(id) {
	   var mailIndex = that.getMailIndexById(id);
	   if (mailIndex != -1) {
		   return mailArray[mailIndex];
	   }
   }
   
   this.removeMail = function(id) {
	   var mailIndex = that.getMailIndexById(id);
	   if (mailIndex != -1) {
		   return mailArray.splice(mailIndex, 1);
	   }
   }

   // Returns the newest mail
   this.getNewestMail = function () {
	   return newestMailArray.first();
   }

   // Returns the newest mail
   this.getAllNewestMail = function () {
	   return newestMailArray;
   }

   this.openCompose = function(params) {

	   params = initUndefinedObject(params);
	   
	   params.account = that;
	   params.url = generateComposeUrl(params);
	   
	   // generate a reply all regardless to store it for possible use later
	   params.generateReplyAll = true;
	   var urlReplyAll = generateComposeUrl(params);
	   
	   localStorage["_composeUrl"] = params.url;
	   localStorage["_composeUrlReplyAll"] = urlReplyAll;
	   
	   console.log("open compose:", params);
	   
	   if (params.replyAction) {
		   // detect if more than 1 recipient and if so we show the reply all option to user
		   if ((params.replyAll.tos && params.replyAll.tos.length >= 2) || (params.replyAll.tos && params.replyAll.tos.length == 1 && params.replyAll.ccs >= 1) || (params.ccs && params.ccs.length >= 2)) {
			   params.showReplyAllOption = true;
			   console.log("show reply all");
		   }
	   }
	   
	   openTabOrPopup(params);
   }
   
   this.sendEmail = function(params) {
	   return new Promise(function(resolve, reject) {
		   params.action = MailAction.SEND_EMAIL;
		   executeMailAction(params).then(function(response) {
			   resolve(response);
		   }).catch(function(error) {
			   reject(error);
		   })
	   });
   }
   
   this.detectConversationViewMode = function(callback) {
	   console.log("detecting conversation mode...");
	   $.ajax({
		   type: "GET",
		   dataType: "text",
		   url: that.getMailUrl({useStandardGmailUrl:true}),
		   timeout: seconds(7),
		   complete: function(jqXHR, textStatus) {
			   var conversationViewMode = true;
			   if (textStatus == "success") {
				   var data = jqXHR.responseText;
				   if (data) {
					   // ["bx_vmb","1"] means it is disabled
					   if (data.indexOf("[\"bx_vmb\",\"1\"]") != -1) {
						   conversationViewMode = false;
					   }
				   }
				   callback({conversationViewMode:conversationViewMode});
			   } else {
				   callback({error:textStatus});
			   }
		   }
	   });
	}

   
   function fetchLabelsFromHtmlSource() {
	   return new Promise((resolve, reject) => {
		   $.ajax({
			   type: "GET",
			   dataType: "text",
			   url: that.getMailUrl({useStandardGmailUrl:true}),
			   timeout: 7000,
			   complete: function(jqXHR, textStatus) {
				   var foundLabels = false;
				   
				   if (textStatus == "success") {
					   var data = jqXHR.responseText;
					   if (data) {
						   var labelStartStr = '["ua",';
						   var startIndex = data.indexOf(labelStartStr);
						   if (startIndex != -1) {
							   startIndex += labelStartStr.length;
							   try {
								   var endIndex = data.indexOf(']]', startIndex) + 2;
								   var length = endIndex - startIndex;
								   var labelsRawStr = data.substr(startIndex, length);
								   var labelsRawObj = JSON.parse(labelsRawStr);
								   
								   labels = [];
								   for (var a=labelsRawObj.length-1; a>=0; a--) {
									   var labelName = labelsRawObj[a][0];
									   if (labelName.indexOf("^") != 0) {
										   labels.push({id:labelName, name:labelName});
									   }
								   }
								   
								   foundLabels = true;
							   } catch (e) {
								   logError("An error occured while parsing labels: ", e, jqXHR);
							   }
						   } else {
							   logError("did not find label search str: " + labelStartStr);
						   }
					   }
				   } else {
					   logError("An error occured while fetching globals: " + textStatus, jqXHR);				   
				   }
				   
				   if (foundLabels) {
					   resolve({labels:labels});
				   } else {
					   console.warn("trying alternative fetch for labels");
					   $.ajax({
						   type: "GET",
						   dataType: "text",
						   url: that.getMailUrl({useBasicGmailUrl:true}),
						   timeout: 7000,
						   complete: function(jqXHR, textStatus) {
							   if (textStatus == "success") {
								   var data = jqXHR.responseText;
								   if (data) {
									   var startIndex = data.indexOf("<select name=tact>");
									   if (startIndex != -1) {
										   try {
											   var endIndex = data.indexOf("</select>", startIndex);
											   var html = data.substring(startIndex, endIndex);
											   labels = [];
											   $(html).find("option").each(function() {
												   var label = $(this).attr("value");
												   if (label.indexOf("ac_") == 0) {
													   var labelName = label.substring(3);
													   labels.push({id:labelName, name:labelName});
												   }
											   });
											   
											   foundLabels = true;
										   } catch (e) {
											   logError("error parsing html2", e);
										   }
									   }
								   }
							   } else {
								   logError("An error occured while fetching globals2: " + textStatus);
							   }
							   
							   if (foundLabels) {
								   resolve({labels:labels});
							   } else {
								   reject("Problem loading labels, try again later!");
							   }
						   }
					   });
				   }
			   }
		   });
	   });
   }
   
   function fetchLabels(forceRefresh) {
	   return new Promise((resolve, reject) => {
		   if (Settings.read("accountAddingMethod") == "autoDetect") {
			   fetchLabelsFromHtmlSource().then(response => {
				   console.log("fetchlabels", response);
				   if (response.labels) {
					   response.labels.sort(function(a, b) {
						   if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
						   if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
						   return 0;
					   });
				   }
				   resolve(response);
			   }).catch(error => {
				   reject(error);
			   });
		   } else {
			   bg.oAuthForEmails.send({userEmail:mailAddress, url: GmailAPI.URL + "labels", noCache:true}).then(response => {
				   var responseObj = JSON.parse(response.jqXHR.responseText);
				   labels = responseObj.labels;
				   
				   var userLabels = [];
				   if (labels) {
					   for (var a=0; a<labels.length; a++) {
						   if (labels[a].type == "user") {
							   userLabels.push(labels[a]);
						   }
					   }
				   }
				   
				   userLabels.sort(function(a, b) {
					   if (a.name < b.name) return -1;
					   if (a.name > b.name) return 1;
					   return 0;
				   });
				   
				   // cache it here
				   labels = userLabels;
				   
				   resolve({labels:labels});
			   }).catch(function(error) {
				   reject(error); 
			   });
		   }
	   });
   }

   this.getLabels = function(forceRefresh) {
	   return new Promise((resolve,reject) => {
		   if (labels && !forceRefresh) {
			   resolve({labels:labels});
		   } else {
			   fetchLabels(forceRefresh).then(response => {
				   resolve(response);
			   }).catch(error => {
				   reject(error);
			   });
	 	   }
	   });
   }
   
   // for auto-detect just ignore, for oauth remove it
   this.remove = function(oAuthForEmails, accounts) {
	   if (Settings.read("accountAddingMethod") == "autoDetect") {
		   that.saveSetting("ignore", true);
	   } else {
		   oAuthForEmails.removeTokenResponse({userEmail:that.getAddress()});
			
		   accounts.some(function(account, i) {
			   console.log("account", account.getAddress());
			   if (account.getAddress() == that.getAddress()) {
				   console.log("remove:", account);
				   accounts.splice(i, 1);
				   return true;
			   }
		   });
	   }
   }

   // Construct a new mail object
   function MailObject() {

	   var that = this;
	   
	   this.allFiles = [];
	   
	   this.queueFile = function(messageId, file) {
			var queuedFile = {filename:file.filename, size:file.body.size};
			queuedFile.fetchPromise = that.account.fetchAttachment({messageId:messageId, attachmentId:file.body.attachmentId, size:file.body.size});
			that.allFiles.push(queuedFile);
			return queuedFile;
	   }
	   
	   this.getName = function(parsedAddress) {
		   
		   var name;
		   var email;
		   
		   // if message is passed used the 
		   if (parsedAddress) {
			   name = parsedAddress.name;
			   email = parsedAddress.email;
		   } else {
			   name = that.authorName;
			   email = that.authorMail;
		   }

		   if (name == null || name.length < 1) {
			   if (email) {
				   name = email.split("@")[0];
			   } else {
				   name = email;
			   }
			   return name;
		   } else {
			   return $.trim(name);
		   }
	   }

	   this.getShortName = function() {
		   var name = that.getName();
		   if (name) {
			   name = name.split(" ")[0];
		   }
		   return name;
	   }
	   
	   this.getDate = function() {
		   return that.issued.displayDate({relativeDays:true});
	   }

	   this.open = function(params) {
		   params = initUndefinedObject(params);
		   
		   params.mail = that;
		   params.useGmailUI = true;

		   if (params.openInNewTab) {
			   var newURL = that.account.getMailUrl(params);
			   createTab(newURL);
		   } else {
			   that.account.findOrOpenGmailTab(params);
		   }
	   }
	   
	   this.getUrl = function() {
		   return that.account.getMailUrl({mail:that, useGmailUI:true, detectInboxByGmail:true});
	   }

	   // params is optional
	   this.markAsRead = function(params) {
		   params = initUndefinedObject(params);
		   
		   var executeMailActionParams = clone(params);
		   
		   // append these params
		   executeMailActionParams.mail = that;
		   executeMailActionParams.action = MailAction.MARK_AS_READ;
		   return executeMailAction(executeMailActionParams);
	   }

	   this.markAsUnread = function() {
		   return executeMailAction({mail:that, action:MailAction.MARK_AS_UNREAD});
	   }

	   this.deleteEmail = function(params) {
		   params = initUndefinedObject(params);
		   
		   // must clone it because i stuck in a loop below because params was modified in .markAsRead and it in turn modified executeMailActionParams later
		   var executeMailActionParams = clone(params)
		   
		   // append these params
		   executeMailActionParams.mail = that;
		   executeMailActionParams.action = MailAction.DELETE;
		   
		   return new Promise(function(resolve, reject) {
			   if (Settings.read("deletingMarksAsRead")) {
				   console.log("delete email & markasread", params);
				   // note: if i add a catch clause then the return below is always returning "resolved" ??
				   that.markAsRead(params).then(function() {
					   // 2 scenarios: instantlyUpdatedCount was already executed before this method was called or markasread above should have updated the count so let's not update it again with the executeMailAction
					   executeMailActionParams.instantlyUpdatedCount = true;
					   resolve();
				   }).catch(function(error) {
					   reject(error);
				   })
			   } else {
				   resolve();
			   }
		   }).then(function() {
			   return executeMailAction(executeMailActionParams);
		   });
	   }

	   this.archive = function(params) {
		   params = initUndefinedObject(params);
		   
		   var executeMailActionParams = clone(params);
		   
		   // append these params
		   executeMailActionParams.mail = that;
		   executeMailActionParams.action = MailAction.ARCHIVE;
		   
		   return new Promise(function(resolve, reject) {
			   if (Settings.read("archive_read")) {
				   that.markAsRead(params).then(function() {
					   // 2 scenarios: instantlyUpdatedCount was already executed before this method was called or markasread above should have updated the count so let's note update it again with the executeMailAction
					   executeMailActionParams.instantlyUpdatedCount = true;
					   resolve();								   
				   }).catch(function(error) {
					   reject(error);
				   });
			   } else {
				   resolve();
			   }
		   }).then(function() {
			   return executeMailAction(executeMailActionParams);
		   });
	   }

	   this.markAsSpam = function(params) {
		   params = initUndefinedObject(params);
		   
		   var executeMailActionParams = clone(params);
		   
		   // append these params
		   executeMailActionParams.mail = that;
		   executeMailActionParams.action = MailAction.MARK_AS_SPAM;
		   
		   return executeMailAction(executeMailActionParams);
	   }

	   this.moveLabel = function(params) {
		   return new Promise(function(resolve, reject) {
			   console.log("move label", that.labels);
			   if (that.labels.length) {
				   var emailMightBeInInbox = false;
	
				   // find "possibly" inbox label: archive it first and then label it										   
				   $.each(that.labels, function(index, label) {
					   console.log("label: ", label);
					   if (isSystemLabel(label)) { // possibly inbox email
						   console.log("system label: ", label);
						   emailMightBeInInbox = true;
						   that.archive().then(function() {
							   resolve();
						   }).catch(function(error) {
							   reject(error);
						   })
						   return false;
					   }
				   });
	
				   // if only 1 label (and not possibly in inbox) then remove it and apply new label
				   if (that.labels.length == 1 && !emailMightBeInInbox) {
					   that.removeLabel(that.labels.first()).then(function() {
						   resolve();
					   }).catch(function(error) {
						   reject(error);
					   });
				   } else {
					   resolve();
				   }
			   } else {
				   var error = "no labels for email";
				   logError(error);
				   reject(error);
			   }
		   }).then(function() {
			   return that.applyLabel(params.newLabel);
		   });
	   }
	   
	   this.untrash = function(params) {
		   console.log("untrash");
		   params = initUndefinedObject(params);
		   
		   var executeMailActionParams = clone(params);
		   
		   // append these params
		   executeMailActionParams.mail = that;
		   executeMailActionParams.action = MailAction.UNTRASH;

		   return executeMailAction(executeMailActionParams);
	   }

	   this.applyLabel = function(label) {
		   if (Settings.read("accountAddingMethod") == "oauth") {
			   label = getGmailAPILabelId(label);
		   }
		   return executeMailAction({mail:that, action:MailAction.APPLY_LABEL, label:label});
	   }

	   this.removeLabel = function(label) {
		   console.log("remove label");
		   return executeMailAction({mail:that, action:MailAction.REMOVE_LABEL, label:label});									   
	   }

	   this.star = function() {
		   var executeMailActionParams = {};
		   
		   // append these params
		   executeMailActionParams.mail = that;
		   executeMailActionParams.action = MailAction.STAR;
		   
		   return new Promise(function(resolve, reject) {
			   if (Settings.read("starringAppliesInboxLabel") && Settings.read("accountAddingMethod") == "oauth" && !that.hasLabel(SYSTEM_INBOX)) {
				   that.applyLabel(SYSTEM_INBOX).then(function() {
					   // 2 scenarios: instantlyUpdatedCount was already executed before this method was called or markasread above should have updated the count so let's note update it again with the executeMailAction
					   executeMailActionParams.instantlyUpdatedCount = true;
					   resolve();
				   }).catch(function(error) {
					   reject(error);
				   });
			   } else {
				   resolve();
			   }
		   }).then(function() {
			   return executeMailAction(executeMailActionParams);
		   });
	   }

	   this.removeStar = function() {
		   return executeMailAction({mail:that, action:MailAction.REMOVE_STAR});
	   }

	   this.starAndArchive = function() {
		   return that.star().then(function() {
			   return that.archive();
		   });
	   }
	   
	   this.postReply = function(message, replyAllFlag) {
		   return executeMailAction({mail:that, action:MailAction.REPLY, message:message, replyAllFlag:replyAllFlag});
	   }

	   this.generateReplyObject = function(params) {
		   params = initUndefinedObject(params);
		   
		   var replyObj = {replyAction:true};
		   var quotedContent;
		   console.log("generatereplyobj:", that);
		   if (that.messages) {
			   var lastMessage = that.messages.last();
			   
			   if (that.deliveredTo && that.deliveredTo.length) {
				   replyObj.from = {};
				   //replyObj.from.email = that.deliveredTo.last();
				   replyObj.from = addressparser(that.deliveredTo.last()).first();
				   
				   // let's override the alias if it's same email as manually added then let's use the alias, else assume it's a different "send mail as"
				   if (that.account.getAddress() == replyObj.from.email) {
					   // commented because users had "private" aliases they did not want showing in from
					   //replyObj.from.name = that.account.getSetting("alias");
				   } else {
					   // let's try to use the name/email from the sender's to field
					   
					   function findMatchingAddress(ary, email) {
						   for (var a=0; ary && a<ary.length; a++) {
							   if (ary[a].email == email) {
								   return ary[a];
							   }
						   }
					   }
					   
					   var matchingAddress = findMatchingAddress(lastMessage.to, replyObj.from.email);
					   if (!matchingAddress) {
						   matchingAddress = findMatchingAddress(lastMessage.cc, replyObj.from.email);
					   }
					   if (!matchingAddress) {
						   matchingAddress = findMatchingAddress(lastMessage.bcc, replyObj.from.email);
					   }
					   
					   if (matchingAddress) {
						   replyObj.from.name = matchingAddress.name;
					   }
				   }
			   }
			   
			   // always use the name from the from field, but will try to identify the email from either the reply-to or the from field
			   var fromObj = {name:lastMessage.from.name, email:lastMessage.from.email};
			   
			   // if alternate reply-to email then override the from email
			   if (that.replyTo) {
				   //fromObj.email = that.replyTo;
				   fromObj = addressparser(that.replyTo).first();
			   }
			   replyObj.tos = [fromObj];

			   // save replyall object for possible use later when choosing reply or reply all
			   replyObj.replyAll = {};
			   replyObj.replyAll.tos = replyObj.tos.concat(removeSelf(lastMessage.to));
			   replyObj.replyAll.ccs = removeSelf(lastMessage.cc);

			   function removeSelf(ary) {
				   if (ary) {
					   // must clone it
					   ary = ary.concat();
					   for (var a=0; a<ary.length; a++) {
						   if (ary[a].email == mailAddress) {
							   ary.splice(a, 1);
							   break;
						   }
					   }
				   } else {
					   ary = [];
				   }
				   return ary;
			   }

			   console.log("replyallobj:", replyObj.replyAll);

			   if (params.replyAllFlag) {
				   replyObj.tos = replyObj.replyAll.tos
				   replyObj.ccs = replyObj.replyAll.ccs;
			   }

			   // used to group replies by converstion in Gmail etc.
			   var inReplyTo = lastMessage["message-id"];
			   if (inReplyTo) {
				   replyObj.inReplyTo = inReplyTo;
			   }
			   quotedContent = lastMessage.content;
		   } else {
			   var toObj = {};
			   toObj.email = that.authorMail;
			   toObj.name = that.getName();
			   
			   replyObj.tos = [toObj];

			   quotedContent = that.summary;
		   }

		   if (params.type == "text") {
			   // text
			   var subject = that.title;
			   if (subject) {
				   subject = subject.htmlToText();
			   } else {
				   subject = "";
			   }
			   subject = (subject.search(/^Re: /i) > -1) ? subject : "Re: " + subject; // Add 'Re: ' if not already there
			   replyObj.subject = subject;
			   // warning: $.trim removes \r\n (and this trim was is used in the .summarize
			   replyObj.message = "\r\n\r\n" + that.issued.toString() + " <" + that.authorMail + ">:\r\n" + that.getLastMessageText().htmlToText().summarize(600); // summarize body because or else we get a 414 or 413 too long url parameters etc.;
		   } else {
			   // html
			   replyObj.subject = that.title;
			   replyObj.message = "";
			   if (params.message) {
				   replyObj.message += params.message;
			   }
			   replyObj.message += "<blockquote type='cite' style='border-left:1px solid #ccc;margin-top:20px;margin-bottom:10px;margin-left:50px;padding-left:9px'>" + quotedContent + "</blockquote>";
		   }
		   return replyObj;
	   }

	   this.reply = function() {
		   var replyObject = that.generateReplyObject({type:"text"});

		   console.log("reply:", replyObject);

		   that.account.openCompose(replyObject);

		   if (Settings.read("replyingMarksAsRead")) {
			   that.markAsRead();
		   }
	   }

	   this.getThread = function(params) {
		   params = initUndefinedObject(params);
		   
		   params.mail = that;

		   // for auto-detect - if already fetched thread/messages
		   // for oauth - should have aleady been fetched so just return it
		   if (params.mail.messages || Settings.read("accountAddingMethod") == "oauth") {
			   return Promise.resolve(params);
		   } else {
			   // refresh thread
			   return fetchThread(params);
		   }
	   }
	   
	   this.getMessageById = function(id) {
		   for (var a=0;a<that.messages.length; a++) {
			   if (that.messages[a].id == id) {
				   return that.messages[a];
			   }
		   }
	   }
	   
	   this.removeMessageById = function(id) {
		   for (var a=0;a<that.messages.length; a++) {
			   if (that.messages[a].id == id) {
				   that.messages.splice(a, 1);
				   return true;
			   }
		   }
	   }

	   // params... {maxSummaryLetters:170, htmlToText:true, EOM_Message:" [" + getMessage("EOM") + "]"}
	   this.getLastMessageText = function(params) { // optional maxletters
		   if (!params) {
			   params = {};
		   }
		   
		   var appendEOM;
		   
		   var lastMessageText;
		   // if we are getting the summary from whole message than we can use the EOM, else if we use the brief summary from the atom feed we don't know for sure if it's cut off etc.
		   if (that.messages && that.messages.length) {
			   lastMessageText = that.messages.last().textContent;
			   if (lastMessageText) {
				   if (params.htmlToText) {
					   lastMessageText = lastMessageText.htmlToText();
				   }
				   if (params.maxSummaryLetters) {
					   if (params.targetNode) {
						   // append EOM to node at the end only
						   if (Settings.read("showEOM") && params.EOM_Message && lastMessageText.length <= params.maxSummaryLetters) {
							   appendEOM = true;
						   }
						   lastMessageText = lastMessageText.summarize(params.maxSummaryLetters);
					   } else {
						   lastMessageText = lastMessageText.summarize(params.maxSummaryLetters, Settings.read("showEOM") ? params.EOM_Message : null);
					   }
				   }
			   }
		   }

		   // can happen when could not parse body from print page
		   if (!lastMessageText) {
			   lastMessageText = that.summary;

			   if (lastMessageText) {
				   if (params.htmlToText) {
					   lastMessageText = lastMessageText.htmlToText();
				   }												
				   if (lastMessageText && params.maxSummaryLetters) {
					   // seems like ... doesn't always exist in atom feed? so cant be sure there more text
					   lastMessageText = lastMessageText.summarize(params.maxSummaryLetters);
				   }
			   }
		   }
		   
		   if (!lastMessageText) {
			   lastMessageText = "";
		   }
		   
		   if (params.targetNode) {
			   params.targetNode.text(lastMessageText);
			   if (appendEOM) {
				   params.targetNode.append(params.EOM_Message);
			   }
			   return params.targetNode;
		   } else {
			   return lastMessageText;			   
		   }
	   }
	   
	   this.removeFromArray = function() {
		   for (var a=0; a<mailArray.length; a++) {
			   if (that.id == mailArray[a].id) {
				   mailArray.splice(a, 1);
				   break;
			   }
		   }
	   }
	   
	   this.sortMessages = function() {
		   that.messages.sort(function(message1, message2) {
			   var date1 = message1.date;
			   var date2 = message2.date;
			   if (date1.getTime() == date2.getTime()) {
				   return 0;
			   } else {
				   return date1.getTime() < date2.getTime() ? -1 : 1;
			   }
		   });
	   }

	   this.generateAuthorsNode = function(shortVersion) {
		   var $node;

		   if (Settings.read("accountAddingMethod") == "autoDetect") {
			   
			   var useMessages = that.messages && that.messages.length;
			   if (that.contributors.length >= 1) {
				   // the feed does not put the original author as first contributor if they have replied in the thread (ie. last author) so make sure they're first if so
				   var name = "someone";
				   var nextContributorIndex = 0;
				   if (useMessages) {
					   if (that.messages.first().from.email == that.contributors.last().find("email").text()) {
						   //console.log("last contr is valid original author: " + that.messages.first().from.email);
						   name = that.contributors.last().find("name").text().split(" ")[0];
						   nextContributorIndex = 0;
					   } else {
						   name = that.getName(that.messages.first().from).getFirstName();
						   nextContributorIndex = 1;
					   }
				   } else {
					   if (that.contributors.length) {
						   name = that.contributors.first().find("name").text().getFirstName();
					   }
				   }
				   var html = "<span>" + name + "</span>";

				   var unreadAuthor = "<span class='unread'>" + that.getShortName() + "</span>";
				   if (useMessages) {
					   unreadAuthor += " (" + (that.messages.length) + ")";
				   }
				   // if more conversations than contributors (happens when several exchanges are done from the original author)
				   if (useMessages && that.messages.length > that.contributors.length+1) {
					   html += " .. " + unreadAuthor;
				   } else {
					   if (!useMessages || shortVersion) {
						   if (that.contributors.length == 2) {
							   html += ", ";
						   } else {
							   html += " .. ";
						   }
						   html += unreadAuthor;
					   } else {
						   if (that.contributors.length == 2) {						
							   html += ", <span>" + that.contributors.eq(nextContributorIndex).find("name").text().split(" ")[0] + "</span>";
						   } else if (that.contributors.length >= 3) {
							   //html += " .. " + unreadAuthor;
							   html += " .. <span>" + that.contributors.first().find("name").text().split(" ")[0] + "</span>";
						   }

						   html += ", " + unreadAuthor;
					   }
				   }

				   $node = $(html);
			   } else {
				   $node = $("<span/>");
				   $node
				   		.text( that.getName() )
				   		.addClass("unread")
				   		.attr("title", that.authorMail)
				   ;
			   }			   
		   } else {
			   // using <= because seems .messages might have been zero length
			   if (that.messages.length <= 1) {
				   $node = $("<span/>");
				   $node
				   		.text( that.getName() )
				   		.addClass("unread")
				   		.attr("title", that.authorMail)
				   ;
			   } else {
				   var separator;
				   if (that.messages.length == 2) {
					   separator = ", ";
				   } else {
					   separator = " .. ";
				   }
				   var html;
				   try {
					   html = "<span class='unread'>" + that.getName(that.messages.first().from).getFirstName() + "</span>" + separator + "<span class='unread'>" + that.getName(that.messages.last().from).getFirstName() + "</span>";
				   } catch (error) {
					   html = "<span class='unread'>" + that.getName() + "</span>";
					   console.warn("problem parsing author name: " + error);
				   }
				   html += " (" + (that.messages.length) + ")";
				   $node = $(html);
			   }
		   }

		   return $node;
	   }

	   // pass in system_ label
	   this.hasLabel = function(labelId) {
		   for (var a=0; a<that.labels.length; a++) {
			   if (getJSystemLabelId(that.labels[a]) == labelId) {
				   return true;
			   }
		   }
	   }
	   
	   this.getDisplayLabels = function(excludeInbox) {
		   var labels = [];
		   
		   that.labels.forEach(function(labelId) {
			   var labelObj = {id:labelId};
			   var systemLabelId = getJSystemLabelId(labelId);
			   
			   if (systemLabelId == SYSTEM_INBOX) {
				   if (excludeInbox) {
					   return;
				   } else {
					   labelObj.name = getMessage("inbox");
				   }
			   } else if (systemLabelId == SYSTEM_PRIMARY || systemLabelId == SYSTEM_ALL_MAIL || systemLabelId == SYSTEM_IMPORTANT || systemLabelId == SYSTEM_IMPORTANT_IN_INBOX || systemLabelId == SYSTEM_STARRED) {
				   // don't add this, continue loop
				   return;
			   } else if (systemLabelId == SYSTEM_PURCHASES) {
				   labelObj.name = getMessage("purchases");
			   } else if (systemLabelId == SYSTEM_FINANCE) {
				   labelObj.name = getMessage("finance");
			   } else if (systemLabelId == SYSTEM_SOCIAL) {
				   labelObj.name = getMessage("social");
			   } else if (systemLabelId == SYSTEM_PROMOTIONS) {
				   labelObj.name = getMessage("promotions");
			   } else if (systemLabelId == SYSTEM_UPDATES) {
				   labelObj.name = getMessage("updates");
			   } else if (systemLabelId == SYSTEM_FORUMS) {
				   labelObj.name = getMessage("forums");
			   } else if (labelId == GmailAPI.labels.SENT || labelId == GmailAPI.labels.UNREAD || labelId == GmailAPI.labels.IMPORTANT) {
				   // Note using labeId here instead of systemLabelId
				   // don't add this, continue loop
				   return;
			   } else {
				   labelObj.name = that.account.getLabelName(labelId);
			   }
			   
			   labels.push(labelObj);
		   });
		   
		   labels.sort(function(a, b) {
			   if (a.name && b.name) {
				   if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
				   if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
			   }
			   return 0;
		   });
		   
		   return labels;
	   }

   };
   
}