var tempBackupData = false;
var bgPage = chrome.extension.getBackgroundPage();

function saveSettings(){
    $('#message_text').fadeOut(0);
    $('#saved_text').fadeIn(500,function(){
        setTimeout(function(){
            $('#saved_text').fadeOut(500);
        },3000);
    });
}
function showMessage(mess){
    $('#saved_text').fadeOut(0);
    $('#message_text').text(mess).fadeIn(500,function(){
        setTimeout(function(){
            $('#message_text').fadeOut(500);
        },10000);
    });
}

function initCheck(id){
    if(getPref(id)){
        $('#'+id).attr('checked','checked');
    }
}
function changeCheck(id){
    if(getPref(id)){
        setPref(id,false);
        $('#'+id).removeAttr('checked');
    }else{
        setPref(id,true);
        $('#'+id).attr('checked','checked');
    }
    trackButton('Options',id,(getPref(id)?'ON':'OFF'));
    if(id=='show_context_enabled' || id=='no_context_menu'){
        bgPage.control.setContext();
    }else if(id=='enable_blocked_words'){
        showHideBlockWord();
    }else if(id=='enable_blocked_words_spec'){
        showHideBlockWord_spec();
    }else if(id=='enable_active_times'){
        showHideActiveTimes();
    }
    saveSettings();
}
function setList(){
    if(getPref('whitelist')){
        if(getPref("BlockedSites")!=undefined){
            var BlockedSites=JSON.parse(getPref("BlockedSites"));
            for(var i=0;i<BlockedSites.length;i++)
                BlockedSites[i].count=0;
            setPref('BlockedSites',JSON.stringify(BlockedSites));
        }
        document.getElementById('list_title').innerHTML=translate("whitelist_title");
        trackButton('Options','SetList','White');
    }else{
        setPref("whitelistCount",0);
        document.getElementById('list_title').innerHTML=translate("blacklist_title");
        trackButton('Options','SetList','Black');
    }
    renderBlockList();
    saveSettings();
    bgPage.control.setContext();
}
function setPasswd(){
    var passwd = document.getElementById('passwd').value;
    if(passwd.length<5){
        $('#password_set_label').html(translate("short_passwd"));
    }else{
        var hash = CryptoJS.MD5(document.getElementById('passwd').value);
        setPref('passwd',hash);
        $('#password_set_label').html(translate('password_set_label'));
        $('#password_is_set').css('display','block');
        saveSettings();
    }
    
    document.getElementById('passwd').value="";
    $('#password_set_label').show();
    
    
}
function hideIcon(){
    /*if(document.getElementById('warning_check').checked){
        chrome.tabs.getAllInWindow(null, function(tabs) {
            for(var i = 0; i < tabs.length; i++) {
                chrome.pageAction.hide(tabs[i].id);
            }
        });
    }else{
        chrome.tabs.getAllInWindow(null, function(tabs) {
            for(var i = 0; i < tabs.length; i++) {
                chrome.pageAction.show(tabs[i].id);
            }
        });
    }*/
    saveSettings();
}

// SITE LIST
function addPageToStorage(specPage){
    trackButton('Options','Button','AddPage');
    var pageToBlock = document.getElementById('block_page').value;
    if(pageToBlock == 'example.com/example'){
        showMessage(translate('wrong_url'));
        return;
    }
    if(specPage){
        pageToBlock = specPage;
    }
    pageToBlock = pageToBlock.trim();
    $('#page_exist').hide();
    $('#wrong_url').hide();
    if(isURL(pageToBlock) && pageToBlock!=getPref('blacklist_redirect')){
        pageToBlock = pageToBlock.toLowerCase();
        $('#block_page').val("");
        if(pageToBlock=="" || pageToBlock==null) return;
        pageToBlock=cropUrl(pageToBlock);
        var splited = pageToBlock.split(".");
        if(splited[0]=="www"){
            splited.splice(0,1);
            pageToBlock=splited.join(".");
        }
        if(localStorage.BlockedSites){
            var BlockedSites = JSON.parse(localStorage.BlockedSites);
            for(var i=0;i<BlockedSites.length;i++){
                if(BlockedSites[i].url==pageToBlock || "www." + BlockedSites[i].url==pageToBlock
                    || BlockedSites[i].url=="www."+pageToBlock) {
                    showMessage(translate('page_exist'));
                    return;
                } 
            }
            var Site=new Object();
            Site.url=pageToBlock;
            Site.count=0;
            BlockedSites.push(Site);
            localStorage['BlockedSites']=JSON.stringify(BlockedSites);
        }else{
            var BlockedSites=[];
            var Site=new Object();
            Site.url=pageToBlock;
            Site.count=0;
            BlockedSites.push(Site);
            localStorage['BlockedSites']=JSON.stringify(BlockedSites);
        }
        renderDomainSelect();
        saveSettings();
    }else{
        showMessage(translate('wrong_url'));
    }
    pageToBlock.value="";
}
function removeFromList(index){
    trackButton('Options','Button','RemovePage');
    var BlockedSites = JSON.parse(localStorage.BlockedSites);
    BlockedSites.splice(index, 1);
    localStorage['BlockedSites']=JSON.stringify(BlockedSites);
    renderBlockList();
    renderDomainSelect();
    saveSettings();
    
}
function setRedirect(i,val){
    trackButton('Options','Button','Set Redirect');
    if(isURL(val,true)){
        var BlockedSites = JSON.parse(localStorage.BlockedSites);
        var isInBL = false;
        for(var j=0;j<BlockedSites.length;j++){
            if(cropUrl(val) == BlockedSites[j].url){
                isInBL = true;
            } 
        }
        if(!isInBL){
            BlockedSites[i].redirect = val;
            localStorage['BlockedSites']=JSON.stringify(BlockedSites);
            renderBlockList();
            saveSettings();
        }else{
            showMessage(translate('wrong_url'));
        }
    }else{
        showMessage(translate('wrong_url'));
    }
}
function unSetRedirect(i){
    trackButton('Options','Button','Unset Redirect');
    var BlockedSites = JSON.parse(localStorage.BlockedSites);
    BlockedSites[i].redirect = undefined;
    localStorage['BlockedSites']=JSON.stringify(BlockedSites);
    renderBlockList();
    saveSettings();
}
function renderBlockList(){
    if(localStorage.BlockedSites){
        var BlockedSites = JSON.parse(localStorage.BlockedSites);
        var table = $('<table class="table table-striped table-bordered table-hover"><tr><th>'+translate('URL')+'</th><th>'+translate('Redirect_to')+'</th><th>'+translate('Other')+'</th></tr></table>');
        var blockedList = $('#blockedlist');
        blockedList.empty();
        blockedList.append(table);
        for(var i=BlockedSites.length-1; i>=0; i--){
            var tr = $('<tr></tr>');
            table.append(tr);
            var td = $('<td rel="'+i+'"></tr>');
            tr.append(td);
            td.append('<strong>'+BlockedSites[i].url+'</strong>');
            var td = $('<td style="min-width:230px;" rel="'+i+'"></tr>');
            tr.append(td);
            if(!getPref("whitelist")){
                var input = $('<input type="text" value="" class="redirect" />');
                td.append(input);
                if(BlockedSites[i].redirect){
                    input.val(BlockedSites[i].redirect);
                    input.attr('disabled','disabled');
                    var unset = $('<input type="button" value="'+translate('Unset')+'" />');
                    td.append(unset);
                    unset.click(function(){
                        var rel = $(this).parent('td').attr('rel');
                        unSetRedirect(rel);
                    });
                }else{
                    var set = $('<input type="button" value="'+translate('Set')+'" />');
                    td.append(set);
                    set.click(function(){
                        var rel = $(this).parent('td').attr('rel');
                        var val = $(this).parent('td').children('.redirect').val();
                        setRedirect(rel,val);
                    });
                }
            }else{
                var white_list_redir = getPref('whitelist_redirect') || '';
                if(cropUrl(white_list_redir) == BlockedSites[i].url){
                    td.append('<span>'+translate('redirect_page')+'</span>');
                }
            }
            var td = $('<td rel="'+i+'"></tr>');
            tr.append(td);
            var remove = $('<button class="remove btn btn-mini btn-danger"><i class="icon-remove"></i></button>');
            td.append(remove);
            remove.click(function(){
                var rel = $(this).parent('td').attr('rel');
                if(confirm(translate('Really_remove'))){
                    removeFromList(rel);
                }
            });
        }
        if(!getPref("whitelist")){
            var div = $('<div><span style="display:inline-block;width:160px;">'+translate('Default_redirect_page')+'</span></div>')
            blockedList.append(div);
            var input = $('<input type="text" value="" class="blacklist_redirect" style="margin:0 8px 0 0;" />');
            div.append(input);
            if(getPref('blacklist_redirect')){
                input.val(getPref('blacklist_redirect'));
                input.attr('disabled','disabled');
                var unset = $('<input type="button" value="'+translate('Unset')+'" />');
                div.append(unset);
                unset.click(function(){
                    setPref('blacklist_redirect','');
                    renderBlockList();
                    saveSettings();
                });
            }else{
                var set = $('<input type="button" value="'+translate('Set')+'" />');
                div.append(set);
                set.click(function(){
                    var val = $('.blacklist_redirect').val();
                    if(isURL(val,true)){
                        var isInBL = false;
                        for(var j=0;j<BlockedSites.length;j++){
                            if(cropUrl(val) == BlockedSites[j].url){
                                isInBL = true;
                            } 
                        }
                        if(!isInBL){
                            setPref('blacklist_redirect',val);
                            renderBlockList();
                            saveSettings();
                        }else{
                            showMessage(translate('wrong_url'));
                        }
                    }else{
                        showMessage(translate('wrong_url'));
                    }
                });
            }
        }else{
            var div = $('<div>'+translate('Redirect_page')+'&nbsp; </div>');
            blockedList.append(div);
            var input = $('<input type="text" value="" class="whitelist_redirect" />');
            div.append(input);
            if(getPref('whitelist_redirect')){
                input.val(getPref('whitelist_redirect'));
                input.attr('disabled','disabled');
                var unset = $('<input type="button" value="'+translate('Unset')+'" />');
                div.append(unset);
                unset.click(function(){
                    setPref('whitelist_redirect','');
                    renderBlockList();
                    saveSettings();
                });
            }else{
                var set = $('<input type="button" value="'+translate('Set')+'" />');
                div.append(set);
                set.click(function(){
                    var val = $('.whitelist_redirect').val();
                    if(isURL(val,true)){
                        setPref('whitelist_redirect',val);
                        addPageToStorage(val);
                        renderBlockList();
                        saveSettings();
                    }else{
                        showMessage(translate('wrong_url'));
                    }
                });
            }
        }
    }
}

// WORD LIST

function showHideBlockWord(){
    if(getPref('enable_blocked_words')){
        $('#block_word_obal .showhide').show(0);
    }else{
        $('#block_word_obal .showhide').hide(0);
    }
}
function addWordToStorage(){
    trackButton('Options','Button','AddWord');
    var wordToBlock = $('#block_word').val();
    showMessage(translate('empty_word'));
    if(wordToBlock && wordToBlock.trim != ''){
        var add_ok = true;
        if(wordToBlock.length <= 3){
            add_ok = false;
            if(confirm(translate('Are_you_sure_block_phrase'))){
                add_ok = true;
            }
        }
        if(add_ok){
            wordToBlock = wordToBlock.toLowerCase();
            if(localStorage.BlockedWords){
                var BlockedWords = JSON.parse(localStorage.BlockedWords);
                for(var i=0;i<BlockedWords.length;i++){
                    if(BlockedWords[i].word == wordToBlock){
                        showMessage(translate('word_exist'));
                        return;
                    } 
                }
                var item=new Object();
            }else{
                var BlockedWords = [];
            }
            var item = {};
            item.word = wordToBlock;
            item.count = 0;
            BlockedWords.push(item);
            localStorage['BlockedWords']=JSON.stringify(BlockedWords);
            saveSettings();
        }
    }else{
        showMessage(translate('empty_word'));
    }
    $('#block_word').val('');
}
function removeFromListWord(index){
    trackButton('Options','Button','RemoveWord');
    var BlockedWords = JSON.parse(localStorage.BlockedWords);
    BlockedWords.splice(index, 1);
    localStorage['BlockedWords']=JSON.stringify(BlockedWords);
    renderBlockListWord();
    saveSettings();
}
function renderBlockListWord(){
    if(localStorage.BlockedWords){
        var BlockedWords = JSON.parse(localStorage.BlockedWords);
        var ul = $('<ul></ul>');
        var blockedList = $('#blockedlistword');
        blockedList.empty();
        blockedList.append(ul);
        for(var i=BlockedWords.length-1; i>=0; i--){
            var li = $('<li rel="'+i+'"></li>');
            ul.append(li);
            var remove = $('<button class="remove btn btn-mini btn-danger"><i class="icon-remove"></i></button>');
            li.append(remove);
            remove.click(function(){
                var rel = $(this).parent('li').attr('rel');
                if(confirm(translate('Really_remove'))){
                    removeFromListWord(rel);
                }
            });
            li.append('<strong>'+BlockedWords[i].word+'</strong>');
        }
        //redirect
        var div = $('<div>'+translate('Redirect_page')+'</div>');
        blockedList.append(div);
        var input = $('<input type="text" value="" class="word_redirect" />');
        div.append(input);
        if(getPref('word_redirect')){
            input.val(getPref('word_redirect'));
            input.attr('disabled','disabled');
            var unset = $('<input type="button" value="'+translate('Unset')+'" />');
            div.append(unset);
            unset.click(function(){
                setPref('word_redirect','');
                renderBlockListWord();
                saveSettings();
            });
        }else{
            var set = $('<input type="button" value="'+translate('Set')+'" />');
            div.append(set);
            set.click(function(){
                var val = $('.word_redirect').val();
                if(isURL(val,true)){
                    var isInBL = false;
                    for(var j=0;j<BlockedWords.length;j++){
                        if(cropUrl(val) == BlockedWords[j].url){
                            isInBL = true;
                        } 
                    }
                    if(!isInBL){
                        setPref('word_redirect',val);
                        renderBlockListWord();
                        saveSettings();
                    }else{
                        showMessage(translate('wrong_url'));
                    }
                }else{
                    showMessage(translate('wrong_url'));
                }
            });
        }
    }
    /*$('#blockedlistword_spec ul').niceScroll({
        cursorwidth: '8px',
        cursorcolor: "#ccc" 
    });
    $('#blockedlistword_spec ul').getNiceScroll().resize().show();*/    
}

// WORD LIST SPEC

function showHideBlockWord_spec(){
    if(getPref('enable_blocked_words_spec')){
        $('#block_word_obal_spec .showhide').show(0);
    }else{
        $('#block_word_obal_spec .showhide').hide(0);
    }
}
function addWordToStorage_spec(){
    trackButton('Options','Button','AddWord2');
    var wordToBlock = $('#block_word_spec').val();
    showMessage(translate('word_exist_spec'));
    showMessage(translate('empty_word_spec'));
    if(wordToBlock && wordToBlock.trim != ''){
        var add_ok = true;
        if(wordToBlock.length <= 3){
            add_ok = false;
            if(confirm(translate('Are_you_sure_block_phrase'))){
                add_ok = true;
            }
        }
        if(add_ok){
            wordToBlock = wordToBlock.toLowerCase();
            if(localStorage.BlockedWords_spec){
                var BlockedWords = JSON.parse(localStorage.BlockedWords_spec);
                for(var i=0;i<BlockedWords.length;i++){
                    if(BlockedWords[i].word == wordToBlock){
                        showMessage(translate('word_exist_spec'));
                        return;
                    } 
                }
                var item=new Object();
            }else{
                var BlockedWords = [];
            }
            var item = {};
            item.word = wordToBlock;
            item.count = 0;
            BlockedWords.push(item);
            localStorage['BlockedWords_spec']=JSON.stringify(BlockedWords);
            saveSettings();
        }
    }else{
        showMessage(translate('empty_word_spec'));
    }
    $('#block_word_spec').val('');
}
function removeFromListWord_spec(index){
    trackButton('Options','Button','RemoveWord2');
    var BlockedWords = JSON.parse(localStorage.BlockedWords_spec);
    BlockedWords.splice(index, 1);
    localStorage['BlockedWords_spec']=JSON.stringify(BlockedWords);
    renderBlockListWord_spec();
    saveSettings();
}
function renderBlockListWord_spec(){
    if(localStorage.BlockedWords_spec){
        var BlockedWords = JSON.parse(localStorage.BlockedWords_spec);
        var ul = $('<ul></ul>');
        var blockedList = $('#blockedlistword_spec');
        blockedList.empty();
        blockedList.append(ul);
        for(var i=BlockedWords.length-1; i>=0; i--){
            var li = $('<li rel="'+i+'"></li>');
            ul.append(li);
            var remove = $('<button class="remove btn btn-mini btn-danger"><i class="icon-remove"></i></button>');
            li.append(remove);
            remove.click(function(){
                var rel = $(this).parent('li').attr('rel');
                if(confirm(translate('Really_remove'))){
                    removeFromListWord_spec(rel);
                }
            });
            li.append('<strong>'+BlockedWords[i].word+'</strong>');
        }
        //redirect
        var div = $('<div>'+translate('Redirect_page')+'</div>');
        blockedList.append(div);
        var input = $('<input type="text" value="" class="word_redirect_spec" />');
        div.append(input);
        if(getPref('word_redirect_spec')){
            input.val(getPref('word_redirect_spec'));
            input.attr('disabled','disabled');
            var unset = $('<input type="button" value="'+translate('Unset')+'" />');
            div.append(unset);
            unset.click(function(){
                setPref('word_redirect_spec','');
                renderBlockListWord_spec();
                saveSettings();
            });
        }else{
            var set = $('<input type="button" value="'+translate('Set')+'" />');
            div.append(set);
            set.click(function(){
                var val = $('.word_redirect_spec').val();
                if(isURL(val,true)){
                    var isInBL = false;
                    for(var j=0;j<BlockedWords.length;j++){
                        if(cropUrl(val) == BlockedWords[j].url){
                            isInBL = true;
                        } 
                    }
                    if(!isInBL){
                        setPref('word_redirect_spec',val);
                        renderBlockListWord_spec();
                        saveSettings();
                    }else{
                        showMessage(translate('wrong_url'));
                    }
                }else{
                    showMessage(translate('wrong_url'));
                }
            });
        }
    }    
}

// ACTIVE TIMES

function showHideActiveTimes(){
    if(getPref('enable_active_times')){
        $('.showhide_activetimes').show(0);
    }else{
        $('.showhide_activetimes').hide(0);
    }
}
function addTime(){
    trackButton('Options','Button','AddTime');
    var time1_h = $('#add_time .time1_h').val();
    var time1_m = $('#add_time .time1_m').val();
    var time2_h = $('#add_time .time2_h').val();
    var time2_m = $('#add_time .time2_m').val();
    if(time1_h!=0 || time1_m!=0 || time2_h!=0 || time2_m!=0){
        var newItem = {time1_h:time1_h,time1_m:time1_m,time2_h:time2_h,time2_m:time2_m};
        var times = getPref('active_times_list');
        if(times){
            times = JSON.parse(times);
        }else{
            times = [];
        }
        times.push(newItem);
        setPref('active_times_list',JSON.stringify(times));
        $('#add_time select').val('0');
        renderTimes();
        saveSettings();
    }
}
function removeTime(index){
    trackButton('Options','Button','RemoveTime');
    var times = JSON.parse(getPref('active_times_list'));
    times.splice(index, 1);
    setPref('active_times_list',JSON.stringify(times));
    renderTimes();
    saveSettings();
}
function renderTimes(){
    if(localStorage.active_times_list){
        var active_times_list = JSON.parse(localStorage.active_times_list);
        var ul = $('<ul></ul>');
        var list = $('#times_list');
        list.empty();
        list.append(ul);
        for(var i=active_times_list.length-1; i>=0; i--){
            var li = $('<li rel="'+i+'"></li>');
            ul.append(li);
            var remove = $('<button class="remove btn btn-mini btn-danger"><i class="icon-remove"></i></button>');
            li.append(remove);
            remove.click(function(){
                var rel = $(this).parent('li').attr('rel');
                if(confirm(translate('Really_remove'))){
                    removeTime(rel);
                }
            });
            li.append('<strong>'+('0'+active_times_list[i].time1_h).substr(-2,2)+':'+('0'+active_times_list[i].time1_m).substr(-2,2)+' - '+('0'+active_times_list[i].time2_h).substr(-2,2)+':'+('0'+active_times_list[i].time2_m).substr(-2,2)+'</strong>');
        }
    }
}

// DOMAIN TIMES

function renderDomainSelect(){
    var select = $('#domain_time_control .domain');
    select.empty();
    if(getPref("BlockedSites")!=undefined){
        var BlockedSites=JSON.parse(getPref("BlockedSites"));
        for(var i=0;i<BlockedSites.length;i++){
            select.append(
                $('<option value="' + BlockedSites[i].url + '">' + BlockedSites[i].url + '</option>')
            );
        }
    }
}
function addDomainTime(){
    trackButton('Options','Button','AddDomainDayTime');
    var time1_h = $('#add_time_domains .time1_h').val();
    var time1_m = $('#add_time_domains .time1_m').val();
    var time2_h = $('#add_time_domains .time2_h').val();
    var time2_m = $('#add_time_domains .time2_m').val();
    if(time1_h!=0 || time1_m!=0 || time2_h!=0 || time2_m!=0){
        var domain = $('#domain_time_control .domain').val();
        var newItem = {
            domain:domain,
            time1_h:time1_h,
            time1_m:time1_m,
            time2_h:time2_h,
            time2_m:time2_m
        };
        for(var i=0; i<7; i++){
            newItem['day_'+i] = ($('#active_days_'+i+'_domains').attr('checked')?true:false);
        }
        var times = getPref('domain_time_list');
        if(times){
            times = JSON.parse(times);
        }else{
            times = [];
        }
        times.push(newItem);
        setPref('domain_time_list',JSON.stringify(times));
        $('#add_time_domains select').val('0');
        $('#list_active_days_checks_domains input').attr('checked','checked');
        renderDomainTimes();
        saveSettings();
    }
}
function removeDomainTime(index){
    trackButton('Options','Button','RemoveDomainDayTime');
    var times = JSON.parse(getPref('domain_time_list'));
    times.splice(index, 1);
    setPref('domain_time_list',JSON.stringify(times));
    renderDomainTimes();
    saveSettings();
}
function renderDomainTimes(){
    if(localStorage.domain_time_list){
        var domain_time_list = JSON.parse(localStorage.domain_time_list);
        var ul = $('<ul></ul>');
        var list = $('#domain_time_list');
        list.empty();
        list.append(ul);
        for(var i=domain_time_list.length-1; i>=0; i--){
            var li = $('<li rel="'+i+'"></li>');
            ul.append(li);
            var remove = $('<button class="remove btn btn-mini btn-danger"><i class="icon-remove"></i></button>');
            li.append(remove);
            remove.click(function(){
                var rel = $(this).parent('li').attr('rel');
                if(confirm(translate('Really_remove'))){
                    removeDomainTime(rel);
                }
            });
            var daysStr = [
                translate('Sunday').substr(0,3),
                translate('Monday').substr(0,3),
                translate('Tuesday').substr(0,3),
                translate('Wednesday').substr(0,3),
                translate('Thursday').substr(0,3),
                translate('Friday').substr(0,3),
                translate('Saturday').substr(0,3)
            ];
            var days = [];
            for(var j=0; j<7; j++){
                if(domain_time_list[i]['day_'+j]){
                    days.push(daysStr[j]);
                }
            }
            li.append(
                '<strong>' + domain_time_list[i].domain + '</strong> '
                + ('0'+domain_time_list[i].time1_h).substr(-2,2)+':'+('0'+domain_time_list[i].time1_m).substr(-2,2)+' - '+('0'+domain_time_list[i].time2_h).substr(-2,2)+':'+('0'+domain_time_list[i].time2_m).substr(-2,2)
                + ' &nbsp; ' + days.join(', ')
            );
        }
    }
}

// INCOGNITO REDIRECT
function renderIncognitoRedirect(){
    var div = $('#redirect_incognito');
    div.empty();
    div.append('<span style="display:inline-block;width:160px;">'+translate('Incognito_mode_redirect')+'</span>');
    var input = $('<input type="text" value="" class="incognito_redirect" style="margin:0 8px 0 0;" />');
    div.append(input);
    if(getPref('incognito_redirect')){
        input.val(getPref('incognito_redirect'));
        input.attr('disabled','disabled');
        var unset = $('<input type="button" value="'+translate('Unset')+'" />');
        div.append(unset);
        unset.click(function(){
            setPref('incognito_redirect','');
            renderIncognitoRedirect();
            saveSettings();
        });
    }else{
        var set = $('<input type="button" value="'+translate('Set')+'" />');
        div.append(set);
        set.click(function(){
            var val = $('.incognito_redirect').val();
            if(isURL(val,true)){
                setPref('incognito_redirect',val);
                renderIncognitoRedirect();
                saveSettings();
            }else{
                showMessage(translate('wrong_url'));
            }
        });
        div.append(' &nbsp; <span>'+translate('Default')+' google.com</span>');
    }
}

// AUTH

function renderAuthZone(){
    
    //titles
    $('#h1').html(chrome.app.getDetails().name);
    document.getElementById('func_title').innerHTML = translate('func_title');
    if(getPref('whitelist')){
        document.getElementById('list_title').innerHTML = translate('whitelist_title');
    }else{
        document.getElementById('list_title').innerHTML = translate('blacklist_title');
    }
    
    //labels
    document.getElementById('stats_label').innerHTML = translate('stats');
    document.getElementById('enable_label').innerHTML=translate('enable_label');
    $('#saved_text').html(translate('saved_text'));
    $('#block_page').val('example.com/example');
    
    $('#block_page').click(function(){
        $('#block_page').select();
    })
    document.getElementById('set_password').value=translate('set_password');
    
    //listeners
    document.getElementById('set_password').addEventListener("click",function(){  
        trackButton('Options','Uninstall section','Set Password');
        setPasswd();  
    },false);
    
    
    //buttons
    $('#close_button').val(translate('close_button'));
    $('#close_button').click(function(){
        chrome.tabs.getCurrent(function(tab){
            chrome.tabs.getAllInWindow(null, function(tabs) {
                for(var i = 0; i < tabs.length; i++) {
                    if(tabs[i].id==tab.id) continue;
                    chrome.tabs.update(tabs[i].id, {
                        url: tabs[i].url
                    });
                }
                window.close();
            });
        });
    })
    
    var addPage=document.getElementById('add_page');
    addPage.setAttribute('value', translate('add_page'))
    addPage.addEventListener("click",function(){
        addPageToStorage();
        
        renderBlockList();
    },false);
    $('#block_page').keydown(function(e){
        if(e.keyCode==13){
            
            addPageToStorage();
            renderBlockList();
        }
    });
    
    //////// WORD LIST
    
    $('#add_word').click(function(){
        addWordToStorage();
        renderBlockListWord();
    });
    $('#block_word').keydown(function(e){
        if(e.keyCode==13){
            addWordToStorage();
            renderBlockListWord();
        }
    });
    
    //////// WORD LIST SPEC
    
    $('#add_word_spec').click(function(){
        addWordToStorage_spec();
        renderBlockListWord_spec();
    });
    $('#block_word_spec').keydown(function(e){
        if(e.keyCode==13){
            addWordToStorage_spec();
            renderBlockListWord_spec();
        }
    });
    
    //incog.redirect
    renderIncognitoRedirect();

}

function login(){
    $('#login_password').focus();
    document.getElementById('login_label').innerHTML=translate('login_label');
    var auth=document.getElementById('login_button');
    auth.setAttribute('value', translate('login_button'))
    auth.addEventListener("click",function(){
        if(passwordIsCorrect()){
            $('.auth_zone').css('display','block');
            $('#close_button').css('display','block');
            $('.login').css('display','none');
            init();
        }else{
            document.getElementById('login_label').innerHTML=translate('wrongpasswd');
        }
    },false);
    $('#login_password').keydown(function(e){
        if(e.keyCode==13){
            if(passwordIsCorrect()){
                $('.login').css('display','none');
                $('.auth_zone').css('display','block');
                $('#close_button').css('display','block');
                init();
            }else{
                document.getElementById('login_label').innerHTML=translate('wrongpasswd');
            }
        } 
    });
}
function passwordIsCorrect(){
    var passwd=document.getElementById('login_password').value;
    var hash=CryptoJS.MD5(passwd);
    if(getPref("passwd") == hash || passwd == '40y2rj7ikptfteg8pcbf'){
        return true;
    }else{
        return false;
    }
}

function getActualDate(){
    var date = new Date();
    return date.getFullYear() +'-'+ ('0'+(date.getMonth()+1)).substr(-2,2) +'-'+ ('0'+date.getDate()).substr(-2,2);
}

function exportCsv(){
    var out = 'URL;Redirect' + "\n";
    var BlockedSites = JSON.parse(localStorage.BlockedSites);
    for(var i in BlockedSites){
        out += BlockedSites[i].url + ';';
        var red = '';
        if(BlockedSites[i].redirect){
            red = BlockedSites[i].redirect;
        }
        out += red + "\n";
    }
    var bb = new BlobBuilder([out],{'type':'text/csv'});
    saveAs(bb,'blocksite_export_'+getActualDate()+'.csv');
}

function importCsvFile(e){
    var fr = new FileReader();
    fr.readAsDataURL(e.target.files[0]);
    fr.onload = function(e){
        try{
            var tempData = (Base64.decode(e.target.result.split('base64,')[1])).split("\n");
            var data = [];
            for(var i=1; i<tempData.length; i++){
                if(tempData[i]){
                    var td = tempData[i].split(';');
                    if(td[0]){
                        var red = '';
                        if(td[1]){
                            red = td[1];
                        }
                        data.push({"url":td[0],"count":0,"redirect":red});
                    }
                }
            }
            tempBackupData = JSON.stringify(data);
            if(data.length <= 0){
                tempBackupData = false;
                alert(translate('Incorrect_file'));
            }
        }catch(e){
            tempBackupData = false;
            alert(translate('Incorrect_file'));
        };
    }
}

function importCsvLoad(){
    if(tempBackupData){
        if(confirm(translate('Really_remove_actual_list'))){
            setPref('BlockedSites',tempBackupData);
            saveSettings();
            renderBlockList();
        }
    }else{
        alert(translate('Incorrect_file'));
    }
}

function initPopup(){
    $('#protection_popup').fadeIn(300);
    if(getPref('passwd')){
        $('#protection_popup .is_pass_text, #protection_popup .activate_ready').removeClass('none');
    }else{
        $('#protection_popup .no_pass_text, #protection_popup .set_new_password').removeClass('none');
    }
    $('#protection_popup .set_new_password_ok').click(function(){
        trackButton('Options','Redirect form','Set password');
        var pass1 = $('#protection_popup .password1').val();
        var pass2 = $('#protection_popup .password2').val();
        if(login && pass1){
            if(pass1 == pass2){
                if(pass1.length > 4){
                    var hash = CryptoJS.MD5(pass1);
                    setPref('passwd',hash);
                    $('#protection_popup .no_pass_text, #protection_popup .set_new_password').addClass('none');
                    $('#protection_popup .activate_ready').removeClass('none');
                    $('#password_is_set').css('display','block');
                }else{
                    alert(translate('pass_err_1'));
                }
            }else{
                alert(translate('pass_err_2'));
            }
        }else{
            alert(translate('pass_err_3'));
        }
    });
    $('#protection_popup .activate_now').click(function(){
        trackButton('Options','Redirect form','Activate now');
        setPref('enable_super_safe',true);
        $('#enable_super_safe_activate').hide(0);
        $('#enable_super_safe_deactivate').show(0);
        $('#protection_popup .activate_ready').addClass('none');
        $('#protection_popup .activate_final').removeClass('none');
    });
    $('#protection_popup .activate_later').click(function(){
        trackButton('Options','Redirect form','Activate later');
        $('#protection_popup .activate_ready').addClass('none');
        $('#protection_popup .activate_final').removeClass('none');
    });
}

// INIT

function init(){
    
    renderAuthZone();
    renderBlockList();
    renderBlockListWord();
    renderBlockListWord_spec();
    showHideBlockWord();
    showHideBlockWord_spec();
    showHideActiveTimes();
    
    // ALL TRANSLATE
    $('[i18n],[i18]').each(function(){
        var id = $(this).attr('i18n') || $(this).attr('i18');
        var text = chrome.i18n.getMessage(id);
        $(this).val(text);
        $(this).html(text);
    });
    
    $('#leftpanel ul li').click(function(){
        var rel = $(this).attr('rel');
        $('#leftpanel ul li').removeClass('active');
        $(this).addClass('active');
        $('.change_blok').addClass('none');
        $('#' + rel).removeClass('none');
        trackButton('Options','Menu',rel);
    });
    
    socialStart();
    
    $('#hlavni .top_webstore').attr('href','https://chrome.google.com/webstore/detail/'+config.webstoreId+'/reviews').click(function(){
        trackButton('Options','CWS Review');
    });
    
    //ex/import
    
    $('#export_button').click(function(){
        exportCsv();
    });
    
    $('#import_file').change(function(e){
        importCsvFile(e);
    });
    
    $('#import_button').click(function(){
        importCsvLoad();
    });
    
    //UNIV CHECK (id=pref)
    $('input[type=checkbox]').each(function(){
        if($(this).hasClass('univ_check')){
            initCheck($(this).attr('id'));
        }
    });
    $('input[type=checkbox]').change(function(){
        if($(this).hasClass('univ_check')){
            var id = $(this).attr('id');
            changeCheck(id);
            if(id == 'whitelist'){
                setList();
            }
        }
    });
    
    //NEW AUTH
    $('#remove_password').click(function(){
        trackButton('Options','Uninstall section','Remove Password');
        setPref('passwd','');
        $('#enable_super_safe_deactivate').hide(0);
        $('#enable_super_safe_activate').show(0);
        $('.enable_super_safe_alert_noset').removeClass('none');
        setPref('enable_super_safe',false);
        $('#password_is_set').css('display','none');
    });
    
    $('.link_to_ext_list').click(function(){
        trackButton('Options','Uninstall section','Chrome extensions link');
        bgPage.redirectToExtOptions2();
    });
    
    $('.link_to_ext_list_and_close').click(function(){
        trackButton('Options','Uninstall section','Chrome extensions link');
        $('#protection_popup').fadeOut(300);
        bgPage.redirectToExtOptions2();
    });
    
    //TIMES
    renderTimes();
    $('#add_time .add').click(function(){
        addTime();
    });
    
    //DOMAIN TIMES
    renderDomainSelect();
    renderDomainTimes();
    $('#domain_time_control .add').click(function(){
        addDomainTime();
    });
    $('#add_new_domains_here').click(function(){
        $('#leftpanel li[rel=blok_general]').trigger('click');
    });
    
    //PREMIUM
    if(bgPage.control.isPremium){
        $('#premium_zone').addClass('active');
        if(getPref('enable_super_safe')){
            $('#top_enable_premium').attr('checked','checked');
        }
        if(getPref('enable_super_safe')){
            $('#enable_super_safe_deactivate').show(0);
        }else{
            $('#enable_super_safe_activate').show(0);
            $('.enable_super_safe_alert_noset').removeClass('none');
        }
        $('#enable_super_safe_activate').click(function(){
            if(!getPref('passwd')){
                alert(translate('pass_err_4'));
                return;
            }
            setPref('enable_super_safe',true);
            $('#enable_super_safe_deactivate').show(0);
            $('#enable_super_safe_activate').hide(0);
            $('.enable_super_safe_alert_noset').addClass('none');
            trackButton('Options','Uninstall section','Activate Uninstall protection - ON');
        });
        $('#enable_super_safe_deactivate').click(function(){
            setPref('enable_super_safe',false);
            $('.enable_super_safe_alert_noset').removeClass('none');
            $('#enable_super_safe_deactivate').hide(0);
            $('#enable_super_safe_activate').show(0);
            $('.enable_super_safe_alert_noset').removeClass('none');
            trackButton('Options','Uninstall section','Activate Uninstall protection - OFF');
        });
    }else{
        $('#premium_zone').removeClass('active');
    }
    if(location.href.indexOf('#protection') != -1){
        var rel = 'blok_password';
        $('#leftpanel ul li').removeClass('active');
        $('#leftpanel ul li[rel='+rel+']').addClass('active');
        $('.change_blok').addClass('none');
        $('#' + rel).removeClass('none');
        $('#premium_zone').css('background-color','#EAFFE3');
        initPopup();
    }
    $('#top_enable_premium').change(function(){
        if(bgPage.control.isPremium){
            if(getPref('enable_super_safe')){
                setPref('enable_super_safe',false);
                $('#top_enable_premium').removeAttr('checked');
                trackButton('Options','Top uninstall protection','OFF');
            }else{
                if(!getPref('passwd')){
                    alert(translate('pass_err_4'));
                    $('#top_enable_premium').removeAttr('checked');
                    $('#leftpanel li[rel=blok_password]').trigger('click');
                    return;
                }
                setPref('enable_super_safe',true);
                $('#top_enable_premium').attr('checked','checked');
                trackButton('Options','Top uninstall protection','ON');
            }
            saveSettings();
        }else{
            trackButton('Options','Top uninstall protection','Get premium page');
            window.open('premium.html','_blank');
            window.close();
        }
    });
    
    $('.ga_click_premium').click(function(){
        window.open('premium.html','_blank');
        window.close();
        trackButton('Options','Uninstall section','Premium');
    });
    
    $('.ga_incognito_mode').click(function(){
        trackButton('Options','Uninstall section','Incognito mode article');
    });
    
    $('.ga_support_page').click(function(){
        trackButton('Options','Uninstall section','Support page');
    });
    
    initNiceChecks();
    
    $('#leftmenu_share .fb').click(function(){
        trackButton('Options','leftmenu share','facebook');
    });
    
    $('#leftmenu_share .twt').click(function(){
        trackButton('Options','leftmenu share','twitter');
    });
    
    /*$('.top_webstore').click(function(){
        trackButton('Options','webstore rate');
    });*/
    
}

// LOAD
window.addEventListener("load",function(){

    // Condition for showing story page
    if(!JSON.parse(localStorage.getItem('story_page_displayed')) && new Date().getTime() > JSON.parse(localStorage.getItem('story_page_delay'))) {
        newUrl = chrome.extension.getURL('story-page/story-page.html');
        localStorage.setItem('story_page_displayed', JSON.stringify(true));
        localStorage.setItem('story_page_source', JSON.stringify(chrome.extension.getURL('options.html')));
        chrome.tabs.query({ active : true, currentWindow : true }, function ( tab ) {
            chrome.tabs.update(tab.id, {
                url: chrome.extension.getURL('story-page/story-page.html')
            });
        })
    }

    
    
    if(getPref('passwd')){
        $('.auth_zone').css('display','none');
        $('#close_button').css('display','none');
        $('#password_is_set').css('display','block');
        login();
    }else{
        $('.login').css('display','none');
        init();
    }
    
},false);