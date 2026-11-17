HTTP Gats és un lloc web i una API on podeu aprendre sobre els codis d'estat
HTTP mentre us feu un tip de riure amb fotos de gats. Cada codi d'estat va
acompanyat d'un gat que fa alguna cosa relacionada amb la descripció d'aquell
codi.

El podeu fer servir com a eina d'aprenentatge o com a API. Enllaçar-ne les
imatges directament (hotlinking) és més que benvingut.

El projecte és de codi obert i el trobareu a GitHub, a
[httpcats/http.cat](https://github.com/httpcats/http.cat).

Amb els anys, HTTP Gats s'ha convertit en un èxit d'internet gràcies a la
fantàstica comunitat de desenvolupadors que no para de compartir-lo, de fer-lo
servir i de contribuir-hi.

Si voleu saber més sobre com va començar tot, continueu llegint.

## La història

### La primera versió

HTTP Gats va néixer poc després que descobrís el conjunt de fotos
[HTTP Status Cats](https://www.flickr.com/photos/girliemac/sets/72157628409467125)
de [Tomomi Imura](https://girliemac.com) a Flickr, que s'estava fent viral a
Hacker News.

La idea em va fer tanta gràcia que vaig haver d'idear una manera més fàcil de
compartir-la, i de reutilitzar les imatges als servidors web cada vegada que
es produeix un codi d'estat determinat.

Node.js començava a estar molt de moda, i jo buscava excuses per fer-lo servir
a tot arreu, així que vaig trigar 20 minuts a construir la primera versió: un
servidor web en Node.js molt ingenu que servia les imatges. El vaig desplegar
a Heroku, i un parell de minuts després ja funcionava a
`httpcats.herokuapp.com`.

El codi encara és a GitHub, a
[httpcats/http-status-cats-api](https://github.com/httpcats/http-status-cats-api).
Doneu un cop d'ull al
[primer commit](https://github.com/httpcats/http-status-cats-api/blob/f8789e5415a6128a83abf294baccf36998c0d00f/index.js)
per veure'n la implementació inicial.

<img src="/about/heroku-2011.webp" width="900" height="270" alt="La pàgina d'inici d'HTTP Gats a Heroku el desembre de 2011: el títol HTTP Status Cats, la línia d'ús http://httpcats.herokuapp.com/[http_status_code], una nota sobre afegir .jpg a l'URL, una llista de 23 codis d'estat del 100 al 599 i els crèdits: Developed by Rogério Vicente. Photos from GirlieMac.">

Així és com es veia el desembre de 2011: 23 codis d'estat i una línia de
crèdits.

### Una nova era: http.cat

L'agost de 2015, gairebé quatre anys després, vaig tenir l'oportunitat de
registrar el domini http.cat, que encaixava perfectament amb el projecte. I
així va passar a ser http.cat, i amb el nou domini van arribar un servidor
dedicat nou, una nova implementació del back-end i un «disseny» nou.

El nou back-end era una única configuració d'Nginx, sense codi d'aplicació,
cosa que a la llarga va resultar ser una solució molt més escalable, sobretot
combinada amb Cloudflare.

<img src="/about/http-cat-2015.webp" width="1100" height="646" alt="La pàgina d'inici d'http.cat el setembre de 2015: el títol HTTP Status Cats API, la línia d'ús https://http.cat/[status_code], una nota sobre afegir .jpg a l'URL i les primeres files de codis d'estat disponibles, cadascun amb una franja de la seva foto de gat i el codi a sobre: 100, 101 i 200; 402, 403 i 404; 423, 424 i 425.">

Setembre de 2015

### El logotip

L'octubre de 2017 HTTP Gats va estrenar logotip: el dibuix lineal d'un gat, el
mateix que el lloc fa servir avui. Va arribar amb una nova icona del lloc
(favicon), i el nom del lloc va passar de «HTTP Status Cats API» a simplement
«HTTP Cats». La resta de la pàgina es va quedar igual.

<img src="/about/http-cat-2017.webp" width="1100" height="489" alt="La pàgina d'inici d'http.cat el novembre de 2017: el logotip negre del gat al costat del títol HTTP Cats, la línia d'ús https://http.cat/[status_code], una nota sobre afegir .jpg a l'URL i la primera fila de codis d'estat disponibles, cadascun amb una franja de la seva foto de gat i el codi a sobre: 100, 403 i 423.">

Novembre de 2017

### Un disseny de veritat

El 2019 vaig reescriure el lloc des de zero amb React, i amb això va arribar
el seu primer disseny de veritat: el logotip i el títol en vermell, i una
targeta per a cada estat amb la foto sencera del gat, el codi i el nom, en lloc
d'una franja de la imatge. La nova versió es va publicar el maig de 2019.

<img src="/about/http-cat-2019.webp" width="1100" height="593" alt="La pàgina d'inici d'http.cat el juny de 2019: el logotip vermell del gat al costat del títol HTTP Cats, la línia d'ús https://http.cat/[status_code], una nota sobre afegir .jpg a l'URL i la primera fila de targetes d'estat, cadascuna amb una foto de gat a sobre d'un plafó vermell amb el codi i el nom: 100 Continue, 101 Switching Protocols i 200 OK.">

Juny de 2019

### El tema fosc

El juliol de 2021 el lloc va estrenar un tema fosc, una contribució de David
Cruz a [#120](https://github.com/httpcats/http.cat/pull/120). Segueix la
configuració del vostre sistema operatiu, i des del novembre de 2026 també el
podeu triar vosaltres mateixos a la Configuració, o amb `:theme dark` a la
línia d'ordres.

<img src="/about/http-cat-2021.webp" width="1100" height="604" alt="La pàgina d'inici d'http.cat amb el tema fosc l'agost de 2021: el logotip vermell del gat i el títol HTTP Cats sobre un fons gris fosc, la línia d'ús https://http.cat/[status_code] amb un botó per copiar-la, una nota sobre afegir .jpg a l'URL i la primera fila de targetes d'estat: 100 Continue, 101 Switching Protocols i 102 Processing.">

Agost de 2021

## Avui

Quinze anys després, HTTP Gats continua sent la mateixa idea: un gat per a un
codi d'estat HTTP, a un URL de distància. Va començar com un projecte paral·lel
de 20 minuts i encara ho és, i continua viu gràcies a les fotos de Tomomi Imura
i a tothom qui el fa servir, el comparteix i hi contribueix. Moltes gràcies, i
que totes les vostres respostes siguin 200.
