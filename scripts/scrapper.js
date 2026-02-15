const fs = require('fs/promises');
const pMap = require('p-map').default;
const jsdom = require('jsdom');
const TurndownService = require('turndown');

const statuses = require('../lib/statuses');
const turndownService = new TurndownService();

turndownService.addRule('customHeadings', {
  filter: function (node) {
    return (
      ['H1', 'H2'].includes(node.nodeName)
    );
  },

  replacement: function (_content, node) {
    if (node.nodeName === 'H1') // Always output "## Description" for h1
      return '\n## Description\n';

    if (node.nodeName === 'H2') // Output h2 as h3
      return '\n### ' + node.textContent.trim() + '\n';

    return '';
  }
});

const extractMainContent = (html, statusCode) => {
  const dom = new jsdom.JSDOM(html);
  const doc = dom.window.document;

  const main = doc.querySelector('main.layout__content');
  if (!main) {
    console.warn(`No <main> found for code ${statusCode}`);
    return null;
  }

  const header = main.querySelector('.reference-layout__header');
  const body = main.querySelector('.reference-layout__body');
  if (!header && !body) {
    console.warn(`No header/body found for code ${statusCode}`);
    return null;
  }

  // Remove the "Status" section if present
  const statusSection = body && body.querySelector('section[aria-labelledby="status"]');
  if (statusSection) statusSection.remove();

  // throw away h3 and beyond (hopefully we never see h7)
  body.querySelectorAll('h3, h4, h5, h6').forEach(el => el.remove());

  // Remove article-footer section if present
  const footer = body && body.querySelector('.article-footer');
  if (footer) footer.remove();

  // Combine header and body HTML
  const combinedHtml =
    (header ? header.innerHTML : '') +
    (body ? body.innerHTML : '');
  return combinedHtml.trim();
};

const fetchMDNAndSave = async (statusCode) => {
  console.log(`Fetching description for code ${statusCode}...`);

  const url = `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/${statusCode}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`Not ok: ${statusCode} (${response.status})`);
    return;
  }

  const html = await response.text();
  const mainHtml = extractMainContent(html, statusCode);
  if (!mainHtml) return;

  const markdown = turndownService.turndown(mainHtml)
    .replace(/\]\(\/([^)]+)\)/g,'](https://developer.mozilla.org/$1)') // absolute links
    .replace(/^([*-])\s{2,}/gm, '$1 ') // spaces after list markers
    .replace(/\s*$/, `\n\n**Source:** [${url}](${url})\n`);
  await fs.writeFile(`./content/${statusCode}.md`, markdown, 'utf-8');
};

(async () => {
  await pMap(Object.keys(statuses), fetchMDNAndSave, {
    concurrency: 5,
    stopOnError: false,
  });
  process.exit(0);
})();
