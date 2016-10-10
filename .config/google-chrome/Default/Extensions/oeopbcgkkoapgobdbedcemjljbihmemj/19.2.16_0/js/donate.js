var licenseType = "singleUser";
var licenseSelected;
var minimumDonation = 1; // but being set overwritten when donate buttons are clicked
var currencySymbol = "$";
var currencyCode;

var donateButtonClicked = null;
var extensionName = getMessage("nameNoTM");
var multipleCurrencyFlag;
var email;

Controller();

function showLoading() {
	$("body").addClass("processing");
}

function hideLoading() {
	$("body").removeClass("processing");
}

if (!extensionName) {
	try {
		extensionName = chrome.runtime.getManifest().name;
	} catch (e) {
		console.error("Manifest has not been loaded yet: " + e);
	}
	
	var prefix = "__MSG_";
	// look for key name to message file
	if (extensionName && extensionName.match(prefix)) {
		var keyName = extensionName.replace(prefix, "").replace("__", "");
		extensionName = getMessage(keyName);
	}
}

function getMessageFromCurrencySelection(key) {
	var idx = document.getElementById("multipleCurrency").selectedIndex;
	var suffix = idx == 0 ? "" : idx+1;
	return getMessage(key + suffix);
}

function initCurrency() {
	$("#multipleCurrency").find("option").each(function (idx) {
		// TWD is not supported for alertPay so disable it (dont' remove it because the selector uses it's order in the list)
		if (donateButtonClicked == "alertPay" && /tw/i.test(window.navigator.language) && $(this).attr("value") == "TWD") {
			$(this).attr("disabled", "true");
			if (idx==0) {
				$("#multipleCurrency")[0].selectedIndex=1;
			}
		} else {
			$(this).removeAttr("disabled");
		}
	});
	
	function initCodesAndMinimums(donateButtonClicked) {
		var messageReducedPrefix;
		var messagePrefix;
		
		if (licenseType == "multipleUsers") {
			currencyCode = "USD"; // hard coded to USD for multipe user license
		} else {
			if (donateButtonClicked == "paypal") {
				messagePrefix = "minimumDonation";
				messageReducedPrefix = "minimumDonationPaypalReduced";
			} else if (donateButtonClicked == "stripe") {
				messagePrefix = "minimumDonationStripe";
				messageReducedPrefix = "minimumDonationStripeReduced";
			} else if (donateButtonClicked == "coinbase") {
				messagePrefix = "minimumDonationCoinbase";
				messageReducedPrefix = "minimumDonationCoinbaseReduced";
			}
			
			if ($("#multipleCurrency").val() == "BTC") {
				currencyCode = "BTC";
				currencySymbol = "BTC";
				
				$("#amountSelections").fadeOut();

				if (isEligibleForReducedDonation()) {
					minimumDonation = parseFloat(getMessage("minimumDonationBitcoinReduced"));
				} else {
					minimumDonation = parseFloat(getMessage("minimumDonationBitcoin"));
				}
			} else if (donateButtonClicked == "stripe") {
				currencyCode = "USD";
				currencySymbol = "$";

				if (isEligibleForReducedDonation()) {
					minimumDonation = parseFloat(getMessage("minimumDonationStripeReduced"));
				} else {
					minimumDonation = parseFloat(getMessage("minimumDonationStripe"));
				}
			} else {
				currencyCode = getMessageFromCurrencySelection("currencyCode");
				currencySymbol = getMessageFromCurrencySelection("currencySymbol");
				
				if (isEligibleForReducedDonation()) {
					minimumDonation = parseFloat(getMessageFromCurrencySelection(messageReducedPrefix));
				} else {			
					minimumDonation = parseFloat(getMessageFromCurrencySelection(messagePrefix));
				}
			}
		}

		// General
		$("#currencyCode").text(currencyCode);
		$("#currencySymbol").text(currencySymbol);				
		if (multipleCurrencyFlag) {
			$("#singleCurrencyWrapper").hide();
			$("#multipleCurrencyWrapper").removeAttr("hidden");
		}
		
		if (currencyCode == "USD" || currencyCode == "EUR" || currencyCode == "GBP") {
			$("#amountSelections").show();
		} else {
			$("#amountSelections").hide();
			$("#amount")
				.removeAttr("placeholder")
				.focus()
			;
		}
	}
	
	initCodesAndMinimums(donateButtonClicked);
}

function initPaymentDetails(buttonClicked) {
	donateButtonClicked = buttonClicked;
	
	$("#multipleUserLicenseIntro").slideUp();

	if (buttonClicked == "paypal") {
		$("#recurringPayment").show();
	} else {
		$("#recurringPayment").hide();
	}
	
	if (licenseType == "singleUser") {
		$('#donateAmountWrapper').slideUp("fast", function() {
			
			// If atleast 2 then we have multiple currencies
			multipleCurrencyFlag = getMessage("currencyCode2");
			
			$("#multipleCurrency").empty();
			var multipleCurrencyNode = $("#multipleCurrency")[0];
			for (var a=1; a<10; a++) {
				var suffix = a==1 ? "" : a + "";
				var currencyCode2 = getMessage("currencyCode" + suffix);
				if (currencyCode2) {
					var currencySymbol2 = getMessage("currencySymbol" + suffix);
					multipleCurrency.add(new Option(currencyCode2 + " " + currencySymbol2, currencyCode2), null);
				}
			}
			
			if (donateButtonClicked == "coinbase") {
				multipleCurrencyFlag = true;
				multipleCurrency.add(new Option("BTC", "BTC"), null);
			}
			
		}).slideDown();
			initCurrency();
		//$("#amount").focus();
	} else {
		initCurrency();
		var price = licenseSelected.price;
		initPaymentProcessor(price);
	}
}

function getAmountNumberOnly() {
	var amount = $("#amount").val();
	amount = amount.replace(",", ".");
	amount = amount.replace("$", "");

	if (amount.indexOf(".") == 0) {
		amount = "0" + amount;
	}
	
	amount = $.trim(amount);
	return amount;
}

function showSuccessfulPayment() {
	Controller.processFeatures();
	$("#extraFeatures").hide();
	$("#video").attr("src", "http://www.youtube.com/embed/Ue-li7gl3LM?rel=0&autoplay=1&showinfo=0&theme=light");
	$("#paymentArea").hide();
	$("#paymentComplete").removeAttr("hidden");
}

function showPaymentMethods(licenseType) {
	window.licenseType = licenseType;
	$("#paymentMethods").slideUp("fast", function() {
		$("#paymentMethods").slideDown();
	});
}

function initPaymentProcessor(price) {
	if (donateButtonClicked == "paypal") {
		sendGA("paypal", 'start');
		
		showLoading();

		var donationPageUrl = location.protocol + "//" + location.hostname + location.pathname;

		// seems description is not used - if item name is entered, but i put it anyways
		var data = {itemId:ITEM_ID, itemName:extensionName, currency:currencyCode, price:price, email:email, description:extensionName, successUrl:donationPageUrl + "?action=paypalSuccess", errorUrl:donationPageUrl + "?action=paypalError", cancelUrl:Controller.FULLPATH_TO_PAYMENT_FOLDERS + "paymentSystems/paypal/redirectToExtension.php?url=" + encodeURIComponent(donationPageUrl)};
		if (licenseType == "multipleUsers") {
			data.license = licenseSelected.number;
		}
		if ($("#recurringPayment")[0].checked) {
			data.action = "recurring";
		}
		
		$.ajax({
			type: "post",
			url: Controller.FULLPATH_TO_PAYMENT_FOLDERS + "paymentSystems/paypal/createPayment.php",
			data: data,
			timeout: seconds(10),
			//xhrFields: {
			      //withCredentials: true // patch: because session & cookies were not being saved on apps.jasonsavard.com
			//},
			complete: function(request, textStatus) {
				if (textStatus == "success") {
					location.href = request.responseText;
				} else {
					hideLoading();
					console.error("error", request);
					openGenericDialog({
						title: getMessage("theresAProblem") + " - " + request.statusText,
						content: getMessage("tryAgainLater") + " " + getMessage("or") + " " + "try Stripe instead."
					});
					sendGA("paypal", 'failure on createPayment');
				}
			}
		});
	} else if (donateButtonClicked == "stripe") {
		sendGA("stripe", 'start');
		
		var licenseParamValue = "";
		if (licenseType == "multipleUsers") {
			licenseParamValue = licenseSelected.number;
		}

		var stripeAmount = price * 100;
		var stripeCurrency = currencyCode;
		
		var stripeHandler = StripeCheckout.configure({
			//key: "pk_test_sxqkM56RlF9eGBI3X9cF8KR2", // test
			key: "pk_live_GYOxYcszcmgEMwflDGxnRL6e", // live
		    image: "https://jasonsavard.com/images/jason.png",
		    locale: 'auto',
		    token: function(response) {
		        console.log("token result:", response);
				$.ajax({
					type: "POST",
					url: "https://apps.jasonsavard.com/paymentSystems/stripe/charge.php",
					data: {stripeToken:response.id, amount:stripeAmount, email:email, currency:stripeCurrency, itemId:ITEM_ID, description:extensionName, license:licenseParamValue}
				}).done(function(data, textStatus, jqXHR) {
					showSuccessfulPayment();
					sendGA("stripe", "success", "daysElapsedSinceFirstInstalled", daysElapsedSinceFirstInstalled());
				}).fail(function(jqXHR, textStatus, errorThrown) {
					console.log("respone arsg", arguments);
					openGenericDialog({
						title: getMessage("theresAProblem") + " - " + jqXHR.responseText,
						content: getMessage("tryAgainLater") + " " + getMessage("or") + " " + "try PayPal instead."
					});
					sendGA("stripe", 'error with token: ' + jqXHR.responseText);
				});
	      	}
		});
		
		showLoading();
		
		stripeHandler.open({
			email:		 email,
        	address:     false,
        	amount:      stripeAmount,
        	name:        extensionName,
        	currency:    stripeCurrency,
        	allowRememberMe: false,
        	bitcoin:	 true,
        	alipay:		 true,
        	opened: function() {
        		hideLoading();
        	}
      	});

	} else if (donateButtonClicked == "coinbase") {
		sendGA("coinbase", 'start');
		
		var licenseParamValue = "";
		if (licenseType == "multipleUsers") {
			licenseParamValue = licenseSelected.number;
		}

		var borderRadius = "border-radius:10px;";
		var $coinbaseWrapper = $("<div id='coinbaseWrapper' style='" + borderRadius + "-webkit-transition:top 800ms ease-in-out;left: 38%;top: 182px;text-align:center;position:fixed;background:white;width: 460px; height: 350px;box-shadow: 0 1px 3px rgba(0,0,0,0.25);'><paper-spinner id='loadingCoinbase' style='margin-top:35%' active></paper-spinner><iron-icon id='closeCoinbase' icon='close' style='border-radius: 50%;background-color: white;cursor:pointer;top: -16px;right: -16px;position: absolute;'/></div>");
		$coinbaseWrapper.find("#closeCoinbase").click(function() {
			$coinbaseWrapper.remove();
		});
		$("body").append($coinbaseWrapper);
		
		Controller.ajax({data:"action=createCoinbaseButton&name=" + extensionName + "&price=" + price + "&currency=" + currencyCode}, function(params) {
			console.log("result", params);
			var error = params.error;
			if (!error && params.data && params.data.error) {
				error = params.data.error;
			}
			if (error) {
				openGenericDialog({
					title: getMessage("theresAProblem"),
					content: getMessage("tryAgainLater") + " " + getMessage("or") + " " + "try PayPal instead."
				});
				sendGA("coinbase", 'error with createCoinbaseButton');
				if (params.errorThrown != "timeout") {
					Controller.email({subject:"Payment error - coinbase", message:"error:<br>" + error + "<br>errorthrown: " + params.errorThrown});
				}
			} else {
				var code = params.data.button.code;

				var customParam = {itemID:ITEM_ID, email:email, license:licenseParamValue};
				var url = "https://coinbase.com/checkouts/" + code + "/inline?c=" + encodeURIComponent( JSON.stringify(customParam) );
				
				var $coinbaseIframe = $("<iframe src='" + url + "' style='" + borderRadius + "width: 460px; height: 348px; border: none;' allowtransparency='true' frameborder='0'></iframe>");
				$coinbaseWrapper.find("#loadingCoinbase").hide();
				$coinbaseWrapper.append($coinbaseIframe);
			}			
		});
	} else {
		openGenericDialog({
			title: getMessage("theresAProblem"),
			content: 'invalid payment process'
		});
	}
}

function ensureEmail(closeWindow) {
	if (!email) {
		openGenericDialog({
			content: getMessage("mustSignInToPay")
		}).then(function() {
			if (closeWindow) {
				window.close();
			}
		});
	}
}

function signOut() {
	location.href = Urls.SignOut;
}

function canHaveALicense(email) {
	return isDomainEmail(email) || getUrlValue(location.href, "testlicense");
}
		
$(document).ready(function() {
	
	$("title, .titleLink").text(extensionName);
	
	$("#multipleUserLicenseWrapper").slideUp();

	var accountsWithoutErrors = getAccountsWithoutErrors(bg.accounts);
	email = getFirstActiveEmail( accountsWithoutErrors );
	ensureEmail(true);
	
	if (canHaveALicense(email)) {
		$("#amountSelections [amount='5']").attr("hidden", true);
		
		$("#singleUserButton").removeAttr("hidden");

		$("#paymentMethods").hide();
		
		$("#singleUserButton").click(function() {
			$("#singleUserButton").slideUp();
			$("#paymentMethods").slideDown();
		});
		
		$("#recurringPayment").attr("checked", "");
		
		$("#multipleUserLicenseLink").hide();
		$("#multipleUserLicenseFor").text( getMessage("multipleUserLicenseFor", email.split("@")[1]) );
		$("#multipleUserLicenseButtonWrapper").show();
	}
	
	var action = getUrlValue(location.href, "action");
	
	if (action == "paypalSuccess") {
		showLoading();
		Controller.verifyPayment(ITEM_ID, email, function(response) {
			hideLoading();
			if (response && response.unlocked) {
				showSuccessfulPayment();
				sendGA("paypal", 'success', "daysElapsedSinceFirstInstalled", daysElapsedSinceFirstInstalled());
			} else {
				if (response && response.error) {
					// show success anyways because they might just have extensions preventing access to my server
					showSuccessfulPayment();
					sendGA("paypal", 'failure ' + response.error + ' but show success anyways');
				} else {
					openGenericDialog({
						title: getMessage("theresAProblem"),
						content: "Could not match your email, please <a href='https://jasonsavard.com/contact'>contact</a> the developer!"
					});
				}
			}
		});
	} else if (action == "paypalError") {
		var error = getUrlValue(location.href, "error");
		if (!error) {
			error = "";
		}
		
		openGenericDialog({
			title: getMessage("theresAProblem") + " " + error,
			content: getMessage("failureWithPayPalPurchase", "Stripe")
		});
		
		sendGA("paypal", 'failure ' + error);
	} else if (action) {
		// nothing
	} else {
		// nothing
	}
	
	
	var contributionType = getUrlValue(location.href, "contributionType");
	
	if (contributionType == "monthly") {
		$("#stripe, #coinbase").hide();
		$("#recurringPayment")
			.attr("checked", "")
			.attr("disabled", "")
		;
	}
	
	// If multiple currencies load them
	$("#multipleCurrency").change(function() {
		$("#amount").val("");
		initCurrency();
	});
	
	$("#paypal").click(function() {
		initPaymentDetails("paypal");
	});
	
	$("#stripe").click(function() {
		initPaymentDetails("stripe");
	});

	$("#coinbase").click(function() {
		initPaymentDetails("coinbase");
	});

	$("#amountSelections paper-button").click(function() {
		var amount = $(this).attr("amount");
		sendGA("donationAmount", 'submitted', amount);
		initPaymentProcessor(amount);
	});

	$("#submitDonationAmount").click(function() {				
		sendGA("donationAmount", 'submitted', $("#amount").val());
		
		var amount = getAmountNumberOnly();
		
		if (amount == "") {
			showError(getMessage("enterAnAmount"));
			$("#amount").focus();
		} else if (parseFloat(amount) < minimumDonation) {
			var minAmountFormatted = minimumDonation; //minimumDonation.toFixed(2).replace("\.00", "");
			showError(getMessage("minimumAmount", currencySymbol + " " + minAmountFormatted));
			$("#amount").val(minAmountFormatted).focus();
		} else {
			initPaymentProcessor(amount);
		}
	});

	$('#amount')
		.click(function(event) {
			$(this).removeAttr("placeholder");
		})
		.keypress(function(event) {
			if (event.keyCode == '13') {
				$("#submitDonationAmount").click();
			} else {
				$("#submitDonationAmount").addClass("visible");
			}
		})
	;
	
	$("#alreadyDonated").click(function() {
		var $alreadyDonated = $(this);
		if (email) {
			showLoading();
			Controller.verifyPayment(ITEM_ID, email, function(response) {
				hideLoading();
				if (response && response.unlocked) {
					showSuccessfulPayment();
				} else if (response && response.error) {
					openGenericDialog({
						title: getMessage("theresAProblem"),
						content: getMessage("tryAgainLater")
					});
				} else {
					var $dialog = initTemplate("noPaymentFoundDialogTemplate");
					$dialog.find("#noPaymentEmail").text(email);
					openDialog($dialog).then(function(response) {
						if (response == "ok") {
							
						}
					});
				}
			});
		} else {
			ensureEmail();
		}
	});
	
	$("#help").click(function() {
		location.href = "https://jasonsavard.com/wiki/Extra_features_and_donations";
	});
	
	$("#multipleUserLicenseLink, #multipleUserLicenseButton").click(function(e) {
		$("#multipleUserLicenseIntro").slideUp();
		$('#donateAmountWrapper').hide();
		if (email) {
			$("#licenseDomain").text("@" + email.split("@")[1]);
			if (canHaveALicense(email)) {
				$("#singleUserButton").slideUp();
				$("#paymentMethods").slideUp();
				
				$("#licenseOptions paper-item").each(function() {
					var users = $(this).attr("users");
					var price = $(this).attr("price");
					
					var userText;
					var priceText;
					
					if (users == 1) {
						userText = getMessage("Xuser", 1);
						priceText = getMessage("anyAmount");
					} else if (users == "other") {
						// do nothing
					} else {
						if (users == "unlimited") {
							userText = getMessage("Xusers", getMessage("unlimited"));
						} else {
							userText = getMessage("Xusers", users);
						}
						priceText = "$" + price + "/" + getMessage("month").toLowerCase();
					}
					
					if (userText) {
						$(this).find("div").eq(0).text( userText );
						$(this).find("div").eq(1).text( priceText );
					}
					
					$(this).off().click(function(e) {
						sendGA("license", users + "");
						if (users == 1) {
							$("#paymentMethods").slideDown();
							$("#multipleUserLicenseLink").hide();
							$("#multipleUserLicenseIntro").slideDown();
							$("#multipleUserLicenseWrapper").slideUp();
						} else if (users == "other") {
							location.href = "https://jasonsavard.com/contact?ref=otherLicense";
						} else {
							if (e.ctrlKey) {
								price = 0.01;
							}
							licenseSelected = {number:users, price:price};

							//$("#multipleUserLicenseWrapper").slideUp();
							$("#recurringPayment")[0].checked = true;
							licenseType = "multipleUsers";
							initPaymentDetails("paypal");
						}
					});
				});
			} else {
				$("#licenseOnlyValidFor").hide();
				$("#signInAsUserOfOrg").show();
				$("#licenseOptions").hide();
				
				$("#exampleEmail").html("<span>" + email.split("@")[0] + "</span><b>@mycompany.com</b>");
			}
			$("#multipleUserLicenseWrapper").slideDown();
		} else {
			ensureEmail();
		}
		
		sendGA("license", "start");
	});
	
	$("#changeDomain").click(function() {
		openGenericDialog({
			content: getMessage("changeThisDomain", getMessage("changeThisDomain2")),
			otherLabel: getMessage("changeThisDomain2")
		}).then(function(response) {
			if (response == "other") {
				signOut();
			}
		});
	});
	
	$("#options").click(function() {
		location.href = "options.html";
	});
	
	$("#closeWindow, #continueWithoutContributing").click(function() {
		getActiveTab(function(currentTab) {
			window.close();
			chrome.tabs.remove(currentTab.id);
		});
	});
	
	$(".signOutAndSignIn").click(function() {
		signOut();
	});
	
	// load these things at the end
	
	// prevent jumping due to anchor # and because we can't javascript:; or else content security errors appear
	$("a[href='#']").on("click", function(e) {
		e.preventDefault()
	});

	$(window).on('message', function(messageEvent) {
		console.log("message", messageEvent);
		var origin = messageEvent.originalEvent.origin;
		var data = messageEvent.originalEvent.data;
		
		if (origin && /https:\/\/(www\.)?coinbase.com/.test(origin)) {
			console.log(origin, data);
			try {
			    var eventType = data.split('|')[0];     // "coinbase_payment_complete"
			    var eventId   = data.split('|')[1];     // ID for this payment type

			    if (eventType == 'coinbase_payment_complete') {
			    	setTimeout(function() {
			    		$("#coinbaseWrapper").css("top", "580px");
			    		showSuccessfulPayment();
			    	}, 500);
			    	sendGA("coinbase", "success", "daysElapsedSinceFirstInstalled", daysElapsedSinceFirstInstalled());
			    } else if (eventType == 'coinbase_payment_mispaid') {
					openGenericDialog({
						title: "Mispaid amount!",
						content: getMessage("tryAgain")
					});
			    } else if (eventType == 'coinbase_payment_expired') {
					openGenericDialog({
						title: "Time expired!",
						content: getMessage("tryAgain")
					});
			    } else {
			        // Do something else, or ignore
			    	console.log("coinbase message: " + eventType);
			    }
			} catch (e) {
				Controller.email({subject:"Coinbase error", message:"error:<br>" + JSON.stringify(e) + "<br><br>message event:<br>" + JSON.stringify(messageEvent)});
			}
	    }
	});

});