function _2f7f0c74c32dc03ecd483d6800d88c641e98cbfe(){_84ddee4a4811cee9b664c8e88337b445c59d14b8("CRX","Popup-Menu-Invoke");_39ad02de4cf2c92b012f6526ae3f58327b310020("Popup-Menu-Invoke",{Client:"CRX"});_39ad02de4cf2c92b012f6526ae3f58327b310020("CRX-Rebuild-Popup-Menu-Invoke",{Client:"CRX"});$(".popupButton").on("click",function(){var a=$(this).data("message"),b=$(this).data("event"),c={},d=null;c[a]=!0;if("Send-To-Phone"==b||"Compose-New"==b)d="link","Send-To-Phone"==b&&(d=$(this).data("type"));_39ad02de4cf2c92b012f6526ae3f58327b310020("Popup-Menu-Click-Option",
{"Content-Type":d,Client:"CRX",Action:b});_84ddee4a4811cee9b664c8e88337b445c59d14b8("CRX","Popup-Menu-Click-Option",b+"-link");"setReminder"==a?_684b953e0f921960c16f0855ae7d1defcd9da07c():"openPhoneLive"==a?_de07470e88369a540d0256713930ae65d4f47059():"openPhoneDialer"==a?_de07470e88369a540d0256713930ae65d4f47059({view:"dialer"}):(chrome.runtime.sendMessage(c,function(a){console.log(a)}),window.close())});$(".phone-tab-shortcut").on("click",function(a){a.stopPropagation();a=$(this).attr("data-view");
var b=$(this).closest(".popupButton").attr("data-event");_39ad02de4cf2c92b012f6526ae3f58327b310020("Popup-Menu-Click-Option",{"Content-Type":"link",Client:"CRX",Action:b});_84ddee4a4811cee9b664c8e88337b445c59d14b8("CRX","Popup-Menu-Click-Option",b+"-link");_84ddee4a4811cee9b664c8e88337b445c59d14b8("CRX","Popup-Menu-Click-Live-Phone-View-Shortcut-Option",a);_de07470e88369a540d0256713930ae65d4f47059({view:a})});$(".nav-btn").on("click",function(a){a.preventDefault();a.stopPropagation();var b=$(this).attr("action"),
c,d;"settings"==b?(c=".popupContainer, .settings-btn, .notif-toggle",d=".settings-iframe",$(d).attr("src"),$(d).attr("src","").attr("src","../html/options.html")):"home"==b&&(c=".settings-iframe",d=".popupContainer, .settings-btn, .notif-toggle",_4b35f59beeca2363a7ba7f1aecd2e3860fc24a38());$(c).fadeOut(150,function(){$(d).fadeIn(250);$(".nav-buttons").attr("data-inview",b)})});_5681a2df4cae19e8213f18f7e80d32926702a163({strings_elem:$(".popup-option-name, .mighty-tooltip"),additional_callback:function(a){$(a).hasClass("new-feature")&&
_eb482d59632209ff20d47b65e0dfd9a9d0d32bc3({popup_option:a})}});$("body").attr("lang",navigator.language);_6142d65c3ddd3fff92f1221e26ff35e617eacbab();_225abb3732226ebee17cff23ab5d05e67d97f376();_4b35f59beeca2363a7ba7f1aecd2e3860fc24a38(!0);_7b3262e31498ad3802839eeea171a1e6e3dd0043();_92dbcc8e5f6bc759c2af95d27a65b08dd93d3674();_8c88507f7c40b259265dda86ec9e81a124ed0f7e()}
function _edbabe332d8432b1270f538e14cc802201717453(){var a=!1;window.localStorage.hasOwnProperty("current_phone_app_version")&&6.85<=parseFloat(window.localStorage.current_phone_app_version)&&(a=!0);return a}function _225abb3732226ebee17cff23ab5d05e67d97f376(){if(_edbabe332d8432b1270f538e14cc802201717453()){var a=$("#livePhoneView");$(a).show()}}
function _6142d65c3ddd3fff92f1221e26ff35e617eacbab(){"user-in-exp"==$.jStorage.get("mt_reminders_experiment","exp-flag-not-set")&&($('<iframe class="reminders-iframe" src=""></iframe>').appendTo("body"),$("#reminderButtons").show())}
function _de07470e88369a540d0256713930ae65d4f47059(a){var b="notifs";$(".popupContainer, .settings-btn, .notif-toggle").hide();$("body").addClass("loading-pnlv");"undefined"!=typeof a&&a.hasOwnProperty("view")&&(b=a.view);var c=$('<iframe class="phone-live-view-iframe" src="https://mightytext.net/'+currentProductionPath+"/#mode=live-phone-view&client=crx-popup&view="+b+'"></iframe>').appendTo("body"),d;d=setTimeout(function(){_39ad02de4cf2c92b012f6526ae3f58327b310020("new-pnlv-wa-iframe-timeout-executed");
_e7396ea9a71034ae636409bb4ec73ddefb32c995({iframe:c});$("body").removeClass("loading-pnlv")},1E4);window.addEventListener("message",function(a){_bad503fec229686d06c3d9d88fcdea4425758f14(a,d)});"notifs"==b&&_db0fe9340ed151b7ba232bcbfc28380e3892dead()}
function _e7396ea9a71034ae636409bb4ec73ddefb32c995(a){a=a.iframe;var b=$(a).attr("src"),c;c='<div class="load-error-container"><div class="vertical-align-helper"></div><div class="load-error-inner"><i id="load-error-icon" class="fa fa-fw fa-times-circle"></i>'+chrome.i18n.getMessage("unable_to_load_mt_iframe");c+='<div class="refresh-btn-wrapper"><button id="refresh-iframe-btn" class="mighty-btn mighty-holo">'+chrome.i18n.getMessage("retry")+"</button></div>";var d=$(c+"</div></div>").insertAfter(a);
$(a).remove();a=$(d).find("#refresh-iframe-btn");$(a).on("click",function(){_39ad02de4cf2c92b012f6526ae3f58327b310020("new-pnlv-wa-iframe-timeout-retry-load");$(d).fadeOut(function(){$(this).remove();var a={};-1<b.indexOf("dialer")&&(a={view:"dialer"});_de07470e88369a540d0256713930ae65d4f47059(a)})})}
function _bad503fec229686d06c3d9d88fcdea4425758f14(a,b){if("https://mightytext.net"==a.origin){var c=a.data;c.hasOwnProperty("check_for_existing_pnlv_popout")?_58dac90a4c4c9cebacc0063208d839303fd84e73({focus_existing:!0,popout_if_none_found:!0,pnlv_popout_url_sub_str:c.pnlv_popout_url_substring,viewOnLoad:c.view}):c.hasOwnProperty("expand_window")?1!=c.expand_window?$("body").removeClass("send_file_to_phone_expand"):$("body").addClass("send_file_to_phone_expand"):c.hasOwnProperty("live_phone_view_load_success")?
(clearTimeout(b),$(".phone-live-view-iframe").show(),$("body").removeClass("loading-pnlv")):console.error(new Date+" Unrecognized message sent from mt.net",c)}else console.error("unrecognized message origin: ",a.origin)}
function _58dac90a4c4c9cebacc0063208d839303fd84e73(a){var b=a.pnlv_popout_url_sub_str,c=b;a.hasOwnProperty("viewOnLoad")&&(c+="&view="+a.viewOnLoad);chrome.tabs.query({windowType:"popup"},function(d){0<d.length?$(d).each(function(d,f){f.hasOwnProperty("url")?-1<f.url.indexOf(b)&&a.hasOwnProperty("focus_existing")?f.hasOwnProperty("windowId")&&chrome.windows.update(f.windowId,{focused:!0}):a.hasOwnProperty("popout_if_none_found")&&_67382d5422208b2ec7d359dfc3d817bc721dc18b({url:c}):console.error(new Date+
' No "url" property found in this tab object')}):a.hasOwnProperty("popout_if_none_found")&&_67382d5422208b2ec7d359dfc3d817bc721dc18b({url:c})})}function _67382d5422208b2ec7d359dfc3d817bc721dc18b(a){if(a.hasOwnProperty("url")){var b=a.url,c=screen.width-357,d=39;-1<navigator.appVersion.indexOf("Mac")&&(d=22);d=600+d;console.info("trying to create a window, options: ",a);chrome.windows.create({width:350,height:d,focused:!0,left:c,type:"popup",url:b+"&client=crx-popout"})}}
function _db0fe9340ed151b7ba232bcbfc28380e3892dead(){chrome.runtime.sendMessage({user_loaded_phone_notif_live_view:!0})}function _684b953e0f921960c16f0855ae7d1defcd9da07c(){$(".reminders-iframe").attr("src","").attr("src",remindersAppUrl+"#mode=create").on("load",function(){$(".popupContainer, .settings-btn, .notif-toggle").fadeOut(50,function(){$(".reminders-iframe").fadeIn(50)});window.addEventListener("message",_30de225595dfcf019e2814934e6b2ebf18bb90f7)})}
function _30de225595dfcf019e2814934e6b2ebf18bb90f7(a){"closeIframe"==a.data?window.close():void 0!=a.data.action?"resizeIframe"==a.data.action?(a=a.data.dimensions,$(".reminders-iframe").css(a)):console.error("unrecognized message JSON: "+a.data):console.error("unrecognized message: "+a.data)}function _f8ed65f2c95d0a3cc8883a93ab629691519f68bc(){chrome.runtime.sendMessage({requestPhoneStatusNotCollapsed:!0,high_priority_gcm:!0},function(a){console.log(a)})}
chrome.runtime.onMessage.addListener(function(a,b,c){if(a.phoneStatus){var d=a.phoneStatus;a=d.battery_level;b=d.battery_is_charging;d=String(d.ts_phone_utc/1E3);console.log("got a battery status");var e="";"false"!=b&&(e='<div id="chargingIcon"><span class="font-awesome-container"><i class="fa fa-bolt"></i></span></div>');_1a55d75a036f738332fc80bddd46d6e13d680f1f(a,e,d);c({popup_received_phone_status:!0})}else a.activeTabInfo&&(console.log(a.activeTabInfo),_9d8f60c7cd3b0b48ad47ae1ede9c12cb5a579258(a.activeTabInfo.url))});
function _92dbcc8e5f6bc759c2af95d27a65b08dd93d3674(){1>$("div.bat-wrap-holder").length&&$('<div class="bat-wrap-holder"><div id="batstatInitial" class="newbatterywrap mighty-tooltip" tooltip-content="'+chrome.i18n.getMessage("phone_bat_stat")+'"></div></div>').prependTo("#popup-footer");var a=$.jStorage.get("latest_phone_status");if(void 0!=a){var b="";"false"!=a.battery_is_charging&&(b='<div id="chargingIcon"><span class="font-awesome-container"><i class="fa fa-bolt"></i></span></div>');_1a55d75a036f738332fc80bddd46d6e13d680f1f(a.battery_level,
b,"")}_f8ed65f2c95d0a3cc8883a93ab629691519f68bc()}
function _1a55d75a036f738332fc80bddd46d6e13d680f1f(a,b,c){c=Math.round(a);var d='<div class="baticon"><span class="font-awesome-container"><i class="fa fa-mobile"></i></span></div><div class="mainCRXBattery"><div class="batwrap"><div class="batshell"><span class="batpercent">'+c+'%</span><div class="batbar" style="width:'+a+'%"></div></div><div class="batnub"></div></div></div>     '+b,e=$(".baticon");console.log({object:e,length:e.length});1>e.length?$(".newbatterywrap").empty().append(d).hide().fadeIn(150).each(function(){console.log("batstat appended");
_db62d5e1850e7e2f7603c50a1a73ce3fe6012fe8(a)}):(d=$("#chargingIcon"),$(".batpercent").text(c+"%"),$(".batbar").css("width",a+"%"),_db62d5e1850e7e2f7603c50a1a73ce3fe6012fe8(a),0<b.length?1>d.length&&$(".newbatterywrap").append(b):$(d).remove())}
function _db62d5e1850e7e2f7603c50a1a73ce3fe6012fe8(a){100<=a?($(".batbar").css("background-color","#67b422"),$(".batnub").css("background-color","#67b422")):60<=a?$(".batbar").css("background-color","#67b422"):20<=a&&59>=a?($(".batbar").css("background-color","#ffe400"),$(".batpercent").addClass("legible")):19>=a&&$(".batbar").css("background-color","#f02828")}
function _7b3262e31498ad3802839eeea171a1e6e3dd0043(){chrome.tabs.query({currentWindow:!0,active:!0},function(a){console.log(a);_9d8f60c7cd3b0b48ad47ae1ede9c12cb5a579258(a[0].url)})}
function _9d8f60c7cd3b0b48ad47ae1ede9c12cb5a579258(a){-1<a.indexOf("http")?(console.log(a),$(globalArrayOfApprovedHostsForCustomPushToPhone).each(function(b,c){console.log(c);-1<a.indexOf(c)?(console.log("This is a special site!: "+c),_2d3b674212e17cb1d6bb4a716e7704af60777fbe(c)):console.log("no match found")})):($("#phoneInteractButtons, .divider").hide(),$("#composeNew").attr("data-message","openComposeNewInNewTab"))}
function _2d3b674212e17cb1d6bb4a716e7704af60777fbe(a){var b="",c="",d="";"google.com/maps"==a||"google.co.uk/maps"==a?(b="map-marker.png",c=chrome.i18n.getMessage("open_map_on_phone"),d="google-maps"):"youtube.com/watch"==a?(b="youtube_play.png",c=chrome.i18n.getMessage("play_vid_on_phone"),d="youtube"):"yelp.com/biz"==a&&(b="yelp_icon.png",c=chrome.i18n.getMessage("open_review_on_phone"),d="yelp");$("[data-message='pushThisPageToPhone'").find("img").attr("src","../img/web-to-phone/"+b);$("[data-message='pushThisPageToPhone'").find("span").text(c);
$("[data-message='pushThisPageToPhone'").attr("data-type",d)}
function _4b35f59beeca2363a7ba7f1aecd2e3860fc24a38(a){var b=$(".notif-toggle");_b6b3f6d647d0bfc67870730d72a314753423ccc6(b,window.localStorage.global_notifications);if(a)$(b).on("click",function(){var a=$(this).attr("value");_39ad02de4cf2c92b012f6526ae3f58327b310020("user-changed-crx-setting",{crx_setting_name:"global_notifications",crx_setting_value_set:a,Client:"CRX"});_b6b3f6d647d0bfc67870730d72a314753423ccc6(this,a,!0);chrome.runtime.sendMessage({setProperBrowserActionIcon:!0},function(a){console.log(a)})})}
function _b6b3f6d647d0bfc67870730d72a314753423ccc6(a,b,c){var d="notifications_active",e,f,g;"1"==b?(d="notifications_off",f="enabled",g="disabled",e="0"):"0"==b&&(f="disabled",g="enabled",e="1");c?(console.info(e),$(a).removeClass(f).addClass(g).attr("value",e),window.localStorage.global_notifications=e,_871d64799a1ac8258e6ae82bf538ebb033066fa9(e)):($(a).removeClass(g).addClass(f).attr("value",b),d="0"==b?"notifications_off":"notifications_active");$(a).text(d)}
function _871d64799a1ac8258e6ae82bf538ebb033066fa9(a){console.log(a);var b;"0"==a?(a="off",b="../img/notifications/global_notifications_off.png",confirmNotifTitle=chrome.i18n.getMessage("global_notifs_off_confirm")):"1"==a&&(a="on",b="../img/notifications/96x96-global-notifs-on.png",confirmNotifTitle=chrome.i18n.getMessage("global_notifs_on_confirm"));var c={type:"basic",priority:0,message:""},d={title:confirmNotifTitle,iconUrl:b};chrome.notifications.update("user-incoming-message-notif-setting-toggle",
d,function(a){a||($.extend(c,d),chrome.notifications.create("user-incoming-message-notif-setting-toggle",c,function(a){console.log("global notif setting notif created!");_501841532e653ca08fe8590565cf915540b3a799(a,5E3)}))})}
function _8c88507f7c40b259265dda86ec9e81a124ed0f7e(){$(".mighty-tooltip").each(function(a,b){var c=$(b).attr("tooltip-content");$(b).tooltip("destroy").tooltip({trigger:"hover",title:c,placement:"top",delay:{show:150,hide:100}})}).on("click",function(){$(this).tooltip("hide")})}
function _8ea464c47243ad85b1f891d9962ca74f01052ebc(){$(".popup-option-name").each(function(){var a=$(this).attr("local-key"),a=chrome.i18n.getMessage(a);$(this).html(a);$(this).hasClass("new-feature")&&_eb482d59632209ff20d47b65e0dfd9a9d0d32bc3({popup_option:this})});$(".mighty-tooltip").each(function(){var a=$(this).attr("local-key"),a=chrome.i18n.getMessage(a);$(this).attr("tooltip-content",a)})}
function _eb482d59632209ff20d47b65e0dfd9a9d0d32bc3(a){if("undefined"!=typeof a&&a.hasOwnProperty("popup_option")){var b=' <sup class="new-badge">'+chrome.i18n.getMessage("new_feature_badge")+"!</sup>";$(a.popup_option).append(b)}}_2f7f0c74c32dc03ecd483d6800d88c641e98cbfe();