# http.cat

![HTTP Cat picture](https://http.cat/204)

## About

This is the website that is hosted at [https://http.cat](https://http.cat).

The code for the older version hosted at the heroku platform is at the [http-status-cats-api](https://github.com/rogeriopvl/http-status-cats-api) repo.

This version does not need any server side code. The API behavior is provided by a Nginx server config.

On v2.0.0 the website was built with React and pre-rendered with react-snap.

As of v3.0.0 it's built with Next.js (currently version 16).

## Usage

Every status code is an image: `https://http.cat/<code>` (or `https://http.cat/<code>.jpg`), e.g. [https://http.cat/404](https://http.cat/404).

The same information as the status page is also available as JSON at `https://http.cat/<code>.json`:

    curl https://http.cat/500.json

```json
{
  "status": 500,
  "name": "Internal Server Error",
  "description": "The HTTP `500 Internal Server Error` server error response code indicates ...",
  "image": "https://http.cat/500",
  "url": "https://http.cat/status/500"
}
```

`description` is Markdown. The JSON can be fetched from other sites (it's sent with `Access-Control-Allow-Origin: *`). A code that doesn't exist, e.g. `/999.json`, returns a `404` with the body of `/404.json`, so check the HTTP status rather than the `status` field.

## Postman Collection

There's a [Postman collection](https://documenter.getpostman.com/view/6034746/SzzrWt5f) with requests for the HTTP status cats, created by [@SubramanyaRaj5](https://github.com/SubramanyaRaj5). Use the button below to import it into your Postman app.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/6034746/SzzrWt5f)

## Using HTTP Cats as Nginx Error Pages

You can make your own Nginx server show HTTP Cats on its error pages with the [`integrations/nginx/http-cats.conf`](integrations/nginx/http-cats.conf) snippet. Download it to your Nginx snippets folder:

    sudo wget -O /etc/nginx/snippets/http-cats.conf https://raw.githubusercontent.com/httpcats/http.cat/master/integrations/nginx/http-cats.conf

Then include it in the `server` block(s) where you want the cats:

```nginx
server {
    # ...
    include snippets/http-cats.conf;
}
```

Reload Nginx with `sudo nginx -t && sudo systemctl reload nginx`, and visit a page that doesn't exist to see the 404 cat.

A few things to keep in mind:

- The original status code is kept, only the response body is replaced by the cat image.
- A `location` that defines its own `error_page` doesn't inherit these.
- If Nginx is a reverse proxy for an app, add `proxy_intercept_errors on;` to that `location` so the app's error responses also get cats.
- Each error page is fetched from http.cat. If it's unreachable, or its certificate can't be verified, Nginx responds with its own `502 Bad Gateway` instead.
- Nothing from your visitors' requests (cookies, `Authorization` headers, bodies) is sent to http.cat, and only the image comes back: no cookies, always `image/jpeg`. http.cat's certificate is verified against `/etc/ssl/certs/ca-certificates.crt`; on RHEL and Fedora, change that path to `/etc/pki/tls/certs/ca-bundle.crt`.

Based on [this gist](https://gist.github.com/mjmeyer/6cf8d3c1199d028f0921) by [@mjmeyer](https://github.com/mjmeyer), suggested by [@mishailovic](https://github.com/mishailovic) in [#126](https://github.com/httpcats/http.cat/issues/126).

## Development

    npm run dev

Runs the development server.

    npm run build

Creates a build of the project.

    npm test

Checks the content and the build output (run `npm run build` first).

    npm run nginx:up
    npm run test:smoke
    npm run nginx:down

Serves `out/` through the production Nginx config in Docker at https://localhost:8443 (with a self-signed certificate, so accept the browser warning), and checks every URL the specs describe against it. Use it before deploying: `npm run dev` doesn't run Nginx, so the image URLs (`/404`) and the JSON 404s and CORS header only work there. Don't use http://localhost:8080: like production, it redirects to `https://http.cat`, the live site. Run `npm run nginx:up` again after each build. If your user can't use Docker directly, the script runs `docker` with `sudo`. `SMOKE_URL=https://http.cat npm run test:smoke` runs the same checks against production.

New features and behavior changes start as a spec, see [specs/README.md](specs/README.md).

## Adding a new image

Currently not all HTTP status codes are covered. You are welcome to create an issue or PR to cover them.

We've prepared some templates to make this process easier.

- [Landscape template](https://docs.google.com/presentation/d/1sYxNNKxUbP11kyt9oPixWdFEykHDafr4jixy9uwMh9I/edit?usp=sharing)
- [Portrait template](https://docs.google.com/presentation/d/1Ay5nattHagPfnd-gMaUHumckFt2VANaYwMkXuQ-xS6E/edit?usp=sharing)

You can clone it, replace the information with the new one and export as a JPG image.

Then, upload it to both `public/images` and `public/images-original` folders and update the [statuses.js](https://github.com/httpcats/http.cat/blob/master/lib/statuses.js) file.

Finally you need to add a markdown file in `/content/<status-code>.md` with a
description of the status code and links to official documentation. Please
follow the format of already existing files.
Also, copy this file over to `/content/ca` and ask Copilot, ChatGPT or Google,
etc to translate the content to Catalan.

## Credits

Thanks to [@girliemac](https://github.com/girliemac) for creating the amazing http status cats images.

Thanks to [@pfdborges](https://github.com/pfdborges) for creating the http.cat logo (RIP my friend).

#### Thanks to all the contributors:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://ushuz.im"><img src="https://avatars.githubusercontent.com/u/1430856?v=4?s=100" width="100px;" alt="John HU"/><br /><sub><b>John HU</b></sub></a><br /><a href="#data-ushuz" title="Data">🔣</a> <a href="#a11y-ushuz" title="Accessibility">️️️️♿️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://girliemac.com"><img src="https://avatars.githubusercontent.com/u/107763?v=4?s=100" width="100px;" alt="Tomomi ❤ Imura"/><br /><sub><b>Tomomi ❤ Imura</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=girliemac" title="Code">💻</a> <a href="#content-girliemac" title="Content">🖋</a> <a href="#translation-girliemac" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/strangeloveBsc"><img src="https://avatars.githubusercontent.com/u/3050149?v=4?s=100" width="100px;" alt="strangeloveBsc"/><br /><sub><b>strangeloveBsc</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=strangeloveBsc" title="Code">💻</a> <a href="#design-strangeloveBsc" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://nataly-enne.github.io"><img src="https://avatars.githubusercontent.com/u/26802307?v=4?s=100" width="100px;" alt="Nátaly Enne "/><br /><sub><b>Nátaly Enne </b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=nataly-enne" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://blom.de"><img src="https://avatars.githubusercontent.com/u/4670057?v=4?s=100" width="100px;" alt="Lennart Blom"/><br /><sub><b>Lennart Blom</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=lennartblom" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bitterpanda63"><img src="https://avatars.githubusercontent.com/u/28490560?v=4?s=100" width="100px;" alt="BitterPanda"/><br /><sub><b>BitterPanda</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=bitterpanda63" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/katrinleinweber"><img src="https://avatars.githubusercontent.com/u/9948149?v=4?s=100" width="100px;" alt="Katrin Leinweber"/><br /><sub><b>Katrin Leinweber</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=katrinleinweber" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/luizcieslak"><img src="https://avatars.githubusercontent.com/u/14146176?v=4?s=100" width="100px;" alt="Luiz Fernando da Silva Cieslak"/><br /><sub><b>Luiz Fernando da Silva Cieslak</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=luizcieslak" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.blog.ljrk.org/"><img src="https://avatars.githubusercontent.com/u/7831843?v=4?s=100" width="100px;" alt="Leonard Janis Robert König"/><br /><sub><b>Leonard Janis Robert König</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=ljrk0" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://omarefg.com/"><img src="https://avatars.githubusercontent.com/u/30012444?v=4?s=100" width="100px;" alt="Omar Flores Grimontt"/><br /><sub><b>Omar Flores Grimontt</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=omarefg" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fafrd"><img src="https://avatars.githubusercontent.com/u/5905628?v=4?s=100" width="100px;" alt="Kian"/><br /><sub><b>Kian</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=fafrd" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dcruz"><img src="https://avatars.githubusercontent.com/u/401064?v=4?s=100" width="100px;" alt="David Cruz"/><br /><sub><b>David Cruz</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=dcruz" title="Code">💻</a> <a href="#design-dcruz" title="Design">🎨</a> <a href="#a11y-dcruz" title="Accessibility">️️️️♿️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://m4thieulavoie.dev/"><img src="https://avatars.githubusercontent.com/u/44816587?v=4?s=100" width="100px;" alt="Matt Lavoie"/><br /><sub><b>Matt Lavoie</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=m4thieulavoie" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zurgeg"><img src="https://avatars.githubusercontent.com/u/46549042?v=4?s=100" width="100px;" alt="zurgeg"/><br /><sub><b>zurgeg</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=zurgeg" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Joshix-1"><img src="https://avatars.githubusercontent.com/u/57299889?v=4?s=100" width="100px;" alt="Joshix-1"/><br /><sub><b>Joshix-1</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=Joshix-1" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kiriya-aoi"><img src="https://avatars.githubusercontent.com/u/34067059?v=4?s=100" width="100px;" alt="kiriya-aoi"/><br /><sub><b>kiriya-aoi</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=kiriya-aoi" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/CutiePi"><img src="https://avatars.githubusercontent.com/u/17714927?v=4?s=100" width="100px;" alt="Jasmin Lapointe"/><br /><sub><b>Jasmin Lapointe</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=CutiePi" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Arnau478"><img src="https://avatars.githubusercontent.com/u/61841960?v=4?s=100" width="100px;" alt="Arnau"/><br /><sub><b>Arnau</b></sub></a><br /><a href="#translation-Arnau478" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mathiazom"><img src="https://avatars.githubusercontent.com/u/24361490?v=4?s=100" width="100px;" alt="Mathias Oterhals Myklebust"/><br /><sub><b>Mathias Oterhals Myklebust</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=mathiazom" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ronan-s1"><img src="https://avatars.githubusercontent.com/u/85257187?v=4?s=100" width="100px;" alt="Ronan"/><br /><sub><b>Ronan</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=ronan-s1" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AlexMayol"><img src="https://avatars.githubusercontent.com/u/11309999?v=4?s=100" width="100px;" alt="Alejandro Mayol"/><br /><sub><b>Alejandro Mayol</b></sub></a><br /><a href="#design-AlexMayol" title="Design">🎨</a> <a href="https://github.com/httpcats/http.cat/commits?author=AlexMayol" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/NoobTracker"><img src="https://avatars.githubusercontent.com/u/63962365?v=4?s=100" width="100px;" alt="NoobTracker"/><br /><sub><b>NoobTracker</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=NoobTracker" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mokazemi"><img src="https://avatars.githubusercontent.com/u/18334056?v=4?s=100" width="100px;" alt="Mohammad Kazemi"/><br /><sub><b>Mohammad Kazemi</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=mokazemi" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://about.me/lucasmezencio"><img src="https://avatars.githubusercontent.com/u/472412?v=4?s=100" width="100px;" alt="Lucas Mezêncio"/><br /><sub><b>Lucas Mezêncio</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=lucasmezencio" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://stackoverflow.com/"><img src="https://avatars.githubusercontent.com/u/90441096?v=4?s=100" width="100px;" alt="Xeno"/><br /><sub><b>Xeno</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=Xenofic" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/santiago-salinas"><img src="https://avatars.githubusercontent.com/u/48341470?v=4?s=100" width="100px;" alt="Santiago Salinas"/><br /><sub><b>Santiago Salinas</b></sub></a><br /><a href="#content-santiago-salinas" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/karlhiramoto"><img src="https://avatars.githubusercontent.com/u/22713?v=4?s=100" width="100px;" alt="Karl Hiramoto"/><br /><sub><b>Karl Hiramoto</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=karlhiramoto" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.earthtonesmusic.us/"><img src="https://avatars.githubusercontent.com/u/92189031?v=4?s=100" width="100px;" alt="Anisah Majeed"/><br /><sub><b>Anisah Majeed</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=yellowstrings" title="Code">💻</a> <a href="#content-yellowstrings" title="Content">🖋</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/matasaru"><img src="https://avatars.githubusercontent.com/u/1546100?v=4?s=100" width="100px;" alt="mata saru"/><br /><sub><b>mata saru</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=matasaru" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ddelange"><img src="https://avatars.githubusercontent.com/u/14880945?v=4?s=100" width="100px;" alt="ddelange"/><br /><sub><b>ddelange</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=ddelange" title="Code">💻</a> <a href="#content-ddelange" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://drweissbrot.net"><img src="https://avatars.githubusercontent.com/u/11035385?v=4?s=100" width="100px;" alt="Pierre Borgmann"/><br /><sub><b>Pierre Borgmann</b></sub></a><br /><a href="#content-drweissbrot" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://helbling.uk"><img src="https://avatars.githubusercontent.com/u/29527289?v=4?s=100" width="100px;" alt="Lilly Helbling"/><br /><sub><b>Lilly Helbling</b></sub></a><br /><a href="https://github.com/httpcats/http.cat/commits?author=helblinglilly" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=httpcats/http.cat&type=Date)](https://star-history.com/#httpcats/http.cat&Date)

## Sponsor / Donate

Please consider sponsoring or donating via the following options:

<a target="_blank" rel="nofollow" href="https://www.patreon.com/httpcat"><img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" alt="patron" width="174px" height="41"></a> <a href="https://www.buymeacoffee.com/http.cat" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="41" width="174"></a>

You can also adopt an HTTP Cat and have your name in the chosen cat image!

## License

MIT
