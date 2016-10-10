window.addEventListener('load', function () {

	document.getElementById('skip-button').addEventListener('click', function () {
		window.location = JSON.parse(localStorage.getItem('story_page_source'));
	})	

});