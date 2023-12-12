#  http.dino42 [![Build Status](https://travis-ci.com/httpcats/http.cat.svg?branch=master)](https://travis-ci.com/httpcats/http.cat)

![dino_cat_logo](https://github.com/mdabir1203/http.dino42/assets/66947064/182cb962-8e00-4415-8cf5-b509e469a132)



## About

Inspired from the age old http.cat.

Thanks @anahit for inspiring me to see that dinosaur therapy book. No wonder why there is something to learn

This is the website that is hosted at [https://http.cat](https://http.cat).


This version does not need any server side code. The API behavior is provided by a Nginx server config.

On v2.0.0 the website was built with React and pre-rendered with react-snap.

As of v3.0.0 it's built with Next.js 13.

## Development

    npm run dev

Starts the development server.

    npm test

Runs the tests.

    npm run build

Creates a build of the project.

## Adding a new image

Currently not all HTTP status codes are covered. You are welcome to create an issue or PR to cover them.

We've prepared some templates to make this process easier.

* [Landscape template](https://docs.google.com/presentation/d/1sYxNNKxUbP11kyt9oPixWdFEykHDafr4jixy9uwMh9I/edit?usp=sharing)
* [Portrait template](https://docs.google.com/presentation/d/1Ay5nattHagPfnd-gMaUHumckFt2VANaYwMkXuQ-xS6E/edit?usp=sharing)

You can clone it, replace the information with the new one and export as a JPG image.

Then, upload it to both `public/images` and `public/images-original` folders and update the [statuses.js](https://github.com/httpcats/http.cat/blob/master/lib/statuses.js) file.

## Credits

Thanks to [@girliemac](https://github.com/girliemac) for creating the amazing http status cats images.

Thanks to [@pfdborges](https://github.com/pfdborges) for creating the http.cat logo (RIP my friend).

Thanks to [@nataly-enne](https://github.com/nataly-enne) for the status 501 image.

Thanks to [@woutfeys](https://github.com/woutfeys) for the status 102 image.

Thanks to [@epitaciosilva](https://github.com/epitaciosilva) for the 407 image.

Thanks to [@luizcieslak](https://github.com/luizcieslak) for the 203 image and 407 image fix.

## Sponsor / Donate

Please consider sponsoring or donating via <a target="_blank" rel="nofollow" href="https://www.patreon.com/httpcat"><img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" alt="patron" width="100px" height="auto"></a>.

You can also adopt an HTTP Cat and have your name in the chosen cat image!

## License

MIT
