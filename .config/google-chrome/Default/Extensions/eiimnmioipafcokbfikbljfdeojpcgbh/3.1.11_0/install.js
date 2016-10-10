/*
 * @projectDescription saves default user settings to localStorage when
 * extension is intalled
 *
 * @author Frantisek Musil - frantisek.musil@wips.com
 * @version 1.0
 *
 */

var Install = (function () {

	/* 
	 * Sets default user settings to localStorage
	 *
	 * @param { object }
	 * @return none
	 *
	 */
	chrome.runtime.onInstalled.addListener(function ( details ) {

		// Check if extension was just installed
		if(details.reason === "install" || details.reason === "update") {

			// Save date when should be story page viewed by getting install / update date
			// and add 14 days to it (1209600000 miliseconds)
			localStorage.setItem("story_page_delay", JSON.stringify(new Date().getTime() + 1209600000));

			// Save information if story page was already displayed (false by default)
			localStorage.setItem("story_page_displayed", JSON.stringify(false));

		}

	});

})();