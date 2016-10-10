//GA
if(config.gaCode){
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', config.gaCode]);
    _gaq.push(['_trackPageview']);
    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://stats.g.doubleclick.net/dc.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
}

function trackButton(param1,param2,param3,param4){
    //console.log(param1+' - '+param2+' - '+param3+' - '+param4);
    if(config.gaCode){
        if(param4)
            _gaq.push(['_trackEvent',param1,param2,param3,param4]);
        else if(param3)
            _gaq.push(['_trackEvent',param1,param2,param3]);
        else
            _gaq.push(['_trackEvent',param1,param2]);
    }
};