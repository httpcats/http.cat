const fs = require('fs/promises');
const pMap = require('p-map');
const jsdom = require('jsdom');

const statuses = require('../lib/statuses');

const extractDescription = (html) => {
  const dom = new jsdom.JSDOM(html);
  const doc = dom.window.document;

  return doc.querySelector('main .section-content').textContent;
};

const fetchMDNAndSave = (statusCode) => {
  console.log(`Fetching description for code ${statusCode}...`);

  return fetch(
    `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${statusCode}`
  )
    .then((response) => {
      if (response.status !== 200)
        throw new Error(`${response.statusText} ${statusCode}`);
      return response.text();
    })
    .then(extractDescription)
    .then((description) => {
      return fs.writeFile(`./content/${statusCode}.md`, description, 'utf-8');
    });
};

(async () => {
  await pMap(Object.keys(statuses), fetchMDNAndSave, {
    concurrency: 5,
    stopOnError: false,
  });
})();
