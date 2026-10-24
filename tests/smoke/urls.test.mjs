// Smoke test of the URLs described in specs/0000-baseline/spec.md, against a
// running server. Not part of `npm test`:
//
//   npm run nginx:up && npm run test:smoke          the local container
//   SMOKE_URL=https://http.cat npm run test:smoke   production
//
// Redirects aren't followed, so their Location can be checked. Only its path
// is compared: Nginx builds the host and port from the request.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pMap from 'p-map';

import { expectedStatusJson } from '../helpers/status-json.mjs';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const codes = Object.keys(require('../../lib/statuses.js'));

// 127.0.0.1 rather than localhost: the container only listens on IPv4
const base = new URL(process.env.SMOKE_URL ?? 'https://127.0.0.1:8443');
const local = ['localhost', '127.0.0.1'].includes(base.hostname);
const httpBase = new URL(local ? `http://${base.hostname}:8080` : `http://${base.hostname}`);

const cat404 = readFileSync(path.join(root, 'public/images/404.jpg'));
const json404 = expectedStatusJson(404);

function get(target, from = base) {
  const url = new URL(target, from);
  const client = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    // the local certificate is self-signed
    client
      .get(url, { rejectUnauthorized: !local }, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () =>
          resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }),
        );
      })
      .on('error', reject);
  });
}

async function check(target, expected, from = base) {
  const res = await get(target, from);
  assert.equal(res.status, expected.status, `${target}: status`);
  if (expected.type) {
    assert.equal(res.headers['content-type']?.split(';')[0], expected.type, `${target}: content type`);
  }
  if (expected.location) {
    assert.equal(new URL(res.headers.location, from).pathname, expected.location, `${target}: location`);
  }
  if (expected.body) {
    assert.ok(res.body.equals(expected.body), `${target}: body`);
  }
  if (expected.json) {
    assert.deepEqual(JSON.parse(res.body), expected.json, `${target}: body`);
  }
  if (expected.cors) {
    assert.equal(res.headers['access-control-allow-origin'], '*', `${target}: CORS header`);
  }
  return res;
}

// one request per status is ~80 requests, so run a few at a time
const checkAll = (items, fn) => pMap(items, fn, { concurrency: 8 });

describe('pages', () => {
  test('home pages', async () => {
    await check('/', { status: 200, type: 'text/html' });
    await check('/ca', { status: 200, type: 'text/html' });
  });

  test('every status page', async () => {
    await checkAll(codes, async (code) => {
      await check(`/status/${code}`, { status: 200, type: 'text/html' });
      await check(`/ca/status/${code}`, { status: 200, type: 'text/html' });
    });
  });
});

describe('images (spec 0001)', () => {
  test('every status image, with and without .jpg', async () => {
    await checkAll(codes, async (code) => {
      await check(`/${code}`, { status: 200, type: 'image/jpeg' });
      await check(`/${code}.jpg`, { status: 200, type: 'image/jpeg' });
    });
  });

  test('/404 is the 404 cat, whatever the build output contains', async () => {
    await check('/404', { status: 200, type: 'image/jpeg', body: cat404 });
  });

  test('hidden image and easter egg', async () => {
    await check('/0', { status: 200, type: 'image/jpeg' });
    await check('/dog', { status: 302, location: '/400' });
    await check('/dog.jpg', { status: 302, location: '/400.jpg' });
  });
});

describe('JSON (spec 0003)', () => {
  test('every status', async () => {
    await checkAll(codes, (code) =>
      check(`/${code}.json`, {
        status: 200,
        type: 'application/json',
        cors: true,
        json: expectedStatusJson(code),
      }),
    );
  });

  test('unknown codes get the 404 JSON', async () => {
    for (const target of ['/999.json', '/0.json']) {
      await check(target, { status: 404, type: 'application/json', cors: true, json: json404 });
    }
  });

  test('not JSON URLs', async () => {
    await check('/ca/500.json', { status: 404, type: 'image/jpeg', body: cat404 });
    await check('/dog.json', { status: 404, type: 'image/jpeg', body: cat404 });
  });
});

describe('static files', () => {
  test('files in public/', async () => {
    await check('/robots.txt', { status: 200, type: 'text/plain' });
    await check('/manifest.json', { status: 200, type: 'application/json' });
    await check('/favicon.ico', { status: 200 });
    await check('/opensearch.xml', { status: 200 });
  });

  test("Next's not-found page (spec 0002)", async () => {
    await check('/404.html', { status: 200, type: 'text/html' });
    await check('/_not-found', { status: 200, type: 'text/html' });
  });
});

describe('not found', () => {
  test('unknown URLs and directories are the 404 cat', async () => {
    for (const target of ['/999', '/nope', '/status', '/images']) {
      await check(target, { status: 404, type: 'image/jpeg', body: cat404 });
    }
  });
});

describe('redirects', () => {
  test('trailing slashes are stripped', async () => {
    await check('/status/404/', { status: 301, location: '/status/404' });
    await check('/404/', { status: 301, location: '/404' });
    await check('/500.json/', { status: 301, location: '/500.json' });
    await check('/nope/', { status: 301, location: '/nope' });
  });

  test('http redirects to https', async () => {
    const res = await check('/status/404', { status: 301, location: '/status/404' }, httpBase);
    assert.equal(new URL(res.headers.location).protocol, 'https:');
  });
});
