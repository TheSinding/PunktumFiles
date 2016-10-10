function getBubbleText(a){
    if(a<13){
        return translate("blocked_text"+a+"_2")
    }
    if(a<16){
        return translate("blocked_text16_2")
    }
    if(a<22){
        return translate("blocked_text20_2")
    }
    if(a<25){
        return translate("blocked_text22_2")
    }
    if(a<30){
        return translate("blocked_text25_2")
    }
    if(a<35){
        return translate("blocked_text30_2")
    }
    if(a<36){
        return translate("blocked_text35_2")
    }
    if(a<40){
        return translate("blocked_text36_2")
    }
    if(a<100){
        return translate("blocked_text40_2")
    }
    if(a<150){
        return translate("blocked_text100_2")
    }
    if(a<200){
        return translate("blocked_text150_2")
    }
    if(a<250){
        return translate("blocked_text200_2")
    }
    if(a<300){
        return translate("blocked_text300_2")
    }
    if(a<320){
        return translate("blocked_text320_2")
    }
    if(a<340){
        return translate("blocked_text340_2")
    }
    if(a<360){
        return translate("blocked_text360_2")
    }
    if(a<380){
        return translate("blocked_text380_2")
    }
    if(a<400){
        return translate("blocked_text400_2")
    }
    if(a<420){
        return translate("blocked_text420_2")
    }
    if(a<440){
        return translate("blocked_text440_2")
    }
    if(a<460){
        return translate("blocked_text460_2")
    }
    if(a<480){
        return translate("blocked_text480_2")
    }
    if(a<500){
        return translate("blocked_text500_2")
    }
    if(a<520){
        return translate("blocked_text520_2")
    }
    if(a<540){
        return translate("blocked_text540_2")
    }else{
        return translate("blocked_text560_2")
    }
}

$(function(){
    
    if(localStorage.BlockedSites){
        var BlockedSites = JSON.parse(getPref("BlockedSites"));
    }else{
        var BlockedSites = [];
    }
    if(localStorage.BlockedWords){
        var BlockedWords = JSON.parse(getPref("BlockedWords"));
    }else{
        var BlockedWords = [];
    }
    if(localStorage.BlockedWords_spec){
        var BlockedWords_spec = JSON.parse(getPref("BlockedWords_spec"));
    }else{
        var BlockedWords_spec = [];
    }
    var i=getPref("currentBlockedIndex");
    
    var a;
    var b;
    var c;
    var d;
    var isWordList = false;
    if(i.indexOf('word') != -1){
        isWordList = 'word';
        i = parseInt(i.replace('word',''));
        count=BlockedWords[i].count;
        count++;
        BlockedWords[i].count++;
        setPref("BlockedWords",JSON.stringify(BlockedWords));
    }else if(i.indexOf('wspec') != -1){
        isWordList = 'wspec'
        i = parseInt(i.replace('wspec',''));
        count=BlockedWords_spec[i].count;
        count++;
        BlockedWords_spec[i].count++;
        setPref("BlockedWords_spec",JSON.stringify(BlockedWords_spec));
    }else if(getPref("whitelist")){
        count=getPref("whitelistCount");
        count++;
        setPref("whitelistCount",count);
    }else{
        count=BlockedSites[i].count;
        count++;
        BlockedSites[i].count++;
        setPref("BlockedSites",JSON.stringify(BlockedSites));
    }
    
    if(count==1){
        b=translate("blocked_text1_1");
        c=translate("blocked_first_time");
        d=translate("blocked_text1_2");
    }else{
        b=translate("blocked_text2_1");
        c=count+" times.<br>";
        d=getBubbleText(count);
    }
    $("#h2_black1").html(b);
    $("#h2_red").html(c);
    $("#h2_black2").html(d);
    if(isWordList){
        if(isWordList == 'word'){
            $("#h1").html(translate("blocked_text1")+" word <span style='color:red;font-size:38px;'>"+BlockedWords[i].word+"</span> "+translate("blocked_text2"));
        }else{
            $("#h1").html(translate("blocked_text1")+" word <span style='color:red;font-size:38px;'>"+BlockedWords_spec[i].word+"</span> "+translate("blocked_text2"));
        }
    }else if(getPref("whitelist")){
        $("#h1").html(translate("blocked_text1")+" "+getPref("actualBlockedSite")+" "+translate("blocked_text2"));
        var e="";
        for(var f=0;f<BlockedSites.length;f++){
            e+=' <a href="http://'+BlockedSites[f].url+'">'+BlockedSites[f].url+"</a><br>"
        }
        $("#only_allowed").html(translate("only_allowed")+"<br>"+e);
    }else{
        $("#h1").html(translate("blocked_text1")+" <span style='color:red;font-size:38px;'>"+BlockedSites[i].url+"</span> "+translate("blocked_text2"));
    }
});