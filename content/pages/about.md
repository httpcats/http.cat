HTTP Cats is a website and API where you can learn about HTTP status codes
while having a laugh with cat pictures. Each status code is paired with a cat
that is doing something related to the description of that code.

You can use it as a learning tool or as an API. Hotlinking is encouraged.

The project is open source and can be found on GitHub at
[httpcats/http.cat](https://github.com/httpcats/http.cat).

Over the years, HTTP Cats has become an internet success thanks to the amazing
developer community that is always sharing it, using it, and contributing to
it.

If you want to know more about how it all started, read on.

## The story

### The first version

HTTP Cats was born shortly after I stumbled upon the
[HTTP Status Cats](https://www.flickr.com/photos/girliemac/sets/72157628409467125)
Flickr set by [Tomomi Imura](https://girliemac.com), which was going viral on
Hacker News.

I found the idea so funny that I had to come up with an easier way to share
it, and to reuse the images in web servers whenever a given status code
occurs.

Node.js was becoming all the rage, and I was finding excuses to use it
everywhere, so it took me 20 minutes to build the first version: a very
naive Node.js web server that served the images. I deployed it on Heroku, and
a couple of minutes later it was live at `httpcats.herokuapp.com`.

The code is still on GitHub, in
[httpcats/http-status-cats-api](https://github.com/httpcats/http-status-cats-api).
Check out
[the first commit](https://github.com/httpcats/http-status-cats-api/blob/f8789e5415a6128a83abf294baccf36998c0d00f/index.js)
to see the initial implementation.

<img src="/about/heroku-2011.webp" width="900" height="270" alt="The HTTP Cats home page on Heroku in December 2011: the heading HTTP Status Cats, the usage line http://httpcats.herokuapp.com/[http_status_code], a note about adding .jpg to the URL, a list of 23 status codes from 100 to 599, and the credits: Developed by Rogério Vicente. Photos from GirlieMac.">

This is how it looked in December 2011: 23 status codes and a line of
credits.

### A new era: http.cat

In August 2015, almost four years later, I came across the opportunity to
register the http.cat domain, which was a perfect fit for the project. And so
it became http.cat, and with the new domain came a new dedicated server, a new
back-end implementation, and a new "design".

The new back-end was a single Nginx config, with no application-level code,
which turned out to be a much more scalable solution in the long run,
especially when paired with Cloudflare.

<img src="/about/http-cat-2015.webp" width="1100" height="646" alt="The http.cat home page in September 2015: the heading HTTP Status Cats API, the usage line https://http.cat/[status_code], a note about adding .jpg to the URL, and the first rows of available status codes, each a strip of its cat photo with the code on it: 100, 101 and 200, 402, 403 and 404, 423, 424 and 425.">

September 2015

### The logo

In October 2017 HTTP Cats got its logo: a line drawing of a cat, the same one
the site uses today. It came with a new favicon, and the site's name changed
from "HTTP Status Cats API" to just "HTTP Cats". The rest of the page stayed
the same.

<img src="/about/http-cat-2017.webp" width="1100" height="489" alt="The http.cat home page in November 2017: the black cat logo next to the heading HTTP Cats, the usage line https://http.cat/[status_code], a note about adding .jpg to the URL, and the first row of available status codes, each a strip of its cat photo with the code on it: 100, 403 and 423.">

November 2017

### A proper design

In 2019 I rewrote the site from scratch with React, and with it came its first
proper design: the logo and title in red, and a card for each status with the
whole cat photo, its code and its name, instead of a strip of the image. The
rewrite went live in May 2019.

<img src="/about/http-cat-2019.webp" width="1100" height="593" alt="The http.cat home page in June 2019: the red cat logo next to the heading HTTP Cats, the usage line https://http.cat/[status_code], a note about adding .jpg to the URL, and the first row of status cards, each a cat photo above a red panel with the code and its name: 100 Continue, 101 Switching Protocols and 200 OK.">

June 2019

### The dark theme

In July 2021 the site got a dark theme, contributed by David Cruz in
[#120](https://github.com/httpcats/http.cat/pull/120). It follows your
operating system's setting, and since November 2026 you can also choose it
yourself in the settings, or with `:theme dark` in the command line.

<img src="/about/http-cat-2021.webp" width="1100" height="604" alt="The http.cat home page in the dark theme in August 2021: the red cat logo and heading HTTP Cats on a dark grey background, the usage line https://http.cat/[status_code] with a copy button, a note about adding .jpg to the URL, and the first row of status cards: 100 Continue, 101 Switching Protocols and 102 Processing.">

August 2021

## Today

Fifteen years later, HTTP Cats is still the same idea: a cat for an HTTP
status code, one URL away. It started as a 20-minute side project and it's
still a side project, kept alive by Tomomi's photos and by everyone who uses
it, shares it and contributes to it. Thank you, and may all your responses be
200s.
