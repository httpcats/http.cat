const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const statuses = require('../lib/statuses.js');

const codes = Object.keys(statuses);
// Nginx weights have two decimal places. Round the cumulative boundaries so
// rounding errors don't all fall on the last status, which gets the remainder.
const entries = codes.map((code, index) => {
  const start = Math.floor((index * 10000) / codes.length);
  const end = Math.floor(((index + 1) * 10000) / codes.length);
  const weight = index === codes.length - 1 ? '*' : `${((end - start) / 100).toFixed(2)}%`;
  return `    ${weight.padEnd(7)} ${code};`;
});

const file = path.join(__dirname, '../deploy/nginx/http.cat.conf');
const config = readFileSync(file, 'utf8');
const header = 'split_clients $request_id $httpcat_random_code {';
const pattern = /^split_clients \$request_id \$httpcat_random_code \{\n[^}]*^\}/m;
if (!pattern.test(config)) throw new Error('Missing random image table in the Nginx config');

const updated = config.replace(pattern, [header, ...entries, '}'].join('\n'));
if (updated !== config) writeFileSync(file, updated);
