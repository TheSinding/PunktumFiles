chrome.notifications.onButtonClicked.addListener(function(a,b){if(-1<a.indexOf("generic-notif-")){var c="https://mightytext.net/"+currentProductionPath+"#promo=true";a.indexOf("-msg-send-quota")&&(c+="&feature-id=crx-msg-send-quota");chrome.notifications.clear(a);chrome.tabs.create({url:c},function(a){console.log(a)})}else if(-1<a.indexOf("reminder"))0===b&&(chrome.notifications.clear(a),_536b4ed41cf80f93f41ddef879547803bc18716d({notif_id:a}));else if(0==a.indexOf("notif-battery-"))_8e2f3e9ac0de43491cf581131b760a727ab022da(b);
else{if(-1<a.indexOf("device-notification-")){var d=a.replace("device-notification-",""),c=deviceNotifManagerArray[d].package_name,e=deviceNotifManagerArray[d].id,g="null";void 0!=deviceNotifManagerArray[d].original_object.tag&&(g=deviceNotifManagerArray[d].original_object.tag);console.log({id:a,globalNotifDataObj:deviceNotifManagerArray[d]});0==b?(_2d93a68349cd066baf704fbe73e5e14791cd47fc(c,g,e),_gaq.push(["_trackEvent","CRX","Device-Notif-Click-Option","dismiss-this-notif"]),"k"==google_username_currently_logged_in.charAt(0)&&
_kmq.push(["record","Device-Notif-Click-Option-Letter-K",{"Package-Name":c,Client:"CRX",Action:"dismiss-this-notif"}])):1==b&&(_8cb4e26a7ff7d6c686c79f439e782ac85bfe3405("../html/phone_notifs_options.html#notif_object_key="+d,c),_gaq.push(["_trackEvent","CRX","Additional-Device-Notif-Invoke",c]),"k"==google_username_currently_logged_in.charAt(0)&&_kmq.push(["record","Additional-Device-Notif-Invoke-Letter-K",{"Package-Name":c,Client:"CRX"}]));chrome.notifications.clear(a,function(c){console.log({notif_cleared:c,
notif_cleared_id:a,before_splice:deviceNotifManagerArray});0==b&&delete deviceNotifManagerArray[d];console.log({post_splice:deviceNotifManagerArray})});return!1}0==b?(console.log(a),_gaq.push(["_trackEvent","CRX-Background","Notif-Click","Reply-Button-Action"]),_07480d94799ca53d6fce668421c1feefd9fa0bd7(a)):1==b&&chrome.notifications.clear(a,function(b){
	
	b&&(10==globalNewNotifMetadata[a].type||20==globalNewNotifMetadata[a].type?"exp-flag-not-set"!=$.jStorage.get("mt_reminders_experiment","exp-flag-not-set")?
_536b4ed41cf80f93f41ddef879547803bc18716d({mode:"incoming-msg-snooze",notif_id:a}):_e1a5406c4e143f4e648d54053662ecdf83c09d2f({notif_id:a}):11==globalNewNotifMetadata[a].type||21==globalNewNotifMetadata[a].type?(_5b4255f01fdbc387d11c15bf9fb8bce5a512d411(a),_gaq.push(["_trackEvent","CRX-Background","Notif-Click","MMS-Picture-Enlarge-Button-Action"])):80==globalNewNotifMetadata[a].type?(_a0419897fdd53067666b8229e0b075f897d959ca("end_call","not-needed")):81==globalNewNotifMetadata[a].type&&_e1a5406c4e143f4e648d54053662ecdf83c09d2f({notif_id:a}))
})}});
chrome.notifications.onClicked.addListener(function(a){-1<a.indexOf("msg-send-quota")&&(chrome.notifications.clear(a,function(a){}),chrome.tabs.create({url:"https://mightytext.net/send-limit-oct-2015"},function(){}));if(!(-1<a.indexOf("reminder"))){if("user_logged_in"==a||-1<a.indexOf("housead"))return!1;if(-1<a.indexOf("user_disabled_notifs"))chrome.tabs.create({url:"../html/options.html"},function(){console.log("created tab opening MT settings")}),chrome.notifications.clear(a,function(b){console.log("crx update notif: "+
a+" cleared?: "+b)});else if(-1<a.indexOf("message-send-failure")){var b=a.replace("message-send-failure-",""),c=globalNewNotifMetadata[b].phone_num_clean;_4ab610f6f5a39cf4104153b37d680ad65904ff84("https://mightytext.net/"+currentProductionPath+"/#mode=quick&msgid="+b+("&thread_id="+c),c)}else if("user_not_logged_in"==a)_0d334d53f31eb4e9231e7bb5209b11e3931c34b9();else if("user-install-android-app"==a)window.open("http://mightytext.net/install"),_501841532e653ca08fe8590565cf915540b3a799(a,500);else{if("news_notif_15.0"==
a)return chrome.tabs.create({url:"http://mightytext.net/crx-v15-updates"},function(){console.log("created tab opening MT blog")}),chrome.notifications.clear(a,function(b){console.log("crx update notif: "+a+" cleared?: "+b)}),_gaq.push(["_trackEvent","CRX",a,"Click"]),!1;b="unknown";globalNewNotifMetadata.hasOwnProperty(a)&&(b=globalNewNotifMetadata[a].type);-1<a.indexOf("-picture")||81==b||80==b||(_07480d94799ca53d6fce668421c1feefd9fa0bd7(a),_gaq.push(["_trackEvent","CRX-Background","Notif-Click",
"Reply-Click-On-Notif-Itself"]))}}});chrome.notifications.onClosed.addListener(function(a,b){$.jStorage.deleteKey("locked-notif-"+a);if(!(-1<a.indexOf("-picture"))&&0!=a.indexOf("notif-battery-"))if(0==a.indexOf("device-notification-")){var c=a.replace("device-notification-","");b&&delete deviceNotifManagerArray[c]}else globalNewNotifMetadata.hasOwnProperty(a)&&b&&_e55eb24c8d2a85296a8c1e30c65e548af94af8f1(globalNewNotifMetadata[a].body,globalNewNotifMetadata[a].phone_num_clean)});
function _536b4ed41cf80f93f41ddef879547803bc18716d(a){if("undefined"!=typeof a&&a.hasOwnProperty("notif_id")){var b=globalNewNotifMetadata[a.notif_id],c="snooze";a.hasOwnProperty("mode")&&(c=a.mode);a=remindersAppUrl+"#mode="+c;"snooze"==c?a+="&token_id="+b.token_id+"&cb_url="+b.callback_url+"&name="+b.name:"incoming-msg-snooze"==c&&(a+=_71605673851714dcf23dba5ca7db0c6b6e96be13({message:b}),_e55eb24c8d2a85296a8c1e30c65e548af94af8f1(b.body,b.phone_num_clean));var b=260,d=333;
/*
"incoming-msg-snooze"==
c&&(b=540,d=389);
*/

if(c == "incoming-msg-snooze"){
    var chromeAppVersion = window.navigator.appVersion,
	    b = 557,
	    d = 404;

    if(chromeAppVersion.indexOf("Macintosh") > -1){
	    b = 540;
	    d = 389;
    }
}

chrome.windows.create({url:a,left:screen.width-(b+7),top:7,width:b,height:d,focused:!0,type:"popup"},function(a){console.log("quick reply window created!");console.log(a)})}}
function _71605673851714dcf23dba5ca7db0c6b6e96be13(a){var b="&";if("undefined"!=typeof a&&a.hasOwnProperty("message")){var c=a.message,d=a="";c.hasOwnProperty("body")&&(a+=c.body);if(c.hasOwnProperty("phone_num_clean")&&c.hasOwnProperty("phone_num")){d="";if(10==c.type)d+=_8b6cdd1c24c701cbeb68fb56e089b3c6394b3079(c.phone_num_clean,c.phone_num);else if(20==c.type)var e=_c946a43efaeeff1db0cbd3d34b30541e024cff09(c.content_author,!0),d=d+_8b6cdd1c24c701cbeb68fb56e089b3c6394b3079(e,c.content_author);else d=
"";50<d.length&&(d=d.substr(0,46)+"...",_kmq.push(["record","CRX-Incoming-Message-Reminder-Contact-Name-Ellipsis"]));c=197-d.length;a.length>c&&(a=a.substring(0,c-4)+"...",_kmq.push(["record","CRX-Incoming-Message-Reminder-Msg-Body-Ellipsis"]))}b+="name="+encodeURIComponent(""+(a+" - "+d))}return b}
function _4ab610f6f5a39cf4104153b37d680ad65904ff84(a,b){b=String(b);chrome.tabs.query({url:"https://mightytext.net/*"},function(c){console.log(c);console.log(b);0<c.length?$(c).each(function(d,e){if(-1<e.url.indexOf(b))return chrome.windows.update(e.windowId,{focused:!0},function(){console.log("found an existing QR window with this thread id")}),!1;c.length==d+1&&_97ae8fe894ad1c61f4c7dd6f15cd5dbce1efe767(a)}):_97ae8fe894ad1c61f4c7dd6f15cd5dbce1efe767(a)})}
function _9d18e6dba05d2e28bc75635fed848e7124bd5799(a){var b=new Date;b.getHours();b.getMinutes();
	
// 	-1==globalNewNotifMetadata[a].body.indexOf("reminded")&&(globalNewNotifMetadata[a].body=globalNewNotifMetadata[a].body+" \r\n\r\n("+chrome.i18n.getMessage("first_reminded")+" "+_812b2a0c09b1f74c11e19ddcc0526ef4b39ec299(b,!1)+")");
//new logic to pass only the first reminded at content for a "Reminded" missed call
if (globalNewNotifMetadata[a].body.indexOf(chrome.i18n.getMessage("first_reminded")) == -1){
	var firstRemindDateStr = '(' + chrome.i18n.getMessage("first_reminded") + ' ' + _812b2a0c09b1f74c11e19ddcc0526ef4b39ec299(b,!1) + ')';
	
	if(globalNewNotifMetadata[a].type == 81){
		globalNewNotifMetadata[a].body = firstRemindDateStr
	} else {
		globalNewNotifMetadata[a].body=globalNewNotifMetadata[a].body + ' \r\n\r\n'+firstRemindDateStr;
	}
}
if(globalNewNotifMetadata[a].type == 81){//passing an additional property for a "Reminded" missed call notif
	globalNewNotifMetadata[a].missed_call_reminder = true;
} else {
	globalNewNotifMetadata[a].msg_reminder = true;
}
	
a='{"new_content":'+JSON.stringify(globalNewNotifMetadata[a],null,2)+"}";_8f84d15bdb04c2084c555ca8148a7c4eaa6b0976(a)}
function _8e2f3e9ac0de43491cf581131b760a727ab022da(a){chrome.tabs.create({url:"html/options.html",active:!0})}function _5b4255f01fdbc387d11c15bf9fb8bce5a512d411(a){globalNewNotifMetadata[a].enlargeMMSMode=1;a='{"new_content":'+JSON.stringify(globalNewNotifMetadata[a],null,2)+"}";_8f84d15bdb04c2084c555ca8148a7c4eaa6b0976(a)}
function _97ae8fe894ad1c61f4c7dd6f15cd5dbce1efe767(a){var b,c;-1<a.indexOf("quick-reply")?(_gaq.push(["_trackEvent","Background","CRX-Rebuild-Legacy-Should-Not-Trigger","Old-Quick-Reply-Opened"]),b=400,c=520):(b=_6f768b7a69ef61485a57246ae5a11b6cf9334fb3(),c=600);chrome.windows.create({url:a,left:screen.width-(b+7),top:0,width:b,height:c,focused:!0,type:"popup"},function(a){console.log("quick reply window created!");console.log(a)})}
function _07480d94799ca53d6fce668421c1feefd9fa0bd7(a){chrome.notifications.clear(a,function(a){});var b,c;


-1<a.indexOf("-picture")?(
//passing the message id instead of phone num in the URL of the QR window because group mms pic replies were broken.
c=a.replace("-picture",""),b="https://mightytext.net/"+currentProductionPath+"/#mode=quick&msgid="+globalNewNotifMetadata[c].id,c=globalNewNotifMetadata[c].phone_num_clean

):(80==globalNewNotifMetadata[a].type||81==globalNewNotifMetadata[a].type?b="https://mightytext.net/"+currentProductionPath+"/#mode=quick&num="+globalNewNotifMetadata[a].phone_num:(b="https://mightytext.net/"+
currentProductionPath+"/#mode=quick&msgid="+globalNewNotifMetadata[a].id,console.log(globalNewNotifMetadata[a])),c=globalNewNotifMetadata[a].phone_num_clean);_4ab610f6f5a39cf4104153b37d680ad65904ff84(b+("&thread_id="+c),c);_e55eb24c8d2a85296a8c1e30c65e548af94af8f1(globalNewNotifMetadata[a].body,globalNewNotifMetadata[a].phone_num_clean)}
function _e55eb24c8d2a85296a8c1e30c65e548af94af8f1(a,b){a=unescape(a);var c=b+"|"+a;console.log("attempting to mark message read on phone: "+a+"---  "+b);_a0419897fdd53067666b8229e0b075f897d959ca("mark_single_message_read",c,"msgid_local - not needed actually")}function _6f768b7a69ef61485a57246ae5a11b6cf9334fb3(){return windowWidth=-1<window.navigator.appVersion.indexOf("Macintosh")?500:516}
function _7090fdea2e3abbf2c7d2451d174f3d9835681edf(){if("1"==$.jStorage.get("crx_force_reload_no_signed_out_notif"))return!1;var a={type:"basic",title:chrome.i18n.getMessage("not_signed_in_title"),message:chrome.i18n.getMessage("notif_signed_in_content"),iconUrl:"../img/48x48_MT_logo_boom_gradient_white.png",priority:2};chrome.notifications.create("user_not_logged_in",a,function(a){console.log("created user_not_logged_in notif with the ID: "+a);$.jStorage.set("crx_force_reload_no_signed_out_notif",
"1",{TTL:globalMsUntilShowNotLoggedInNotifAgain});_a0b818d8a313f49406787ab60651b5d5970bed28(a);_501841532e653ca08fe8590565cf915540b3a799(a,3E4)})}function _8cb4e26a7ff7d6c686c79f439e782ac85bfe3405(a,b){chrome.windows.create({url:a,left:screen.width-370,top:0,width:356,height:134,focused:!0,type:"popup"},function(a){console.log(a)})}
function _d11112ea78860908573947206b8187394049cba4(a){var b=a.package_name,c="app_notif_icon|"+b,d=$.jStorage.get(c);if(d)_f562889c80ee34cafe44ace54cf1228f33e7185d(a,d);else{var e="../img/notifications/OS_Android.png";$.ajax({type:"GET",url:"https://mightytext.co:5001/?function=getsingleappinfo&appId="+encodeURIComponent(b),dataType:"text",timeout:3E3,success:function(b){b=JSON.parse(b);console.log(b);b.iconURL&&("url_not_found"!=b.iconURL&&("play_store_listing_not_found"==b.iconURL?$.jStorage.set(c,
e,{TTL:6048E5}):(e=b.iconURL,$.jStorage.set(c,e,{TTL:12096E5}))),_f562889c80ee34cafe44ace54cf1228f33e7185d(a,e))},error:function(b){_439fc287471807456f79b1fd2d9ee4f7a7e1e6fc("error in _d11112ea78860908573947206b8187394049cba4","red");_f562889c80ee34cafe44ace54cf1228f33e7185d(a,e,chromeNotifKey)}})}}
function _f562889c80ee34cafe44ace54cf1228f33e7185d(a,b){0===b.indexOf("//")&&(b="https:"+b);var c="";a.app_name&&(c=a.app_name);var d="";a.ticker_text&&(d=a.ticker_text);var e="";a.data&&a.data["android.title"]&&(e=a.data["android.title"]);var g=c,k="";0<e.length&&(k=e);var f="",c="";a.data&&a.data["android.text"]&&(f=c=a.data["android.text"]);if(1>e.length||1>c.length)f=d,0<c.length&&(f+="\n"+c);a.data&&a.data["android.textLines"]&&(f+="\n"+a.data["android.textLines"]);c=a.app_name;k==f&&(f="");
console.log(b);var h={type:"basic",title:g,message:k+"\n"+f,priority:2,eventTime:Date.now(),buttons:[{title:chrome.i18n.getMessage("dismiss_notif_on_phone"),iconUrl:"../img/notifications/red_folder_stop.png"},{title:chrome.i18n.getMessage("phone_app_notif_more_options"),iconUrl:"../img/notifications/block_icon.png"}]},d=new XMLHttpRequest;d.open("GET",b);d.responseType="blob";d.onload=function(){h.iconUrl=window.URL.createObjectURL(this.response);_62b49e89889707a4721c7c934eab6156ba9fa517(h,a)};d.timeout=
2E3;d.ontimeout=function(){h.iconUrl="../img/notifications/OS_Android.png";_62b49e89889707a4721c7c934eab6156ba9fa517(h,a)};d.send(null)}function _2d93a68349cd066baf704fbe73e5e14791cd47fc(a,b,c){_a0419897fdd53067666b8229e0b075f897d959ca("cancel_single_device_notification",a+"|"+b+"|"+c)}
function _62b49e89889707a4721c7c934eab6156ba9fa517(a,b){chrome.notifications.create("device-notification-"+b.ts_post,a,function(c){var d=String(b.ts_post);console.log({data:b.ts_post,device_notif_created:!0,key:d,obj:deviceNotifManagerArray[d]});deviceNotifManagerArray[d].app_img_url=a.iconUrl;deviceNotifManagerArray[d].app_notif_message=a.message;10>Math.floor(100*Math.random())&&_gaq.push(["_trackEvent","CRX","Device-Notif-Invoke-Sample-10pct",b.package_name]);"k"==google_username_currently_logged_in.charAt(0)&&
_kmq.push(["record","Device-Notif-Invoke-Letter-K",{"Package-Name":b.package_name,Client:"CRX"}]);_a0b818d8a313f49406787ab60651b5d5970bed28(c);_501841532e653ca08fe8590565cf915540b3a799(c,6E5)})}
function _febb6c6040887d157cd695954bfb71fab2118579(){var a={type:"basic",priority:2,title:chrome.i18n.getMessage("capi_js_load_error_title"),message:chrome.i18n.getMessage("capi_js_load_error_content"),contextMessage:chrome.i18n.getMessage("capi_js_load_error_context_msg"),iconUrl:"../img/notifications/error_icon.png"};chrome.notifications.create("unable-to-load-channeljs-lib",a,function(a){console.log('just created a notif with the ID: "'+a+'"');_a0b818d8a313f49406787ab60651b5d5970bed28(a);_501841532e653ca08fe8590565cf915540b3a799(a,
2E4)})}
function _ce03771a5f5e428efc4b664ea4bfbdc9d0621070(){var a={type:"basic",priority:2,title:chrome.i18n.getMessage("contacts_refresh_title"),message:chrome.i18n.getMessage("contacts_refresh_content"),iconUrl:"../img/notifications/contact_photos_refreshed.png"};chrome.notifications.create("latest-contacts-refreshed-from-phone",a,function(a){_a0b818d8a313f49406787ab60651b5d5970bed28(a);_gaq.push(["_trackEvent","CRX-Background","Contacts-Refreshed-From-Phone",""]);console.log('just created a notif with the ID: "'+a+
'"');_501841532e653ca08fe8590565cf915540b3a799(a,6E4)})}function _6bf189124faff0c33d9166442d2a08edd26b21b7(a,b){chrome.idle.queryState(globalSystemIdleStatusThresholdInSeconds,function(c){_439fc287471807456f79b1fd2d9ee4f7a7e1e6fc('Current system state: "'+c+'"',"purple");_930bd7678a603d2e448373d2db36c336f42875bf(a,c,b)})}
function _930bd7678a603d2e448373d2db36c336f42875bf(a,b){"locked"==b&&(_439fc287471807456f79b1fd2d9ee4f7a7e1e6fc("Current system state is locked at: "+new Date+", setting removing this notification (ID): "+a+" in 3 minutes","purple"),_501841532e653ca08fe8590565cf915540b3a799(a,18E4))}
function _a0b818d8a313f49406787ab60651b5d5970bed28(a){chrome.idle.queryState(globalSystemIdleStatusThresholdInSeconds,function(b){_439fc287471807456f79b1fd2d9ee4f7a7e1e6fc('Current system state: "'+b+'"',"purple");"locked"==b&&(b=(new Date).getTime(),$.jStorage.set("locked-notif-"+a,b,{TTL:864E5}))})}
function _6b949d6799f3b4ce228c7e5022ab6a379f3d16ef(){_439fc287471807456f79b1fd2d9ee4f7a7e1e6fc("Checking to see if there are any notifications that were created while the system was locked.","#3D4C87");chrome.notifications.getAll(function(a){console.log(a);$.each(a,function(a,c){var d=$.jStorage.get("locked-notif-"+a,"locked-notif-not-found");_439fc287471807456f79b1fd2d9ee4f7a7e1e6fc("This is the ID of a notification created by the CRX:","#3D4C87");console.log(a);if("locked-notif-not-found"!=d){var d=
parseInt(d),e=((new Date).getTime()-d)/1E3;_439fc287471807456f79b1fd2d9ee4f7a7e1e6fc("This is the ID of a notification created by the CRX while system was LOCKED:","#3D4C87");console.log({ts_locked_notif:d,time_since_locked_notif:e});600<e&&chrome.notifications.clear(a,function(c){c&&_439fc287471807456f79b1fd2d9ee4f7a7e1e6fc("successfully cleared a notif id: "+a,"#3D4C87")})}})})}
function _e1a5406c4e143f4e648d54053662ecdf83c09d2f(a){
	
	if("undefined"!=typeof a&&a.hasOwnProperty("notif_id")){var b=a.notif_id;-1<globalNewNotifMetadata[b].body.indexOf("reminded")?(_gaq.push(["_trackEvent","CRX-Background","Notif-Click","Snooze-Button-Action-REPEAT"]),_kmq.push(["record","Snooze-Message-Notif-Click-Repeat",{Client:"CRX"}])):(
	
	_gaq.push(["_trackEvent","CRX-Background","Notif-Click","Snooze-Button-Action-INITIAL"]),_kmq.push(["record","Snooze-Message-Notif-Click-Initial",{Client:"CRX"}]),recordNewLegacySnoozeKMEventBasedOnUserName()
	
);
setTimeout(function(){_9d18e6dba05d2e28bc75635fed848e7124bd5799(b)},3E5)}

};

function recordNewLegacySnoozeKMEventBasedOnUserName(){

	if(typeof google_username_currently_logged_in != "undefined"){
		var firstLetterOfUserEmail = google_username_currently_logged_in.charAt(0),
			letterToSearchFor = "k";

		if(firstLetterOfUserEmail == letterToSearchFor){//1 in 10 chance
			_kmq.push(['record', 'snooze-message-notif-click-initial-letter-' + letterToSearchFor, {Client:"CRX"}]);
		}
		
	}
	
}