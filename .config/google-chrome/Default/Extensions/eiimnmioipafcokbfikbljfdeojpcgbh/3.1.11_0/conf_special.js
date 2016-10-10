
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
function cropUrl(url){
    url=url.replace("www.","");
    url=url.replace("http:\/\/","");
    url=url.replace("https:\/\/","");    
    if(url.substring(0,5)=="https"){
        url=substring(5);
    }else{
        if(url.substring(0,8)=="http"){
            url=substring(7);
        }
    }
    if(url.substring(0,3)=="www"){
        url=substring(3);
    }    
    if(url.substr(-1,1) == '/'){
        url = url.substr(0,url.length-1);
    }
    return url;
}
function isURL(url,redirect) {

    //url
    var RegExp = /[-a-zA-Z0-9@:%_\+.~#?&//=]{1,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    //var RegExp = /^(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?$/;
    
    //ip
    var RegExp2 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if(RegExp.test(url) || RegExp2.test(url) || (redirect && (url=='about:blank' || url=='chrome://newtab'))){ 
        return true; 
    }else{ 
        return false; 
    } 
}