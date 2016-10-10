function setKMSecure(retry_count){
	if(retry_count > 10)
		return(false);
	else
		{
		if (typeof KM != 'undefined') //KM object is there 
			{
			if((KM.hasOwnProperty("td")) && (KM.hasOwnProperty("tds")))    //customize KM object to ensure HTTPS calls - MA Nov 21 2014
				{
					KM.td = KM.tds;
				} 	
			}
		else
			{
			var timeTilRetry = 100;
			console.error('try again in ' + timeTilRetry + 'ms -- ' + retry_count);
			setTimeout(function(){	
				setKMSecure(retry_count + 1);
				}, timeTilRetry);
			}
		}
}

setKMSecure(0);