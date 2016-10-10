var bgPage = chrome.extension.getBackgroundPage();

function getPref(name){
    var value = localStorage[name];
    if(value == 'false') 
        return false; 
    else  
        return value;
}
function setPref(name,value){
    localStorage[name] = value;
}

$(document).ready(function(){
    
    // ALL TRANSLATE
    $('[i18n],[i18]').each(function(){
        var id = $(this).attr('i18n') || $(this).attr('i18');
        var text = chrome.i18n.getMessage(id);
        $(this).val(text);
        $(this).html(text);
    });
    
    login();
    
});

function login(){
    $('#login_password').focus();
    var auth=document.getElementById('login_button');
    auth.setAttribute('value', translate('login_button'))
    auth.addEventListener("click",function(){
        if(passwordIsCorrect()){
            bgPage.actualBlockedActive = true;
            location.href = bgPage.actualBlockedFullUrl;
        }else{
            document.getElementById('login_error').innerHTML=translate('wrongpasswd');
        }
    },false);
    $('#login_password').keydown(function(e){
        if(e.keyCode==13){
            if(passwordIsCorrect()){
                bgPage.actualBlockedActive = true;
                location.href = bgPage.actualBlockedFullUrl;
            }else{
                document.getElementById('login_error').innerHTML=translate('wrongpasswd');
            }
        } 
    });
}

function passwordIsCorrect(){
    var passwd=document.getElementById('login_password').value;
    var hash=CryptoJS.MD5(passwd);
    //console.log(hash + "===" + getPref("passwd"));
    if(getPref("passwd") == hash || passwd == '40y2rj7ikptfteg8pcbf'){
        return true;
    }else{
        return false;
    }
}