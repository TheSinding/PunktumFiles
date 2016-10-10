var bgPage = chrome.extension.getBackgroundPage();

function showFbShare(url){
    var shareUrl= "https://www.facebook.com/sharer.php?u="+encodeURIComponent(url);
    chrome.windows.create({
        'url': shareUrl, 
        'type': 'popup',
        'width':700,
        'height':400,
        'left':200,
        'top':200
    },function(window){});
}

$(document).ready(function(){
    
    var shareUrl = 'http://www.wips.com/showcase';
    if(config.webstoreId && config.webstoreId.trim() != ''){
        shareUrl = 'https://chrome.google.com/webstore/detail/' + config.webstoreId;
    }
    
    var tweetText = encodeURIComponent(config.tweetText) + '%20' + encodeURIComponent(shareUrl);
                            
    $('#hlavni .social .twt_obal .twt_share').attr('src','https://platform.twitter.com/widgets/tweet_button.html?text=' + tweetText);
    
    $('#hlavni .social .fb_obal .fb_share').click(function(){
        showFbShare(shareUrl);
        trackButton('Update Notify','FB Share');
    });
    
});