(function (document, navigator, CACHE, IE9TO11) {
	if (IE9TO11) document.addEventListener('DOMContentLoaded', function () {
		[].forEach.call(document.querySelectorAll('use'), function (use) {
			var
			svg = use.parentNode,
			url = use.getAttribute('xlink:href').split('#'),
			url_root = url[0],
			url_hash = url[1],
			xhr = CACHE[url_root] = CACHE[url_root] || new XMLHttpRequest();

			if (!xhr.s) {
				xhr.s = [];

				xhr.open('GET', url_root);

				xhr.onload = function () {
					var x = document.createElement('x'), s = xhr.s;

					x.innerHTML = xhr.responseText;

					xhr.onload = function () {
						s.splice(0).map(function (array) {
							var g = x.querySelector('#' + array[2]);

							if (g) array[0].replaceChild(g.cloneNode(true), array[1]);
						});
					};

					xhr.onload();
				};

				xhr.send();
			}

			xhr.s.push([svg, use, url_hash]);

			if (xhr.responseText) xhr.onload();
		});
	});
})(
	document,
	navigator,
	{},
	/Trident\/[567]\b/.test(navigator.userAgent)
);
