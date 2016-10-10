var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-44655956-12']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var links = document.getElementsByTagName("a"),
	pages = ["facebook", "twitter", "blocked"];

for(var i = 0, j = links.length; i < j; i++) {

	(function (index) {

		links[index].addEventListener("click", function (e) {

			e.preventDefault();

			var to = links[index].getAttribute("href");

			for(var k = 0, l = pages.length; k < j; k++) {

				if(to.indexOf(pages[k]) !== -1) {

					_gaq.push(['_trackEvent', 'Story page', pages[k]]);

					if(to.indexOf("https://") !== -1) {

						var a = document.createElement("a");

						a.setAttribute("href", to);

						a.setAttribute("target", "_blank");

						a.click();

					} else {

						window.location.href = to;

					}

				}

			}

		})

	})(i);

}