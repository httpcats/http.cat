# CORS support for images

The cat images are now sent with `Access-Control-Allow-Origin: *`, so your
site can draw them on a canvas, `fetch()` them, or load them with
`<img crossorigin>`.

Showing a cat on your own site has always worked:
`<img src="https://http.cat/404">` and that's it. But that was all a browser
would let another site do with it. Draw it on a `<canvas>` and try to read
the pixels back, and you got a `SecurityError`. `fetch()` it, and you got a
CORS error. The [JSON](/blog/json-api) has had the header since it launched,
but the images didn't. That's been
[issue #214](https://github.com/httpcats/http.cat/issues/214) since the end
of 2023, and it's finally closed.

## Usage

Nothing changes for a plain `<img>`. For anything else, use the same URLs as
always, `https://http.cat/<code>` or `https://http.cat/<code>.jpg`.

To draw a cat on a canvas and read it back, set `crossOrigin` before `src`:

```js
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'https://http.cat/418';
await img.decode();

const canvas = document.createElement('canvas');
canvas.width = img.naturalWidth;
canvas.height = img.naturalHeight;

const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);
ctx.font = 'bold 64px sans-serif';
ctx.fillText('short and stout', 40, 100);

const meme = canvas.toDataURL('image/png');
```

Without `crossOrigin`, the cat still shows up on the canvas, but the canvas
is "tainted" and `toDataURL()` throws.

You can also `fetch()` the image, to check that it loaded, keep it in a
service worker cache, or store it in IndexedDB:

```js
const res = await fetch('https://http.cat/503');
const blob = await res.blob();
```

And if your page sends `Cross-Origin-Embedder-Policy: require-corp`, the cats
now load there too, with the `crossorigin` attribute:

```html
<img crossorigin="anonymous" src="https://http.cat/404" alt="404 Not Found">
```

## Unknown codes

A code without a cat, like `/999`, returns a `404` with the 404 cat, and that
has the header too. So `<img crossorigin>` shows the 404 cat instead of a
broken image, and `fetch()` resolves instead of failing. Like with the JSON,
check the response status:

```js
const res = await fetch('https://http.cat/999');
if (!res.ok) {
  // no such status, but res.blob() is still the 404 cat
}
```

Only the API URLs have the header. The `/images/<code>.jpg` URLs the site
uses for its own thumbnails don't, so use `https://http.cat/<code>`.

## If it still fails

The images are cached for a very long time. If your browser cached a cat
before today, it may reuse that copy, which doesn't have the header, for a
`crossorigin` request, and the request fails. This only happens if your site
already showed that cat with a plain `<img>`. Adding a query string skips the
old copy:

```js
img.src = 'https://http.cat/404?v=1';
```

Go make some memes, and [let me know](https://github.com/httpcats/http.cat/issues)
what you build.
