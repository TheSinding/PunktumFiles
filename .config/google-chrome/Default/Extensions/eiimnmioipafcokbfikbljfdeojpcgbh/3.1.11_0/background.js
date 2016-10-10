var BlockedSites, BlockedWords, BlockedWords_spec;
var warningPage = chrome.extension.getURL('blocked.html');
var warningPagePass = chrome.extension.getURL('blocked_pass.html');
var actualBlockedActive, actualBlockedFullUrl, actualBlockedTabId;

wips.firstStart = function(){
    wips.setPref('check_newtab_premium', (new Date().getTime()).toString());
}

// CONTROL

var control = { 
    isPremium: false,
    init: function(){
        /*setTimeout(function(){
            control.updateNotify();
        },600000);*/
        setTimeout(function(){
            control.setContext();
        },3000);
        /*setTimeout(function(){
            control.newtabPremium();
        },20000);*/
        this.checkPremium();
        if(!localStorage.active_days_0){
            wips.setPref('active_days_0',true);
            wips.setPref('active_days_1',true);
            wips.setPref('active_days_2',true);
            wips.setPref('active_days_3',true);
            wips.setPref('active_days_4',true);
            wips.setPref('active_days_5',true);
            wips.setPref('active_days_6',true);
        }
        if(!localStorage.BlockedWords_spec){
            var BlockedWords_spec_list = ["ahole","anus","ash0le","ash0les","asholes","ass","ass+monkey","assface","assh0le","assh0lez","asshole","assholes","assholz","asswipe","azzhole","bassterds","bastard","bastards","bastardz","basterds","basterdz","biatch","bitch","bitches","blow+job","boffing","butthole","buttwipe","c0ck","c0cks","c0k","carpet+muncher","cawk","cawks","clit","cnts","cntz","cock","cockhead","cock+head","cocks","cocksucker","cock+sucker","crap","cum","cunt","cunts","cuntz","dick","dild0","dild0s","dildo","dildos","dilld0","dilld0s","dominatricks","dominatrics","dominatrix","dyke","enema","fuck","fucker","fag","fag1t","faget","fagg1t","faggit","faggot","fagit","fags","fagz","faig","faigs","fart","flipping+the+bird","fuckin","fucking","fucks","fudge+packer","fuk","fukah","fuken","fuker","fukin","fukk","fukkah","fukken","fukker","fukkin","g00k","gay","gayboy","gaygirl","gays","gayz","god+damned","h00r","h0ar","h0re","hells","hoar","hoor","hoore","jackoff","jap","japs","jerk+off","jisim","jiss","jizm","jizz","knob","knobs","knobz","kunt","kunts","kuntz","lesbian","lezzian","lipshits","lipshitz","masochist","masokist","massterbait","masstrbait","masstrbate","masterbaiter","masterbate","masterbates","motha+fucker","motha+fuker","motha+fukkah","motha+fukker","mother+fucker","mother+fukah","mother+fuker","mother+fukkah","mother+fukker","mutha+fucker","mutha+fukah","mutha+fuker","mutha+fukkah","mutha+fukker","n1gr","nastt","nigger","nigur","niiger","niigr","orafis","orgasim","orgasm","orgasum","oriface","orifice","orifiss","packi","packie","packy","paki","pakie","paky","pecker","peeenus","peeenusss","peenus","peinus","pen1s","penas","penis","penis+breath","penus","penuus","phuc","phuck","phuk","phuker","phukker","polac","polack","polak","poonani","pr1c","pr1ck","pr1k","pusse","pussee","pussy","puuke","puuker","queer","queers","queerz","qweers","qweerz","qweir","recktum","rectum","retard","sadist","scank","schlong","screwing","semen","sex","sexy","sh!t","sh1t","sh1ter","sh1ts","sh1tter","sh1tz","shit","shits","shitter","shitty","shity","shitz","shyt","shyte","shytty","shyty","skanck","skank","skankee","skankey","skanks","skanky","slut","sluts","slutty","slutz","son+of+a+bitch","tit","turd","va1jina","vag1na","vagiina","vagina","vaj1na","vajina","vullva","vulva","w0p","wh00r","wh0re","whore","xrated","xxx","b!+ch","blowjob","arschloch","b!tch","b17ch","b1tch","bi+ch","boiolas","buceta","chink","cipa","clits","dirsa","ejakulate","fatass","fcuk","fux0r","hoer","hore","jism","kawk","l3itch","l3i+ch","masturbate","masterbat","masterbat3","motherfucker","s.o.b.","mofo","nazi","nigga","nutsack","pimpis","scrotum","shemale","shi+","sh!+","smut","teets","tits","boobs","b00bs","teez","testical","testicle","titt","w00se","wank","whoar","@$$","amcik","andskota","arse","assrammer","ayir","bi7ch","bollock","breasts","butt+pirate","cabron","cazzo","chraa","chuj","d4mn","daygo","dego","dike","dupa","dziwka","ejackulate","ekrem","ekto","enculer","faen","fanculo","fanny","feces","feg","felcher","ficken","fitt","flikker","foreskin","fotze","fu(","futkretzn","gook","guiena","h0r","h4x0r","hell","helvete","honkey","huevon","hui","injun","kanker","kike","klootzak","kraut","knulle","kuk","kuksuger","kurac","kurwa","kusi","kyrpa","lesbo","mamhoon","masturbat","merd","mibun","monkleigh","mouliewop","muie","mulkku","muschi","nazis","nepesaurio","orospu","paska","perse","picka","pierdol","pillu","pimmel","piss","pizda","poontsee","poop","porn","p0rn","pr0n","preteen","pula","pule","puta","puto","qahbeh","queef","rautenberg","schaffer","scheiss","schlampe","schmuck","screw","sharmuta","sharmute","shipal","shiz","skribz","skurwysyn","sphencter","spic","spierdalaj","splooge","suka","b00b","twat","vittu","wetback","wichser","wop","yed","zabourah"];
            var BlockedWords_spec = [];
            for(var i in BlockedWords_spec_list){
                BlockedWords_spec.push({
                    word: BlockedWords_spec_list[i],
                    count: 0
                });
            }
            wips.setPref('BlockedWords_spec',JSON.stringify(BlockedWords_spec));
        }
        if(!localStorage.EnabledBlockSite){
            wips.setPref('EnabledBlockSite',true);
        }
        if(!localStorage.block_only_standalone){
            wips.setPref('block_only_standalone',true);
        }
        if(!localStorage.domain_time_list){
            wips.setPref('domain_time_list','[]');
        }
        //control.initWallet();
    },
    /*initWallet: function(){
        var r = new XMLHttpRequest();
        var url = 'http://plugins.wips.com/j-w-t?user_id=block_site_premium&offer_code=blocksite1';
        r.open("GET", url, true);
        r.onreadystatechange = function(e){    
            if(r.readyState == 4 && r.status == 200){
                console.log(r.responseText);
                control.checkWallet(r.responseText);
            }
        };
        r.send(null);
    },
    checkWallet: function(key){
        //IN-APP
        google.payments.inapp.getSkuDetails({
            parameters: {env: 'prod'},
            //sku: 'block_site_premium',
            success: function(e) {console.log("success");console.log(e);},
            failure: function(e) {console.log("failure");console.log(e);}
        });
    },*/
    checkPremium: function(){
        var login = wips.getPref('premium_login');
        var password = wips.getPref('premium_password');
        if(login && password){
            var url = 'https://plugins.wips.com/blocksite-premium/pay/check?username='+encodeURIComponent(login)+'&password='+encodeURIComponent(password);
            var r = new XMLHttpRequest();
            r.open("GET", url, true);
            r.onreadystatechange = function (){
                if(r.readyState == 4){
                    if(r.status == 202){
                        control.isPremium = true;
                        wips.setPref('check_newtab_premium_disable',true);
                    }else if(r.status == 404 || r.status == 401 || r.status == 403){
                        wips.setPref('premium_login',false);
                        wips.setPref('premium_password',false);
                    }
                }
            };
            r.send(null);
        }
    },
    /*newtabPremium: function(){
        var last_check = parseInt(wips.getPref('check_newtab_premium'));
        if(!control.isPremium && !wips.getPref('check_newtab_premium_disable') && (!last_check || last_check < (new Date().getTime() - 86400000))){
            window.open('premium.html','_blank');
            wips.setPref('check_newtab_premium_disable',true);
            wips.setPref('check_newtab_premium2', (new Date().getTime()).toString());
        }
        var last_check2 = parseInt(wips.getPref('check_newtab_premium2'));
        if(!control.isPremium && !wips.getPref('check_newtab_premium_disable2') && (last_check2 && last_check2 < (new Date().getTime() - 604800000))){
            window.open('premium.html','_blank');
            wips.setPref('check_newtab_premium_disable2',true);
        }
    },*/
    setContext: function(){
        setTimeout(function(){
            var title;
            if(getPref('EnabledBlockSite')|| (!localStorage.EnabledBlockSite)){
                title = translate('context_disable');
            }else{
                title = translate('context_enable');
            }
            chrome.contextMenus.removeAll(function(){});
            if(wips.getPref('no_context_menu')){
                return;
            }
            chrome.contextMenus.create({
                'title': chrome.app.getDetails().name,
                'id': 'block_site_context'
            });
            chrome.contextMenus.create({
                'title':translate('menu_options'),
                'type': 'normal',
                'parentId': 'block_site_context',
                'onclick': function(){
                    window.open('options.html','_blank');
                    trackButton('Context','Options');
                }
            });
            if(!getPref('whitelist')){
                chrome.contextMenus.create({
                    'title':translate('context_add_current'),
                    'type': 'normal',
                    'parentId': 'block_site_context',
                    'onclick': function(e){
                        contextClick(e.pageUrl);
                        trackButton('Context','Add current site to blacklist');
                    }
                });
            }
            if(wips.getPref('show_context_enabled')){
                chrome.contextMenus.create({
                    'title':title,
                    'type': 'normal',
                    'parentId': 'block_site_context',
                    'onclick': function(){
                        if(wips.getPref('EnabledBlockSite') || (!localStorage.EnabledBlockSite)){
                            wips.setPref('EnabledBlockSite',false);
                            trackButton('Context','Disable Block Site');
                            control.setContext();
                        }else{
                            wips.setPref('EnabledBlockSite',true);
                            trackButton('Context','Enable Block Site');
                            control.setContext();
                        }
                    }
                });
            }
            if(!control.isPremium){
                chrome.contextMenus.create({
                    'title':translate('context_make_uninst'),
                    'type': 'normal',
                    'parentId': 'block_site_context',
                    'onclick': function(){
                        window.open('premium.html','_blank');
                        trackButton('Context','Premium');
                    }
                });
            }
            chrome.contextMenus.create({
                "title":translate('context_5star'),
                "type":"normal",
                'parentId': 'block_site_context',
                "onclick":function(){
                    window.open('https://chrome.google.com/webstore/detail/'+config.webstoreId+'/reviews','_blank');
                    trackButton('Context','CWS Review');
                }
            });
            //share
            var webstoreUrl;
            if(config.webstoreId && config.webstoreId != ''){
                webstoreUrl = 'https://chrome.google.com/webstore/detail/' + config.webstoreId;
            }else{
                webstoreUrl = 'http://www.wips.com/showcase';
            }
            chrome.contextMenus.create({
                'title':translate('context_share'),
                'id': 'block_site_context_share',
                'parentId': 'block_site_context'
            });
            chrome.contextMenus.create({
                'title':translate('context_share_fb'),
                'type': 'normal',
                'parentId': 'block_site_context_share',
                'onclick': function(e){
                    window.open('https://www.facebook.com/sharer.php?u='+encodeURIComponent(webstoreUrl),'_blank');
                    trackButton('Context','Share','Facebook');
                }
            });
            chrome.contextMenus.create({
                'title':translate('context_share_twt'),
                'type': 'normal',
                'parentId': 'block_site_context_share',
                'onclick': function(e){
                    window.open('http://www.twitter.com/share?url='+encodeURIComponent(webstoreUrl)+'&text='+encodeURIComponent(config.tweetText),'_blank');
                    trackButton('Context','Share','Twitter');
                }
            });
            chrome.contextMenus.create({
                'contexts':['link'],
                'title':translate('context_block_link'),
                'type':'normal',
                'onclick': function(e){
                    contextClick(e.linkUrl);
                    trackButton('Context','Block this link');
                }
            });
        },50);
    }/*,
    updateNotify: function(){
        if(!wips.getPref('update_notify_first_set')){
            wips.setPref('update_notify_first_set',true);
            wips.setPref('update_notify_active',true);
        }
        if(wips.getPref('update_notify_active')){
            if(wips.getPref('update_notify_id')!='3'){
                wips.setPref('update_notify_id','3');
                trackButton('Update Notify','Show');
                chrome.notifications.create(
                    'update_notify',{
                        type: 'image', 
                        iconUrl: 'img/icon128.png', 
                        title: translate('notify_title'), 
                        message: translate('notify_mess'),
                        imageUrl: 'img/update_notify_2.png',
                        buttons: [
                            { title: translate('notify_share_fb'), iconUrl: 'img/fb_share_16.png'},
                            { title: translate('notify_share_twt'), iconUrl: 'img/twt_share_16.png'},
                        ],
                        priority: 1
                    },function(){} 
                );
            }
        }
    }*/
}

// FCE

function IsAllowed(url){
    var array=url.split("/");
    if(array[0]=="chrome:" || array[0]=="chrome-extension:" ||array[0]=="chrome-devtools:" )
        return true;
    /////////////////////////////////////ERR!!!!
    if(getPref('whitelist_redirect') && getPref('whitelist_redirect').trim() && cropUrl(url).toLowerCase().indexOf(getPref('whitelist_redirect')) == 0){
        return true
    }
    for(var i=0; i<BlockedSites.length;i++){
        if(cropUrl(url).toLowerCase().indexOf(BlockedSites[i].url)==0){
            wips.setPref("currentBlockedIndex",i)
            return true;
        }        
        /*url=url.replace("www.","");
        if(url.indexOf(BlockedSites[i].url)!=-1){
            wips.setPref("currentBlockedIndex",i)
            return true;
        }*/
    }
    return false;
}

function IsBlocked(url){
    for(var i=0; i<BlockedSites.length;i++){
        if(cropUrl(url).toLowerCase().indexOf(BlockedSites[i].url)==0){
            wips.setPref("currentBlockedIndex",i);
            return true;
        }        
        /*url=url.replace("www.","");
        if(url.indexOf(BlockedSites[i].url)!=-1){
            wips.setPref("currentBlockedIndex",i);
            return true;
        }*/
    }
    return false;
}

function getRedirectPage(url){
    for(var i=0; i<BlockedSites.length;i++){
        if(cropUrl(url).indexOf(BlockedSites[i].url)==0){
            return BlockedSites[i].redirect;
        }        
        /*url=url.replace("www.","");
        if(url.indexOf(BlockedSites[i].url)!=-1){
            return BlockedSites[i].redirect;
        }*/
    }
    return false;
}

function IsBlockedWord(url){
    url = url.toLowerCase();
    //console.log(url);
    for(var i=0; i<BlockedWords.length;i++){
        //console.log(BlockedWords[i].word);
        if(url.indexOf(BlockedWords[i].word)!=-1 || url.indexOf(encodeURIComponent(BlockedWords[i].word))!=-1){
            if(url.indexOf(BlockedWords[i].word)!=-1 && wips.getPref('block_only_standalone') && !isStandaloneWord(url,BlockedWords[i].word)){
                //console.log('return 1');
                return false;
            }
            wips.setPref("currentBlockedIndex",'word'+i);
            //console.log('return 2');
            return true;
        }        
    }
    //console.log('return 3');
    return false;
}

function IsBlockedWord_spec(url){
    url = url.toLowerCase();
    for(var i=0; i<BlockedWords_spec.length;i++){
        if(url.indexOf(BlockedWords_spec[i].word)!=-1 || url.indexOf(encodeURIComponent(BlockedWords_spec[i].word))!=-1){
            if(url.indexOf(BlockedWords_spec[i].word)!=-1 && wips.getPref('block_only_standalone') && !isStandaloneWord(url,BlockedWords_spec[i].word)){
                return false;
            }
            wips.setPref("currentBlockedIndex",'wspec'+i);
            return true;
        }        
    }
    return false;
}

function isStandaloneWord(url,word){
    var sep = url.split(word);
    var preChar;
    if(sep[0]){
        preChar = sep[0][sep[0].length-1];
    }
    var aftChar;
    if(sep[1]){
        aftChar = sep[1][0];
    }
    if(isNormalChar(preChar) || isNormalChar(aftChar)){
        return false;
    }else{
        return true;
    }
}

function isNormalChar(ch){
    var RegExp = /[A-Za-z0-9]/;
    if(RegExp.test(ch)){
        return true;
    }else{
        return false;
    }
}

function contextClick(url){
    var url = url.toLowerCase();
    if(isURL(url)){
        
        url=cropUrl(url);
        var splited = url.split(".");
        if(splited[0]=="www"){
            splited.splice(0,1);
            url=splited.join(".");
        }        
        if(localStorage.BlockedSites){
            var BlockedSites = JSON.parse(localStorage.BlockedSites);
            for(var i=0;i<BlockedSites.length;i++){
                if(BlockedSites[i].url==url || "www." + BlockedSites[i].url==url
                    || BlockedSites[i].url=="www."+url) {                    
                    return;
                } 
            }
            var Site=new Object();
            Site.url=url;
            Site.count=0;
            BlockedSites.push(Site);
            localStorage['BlockedSites']=JSON.stringify(BlockedSites);
        }else{
            var BlockedSites=[];
            var Site=new Object();
            Site.url=url;
            Site.count=0;
            BlockedSites.push(Site);
            localStorage['BlockedSites']=JSON.stringify(BlockedSites);
        }  
    }
}

function checkPage(tab){
    /*var superWhitelist = ['webhp?sourceid='];
    for(var sw in superWhitelist){
        console.log('TEST 11');
        if(tab.url.indexOf(superWhitelist[sw]) != -1){
            return;
        }
    }*/
    if(wips.getPref("BlockedSites")==undefined){
        BlockedSites=[];
    }else{
        BlockedSites=JSON.parse(wips.getPref("BlockedSites"));
    }
    if(tab.url==warningPage || tab.url==warningPagePass){
        return;
    }else{
        var blockActive = true;
        var wasGlobalCheck = false;
        //days
        var actDay = (new Date()).getDay();
        if(!wips.getPref('active_days_'+actDay)){
            blockActive = false;
            wasGlobalCheck = true;
        }
        //times
        if(blockActive && wips.getPref('enable_active_times')){
            var times = wips.getPref('active_times_list');
            if(times){
                times = JSON.parse(times);
                if(times.length > 0){
                    wasGlobalCheck = true;
                    blockActive = false;
                    var now = (new Date()).getTime();
                    for(var i in times){
                        var minTemp = new Date();
                        minTemp.setHours(parseInt(times[i].time1_h));
                        minTemp.setMinutes(parseInt(times[i].time1_m));
                        var min = minTemp.getTime();
                        var maxTemp = new Date();
                        maxTemp.setHours(parseInt(times[i].time2_h));
                        maxTemp.setMinutes(parseInt(times[i].time2_m));
                        var max = maxTemp.getTime();
                        if((max > min && (now >= min && now <= max))
                         ||(max < min && (now >= min || now <= max))){
                            blockActive = true;
                        }
                    }
                } 
            }
        }
        //domain times/days
        if(!wasGlobalCheck || (wasGlobalCheck && !blockActive)){
            var actDomain = cropUrl(tab.url);
            var domain_time_list = JSON.parse(localStorage.domain_time_list);
            for(var i in domain_time_list){
                if(actDomain == domain_time_list[i].domain){
                    blockActive = false;
                    var actTimeDomain = domain_time_list[i];
                    //day
                    var actDay = (new Date()).getDay();
                    if(actTimeDomain['day_'+actDay]){
                        blockActive = true;
                    }
                    //time
                    if(blockActive){
                        blockActive = false;
                        var now = (new Date()).getTime();
                        var minTemp = new Date();
                        minTemp.setHours(parseInt(actTimeDomain.time1_h));
                        minTemp.setMinutes(parseInt(actTimeDomain.time1_m));
                        var min = minTemp.getTime();
                        var maxTemp = new Date();
                        maxTemp.setHours(parseInt(actTimeDomain.time2_h));
                        maxTemp.setMinutes(parseInt(actTimeDomain.time2_m));
                        var max = maxTemp.getTime();
                        if((max > min && (now >= min && now <= max))
                         ||(max < min && (now >= min || now <= max))){
                            blockActive = true;
                        }
                    }
                }
            }
        }
        //main fce
        if(blockActive){
            //site
            if(wips.getPref("whitelist")){
                if(!IsAllowed(tab.url)){
                    if(actualBlockedActive && actualBlockedFullUrl == tab.url && actualBlockedTabId == tab.id){
                        return;
                    }
                    if(wips.getPref('blocked_with_pass') && wips.getPref('passwd')){
                        actualBlockedFullUrl = tab.url;
                        actualBlockedTabId = tab.id;
                        actualBlockedActive = false;
                        /*if(wips.getPref('no_redirect_page')){
                            chrome.tabs.executeScript(tab.id,{code: 'window.history.go(-1);',runAt:'document_end'},function(){});
                            return;
                        }*/
                        chrome.tabs.update(tab.id, {
                            url: 'blocked_pass.html'
                        });
                        return;
                    }
                    wips.setPref("actualBlockedSite",cropUrl(tab.url));
                    var newUrl = warningPage;
                    if(tab.incognito){
                        var incognito_redirect = wips.getPref('incognito_redirect');
                        if(incognito_redirect){
                            newUrl = getModifyRedirectUrl(incognito_redirect);
                        }else{
                            newUrl = 'http://www.google.com/';
                        }
                    }
                    var wlRed = wips.getPref('whitelist_redirect');
                    if(wlRed){
                        newUrl = getModifyRedirectUrl(wlRed);
                    }
                    /*if(wips.getPref('no_redirect_page')){
                        chrome.tabs.executeScript(tab.id,{code: 'window.history.go(-1);',runAt:'document_end'},function(){});
                        return;
                    }*/

                    

                    chrome.tabs.update(tab.id, {
                        url: newUrl
                    });
                }
            }else{
                if(IsBlocked(tab.url)){
                    if(actualBlockedActive && actualBlockedFullUrl == tab.url && actualBlockedTabId == tab.id){
                        return;
                    }
                    if(wips.getPref('blocked_with_pass') && wips.getPref('passwd')){
                        actualBlockedFullUrl = tab.url;
                        actualBlockedTabId = tab.id;
                        actualBlockedActive = false;
                        /*if(wips.getPref('no_redirect_page')){
                            chrome.tabs.executeScript(tab.id,{code: 'window.history.go(-1);',runAt:'document_end'},function(){});
                            return;
                        }*/
                        chrome.tabs.update(tab.id, {
                            url: 'blocked_pass.html'
                        });
                        return;
                    }
                    wips.setPref('BlockedSites',JSON.stringify(BlockedSites));
                    var newUrl = warningPage;
                    if(tab.incognito){
                        var incognito_redirect = wips.getPref('incognito_redirect');
                        if(incognito_redirect){
                            newUrl = getModifyRedirectUrl(incognito_redirect);
                        }else{
                            newUrl = 'http://www.google.com/';
                        }
                    }
                    var redUrl = getRedirectPage(tab.url);
                    var blacklist_redirect = wips.getPref('blacklist_redirect');
                    if(blacklist_redirect){
                        newUrl = getModifyRedirectUrl(blacklist_redirect);
                    }
                    if(redUrl){
                        newUrl = getModifyRedirectUrl(redUrl);
                    }
                    /*if(wips.getPref('no_redirect_page')){
                        chrome.tabs.executeScript(tab.id,{code: 'history.back();',runAt:'document_end'},function(){});
                        return;
                    }*/

                    // Condition for showing story page
                    if(!JSON.parse(localStorage.getItem('story_page_displayed')) && new Date().getTime() > JSON.parse(localStorage.getItem('story_page_delay'))) {
                        newUrl = chrome.extension.getURL('story-page/story-page.html');
                        localStorage.setItem('story_page_displayed', JSON.stringify(true));
                        localStorage.setItem('story_page_source', JSON.stringify(chrome.extension.getURL('blocked.html')));
                    }

                    chrome.tabs.update(tab.id, {
                        url: newUrl
                    });
                    
                }
            }
            //word
            if(wips.getPref('enable_blocked_words') && wips.getPref("BlockedWords")){
                BlockedWords=JSON.parse(wips.getPref("BlockedWords"));
                if(IsBlockedWord(tab.url)){
                    if(actualBlockedActive && actualBlockedFullUrl == tab.url && actualBlockedTabId == tab.id){
                        return;
                    }
                    if(wips.getPref('blocked_with_pass') && wips.getPref('passwd')){
                        actualBlockedFullUrl = tab.url;
                        actualBlockedTabId = tab.id;
                        actualBlockedActive = false;
                        /*if(wips.getPref('no_redirect_page')){
                            chrome.tabs.executeScript(tab.id,{code: 'window.history.go(-1);',runAt:'document_end'},function(){});
                            return;
                        }*/
                        chrome.tabs.update(tab.id, {
                            url: 'blocked_pass.html'
                        });
                        return;
                    }
                    wips.setPref('BlockedWords',JSON.stringify(BlockedWords));
                    var newUrl = warningPage;
                    if(tab.incognito){
                        var incognito_redirect = wips.getPref('incognito_redirect');
                        if(incognito_redirect){
                            newUrl = getModifyRedirectUrl(incognito_redirect);
                        }else{
                            newUrl = 'http://www.google.com/';
                        }
                    }
                    var word_redirect = wips.getPref('word_redirect');
                    if(word_redirect){
                        newUrl = getModifyRedirectUrl(word_redirect);
                    }
                    /*if(wips.getPref('no_redirect_page')){
                        chrome.tabs.executeScript(tab.id,{code: 'window.history.go(-1);',runAt:'document_end'},function(){});
                        return;
                    }*/
                    chrome.tabs.update(tab.id,{
                        url: newUrl
                    });
                }
            }
            //word spec
            if(wips.getPref('enable_blocked_words_spec') && wips.getPref("BlockedWords_spec")){
                BlockedWords_spec=JSON.parse(wips.getPref("BlockedWords_spec"));
                if(IsBlockedWord_spec(tab.url)){
                    if(actualBlockedActive && actualBlockedFullUrl == tab.url && actualBlockedTabId == tab.id){
                        return;
                    }
                    if(wips.getPref('blocked_with_pass') && wips.getPref('passwd')){
                        actualBlockedFullUrl = tab.url;
                        actualBlockedTabId = tab.id;
                        actualBlockedActive = false;
                        /*if(wips.getPref('no_redirect_page')){
                            chrome.tabs.executeScript(tab.id,{code: 'window.history.go(-1);',runAt:'document_end'},function(){});
                            return;
                        }*/
                        chrome.tabs.update(tab.id, {
                            url: 'blocked_pass.html'
                        });
                        return;
                    }
                    wips.setPref('BlockedWords_spec',JSON.stringify(BlockedWords_spec));
                    var newUrl = warningPage;
                    if(tab.incognito){
                        var incognito_redirect = wips.getPref('incognito_redirect');
                        if(incognito_redirect){
                            newUrl = getModifyRedirectUrl(incognito_redirect);
                        }else{
                            newUrl = 'http://www.google.com/';
                        }
                    }
                    var word_redirect_spec = wips.getPref('word_redirect_spec');
                    if(word_redirect_spec){
                        newUrl = getModifyRedirectUrl(word_redirect_spec);
                    }
                    /*if(wips.getPref('no_redirect_page')){
                        chrome.tabs.executeScript(tab.id,{code: 'window.history.go(-1);',runAt:'document_end'},function(){});
                        return;
                    }*/
                    chrome.tabs.update(tab.id,{
                        url: newUrl
                    });
                }
            }
        }
    }
}

function getModifyRedirectUrl(url){
    if(url=='about:blank' || url=='chrome://newtab' || url.indexOf('http://')!=-1 || url.indexOf('https://')!=-1 || url.indexOf('file:///')!=-1){
        return url;
    }else{
        return 'http://' + url;
    }
}

// LISTENERS + INTERVALS

window.addEventListener("load",function(){
    control.init();  
},false);

window.setInterval(function(){
    if(wips.getPref("EnabledBlockSite")){
        chrome.tabs.getSelected(null,function(tab){
            if(tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1){
                checkPage(tab);
            }
        });
    }
},500);

//SUPER SAFE
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if(changeInfo.status == 'loading' && wips.getPref('enable_super_safe')){
        if(tab.url.indexOf("chrome://extensions/") != -1){
            if(!wips.getPref('enable_super_safe_temp_enable')){
                chrome.tabs.update(tab.id,{
                    url: 'blocked_ext.html'
                });
            }else{
                wips.setPref('enable_super_safe_temp_enable',false);
            }
        }
    }
});

function redirectToExtOptions(){
    wips.setPref('enable_super_safe_temp_enable',true);
    chrome.tabs.update(null,{
        url: 'chrome://extensions/'
    });
}

function redirectToExtOptions2(){
    chrome.tabs.create({
        url: 'chrome://extensions/'
    });
}

// desknotify univ listeners
function desktopNotifyCliked(id,index){
    if(id == 'update_notify' && index!=undefined){
        /*var shareUrl = 'http://www.wips.com/showcase';
        if(config.webstoreId && config.webstoreId.trim() != ''){//nahrane
            shareUrl = 'https://chrome.google.com/webstore/detail/' + config.webstoreId;
        }
        var tweetText = encodeURIComponent(config.tweetText) + '%20' + encodeURIComponent(shareUrl);
        if(index == 0){
            window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(shareUrl),'_blank');
        }else if(index == 1){
            window.open('http://twitter.com/home?status=' + tweetText,'_blank');
        }*/
        var tweetText = encodeURIComponent('Get Life Protect for your kids and employees') + '%20' + encodeURIComponent('http://bit.ly/LifeProtect');
        if(index == 0){
            window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent('http://bit.ly/GetLifeProtect'),'_blank');
        }else if(index == 1){
            window.open('http://twitter.com/home?status=' + tweetText,'_blank');
        }
    }else if(id == 'update_notify'){
        trackButton('Update Notify','Click');
        window.open('https://www.getlifeprotect.com?utm_campaign=launch&utm_medium=update-notif&utm_source=block-site','_blank');
    }
}
chrome.notifications.onClicked.addListener(function(id){
    desktopNotifyCliked(id);
});
chrome.notifications.onButtonClicked.addListener(function(id,index){
    desktopNotifyCliked(id,index);
});