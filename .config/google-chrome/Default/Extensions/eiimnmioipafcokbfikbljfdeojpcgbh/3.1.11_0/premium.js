var bgPage = chrome.extension.getBackgroundPage(), timer;

function registration(){
    var login = $('#login').val();
    var pass1 = $('#password1').val();
    var pass2 = $('#password2').val();
    if(login && pass1){
        if(pass1 == pass2){
            if(login.length > 4 && pass1.length > 4){
                $('#error').text('').addClass('none');
                var passMD5 = CryptoJS.MD5(pass1 + 'aa8dgj15hf1j8gd84a5dfh');
                setPref('premium_login',login);
                setPref('premium_password',passMD5);
                var url = 'https://plugins.wips.com/blocksite-premium/pay/check?username='+encodeURIComponent(login)+'&password='+encodeURIComponent(passMD5);
                var r = new XMLHttpRequest();
                r.open("GET", url, true);
                r.onreadystatechange = function (){
                    if(r.readyState == 4){
                        if(r.status == 202){
                            bgPage.control.isPremium = true;
                            setPref('check_newtab_premium_disable',true);
                            setPref('check_newtab_premium_disable2',true);
                            trackButton('Premium page','Payment success');
                            location.href = 'options.html#protection';
                        }else if(r.status == 404){
                            $('#login').attr('disabled','disabled');
                            $('#password1').attr('disabled','disabled');
                            $('#password2').attr('disabled','disabled');
                            $('#error').text(translate('prem_err1')).removeClass('none');
                            window.open('https://plugins.wips.com/blocksite-premium/pay?username='+encodeURIComponent(login)+'&password='+encodeURIComponent(passMD5),'_blank');
                            timer = setInterval(function(){
                                checkTimer();
                            },3000);
                        }else if(r.status == 401){
                            $('#error').text(translate('prem_err2')).removeClass('none');
                        }else if(r.status == 408){
                            $('#error').text(translate('prem_err3')).removeClass('none');
                            $('#reg_zone').addClass('none');
                        }else if(r.status == 403){
                            $('#error').text(translate('prem_err4')).removeClass('none');
                        } 
                    }
                };
                r.send(null);
            }else{
                alert(translate('prem_err5'));
            }
        }else{
            alert(translate('prem_err6'));
        }
    }else{
        alert(translate('prem_err7'));
    }
}

function checkTimer(){
    var url = 'https://plugins.wips.com/blocksite-premium/pay/check?username='+encodeURIComponent(getPref('premium_login'))+'&password='+encodeURIComponent(getPref('premium_password'));
    var r = new XMLHttpRequest();
    r.open("GET", url, true);
    r.onreadystatechange = function (){
        if(r.readyState == 4){
            if(r.status == 202){
                clearInterval(timer);
                bgPage.control.isPremium = true;
                setPref('check_newtab_premium_disable',true);
                setPref('check_newtab_premium_disable2',true);
                trackButton('Premium page','Payment success');
                location.href = 'options.html#protection';
            } 
        }
    };
    r.send(null);
}

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
    
    $('#login').attr('placeholder',translate('prem_placeholder1'));
    $('#password1').attr('placeholder',translate('prem_placeholder2'));
    $('#password2').attr('placeholder',translate('prem_placeholder3'));
    
    $('#reg_ok').click(function(){
        trackButton('Premium page','Become premium');
        registration();
    });
    
    $('#foot .later').click(function(){
        trackButton('Premium page','Show later');
        window.close();
    });
    
    $('#foot .never').click(function(){
        trackButton('Premium page','Dont want');
        setPref('check_newtab_premium_disable',true);
        setPref('check_newtab_premium_disable2',true);
        window.close();
    });
    
});