// lib/site.ts helpers that don't need a build: the path of a page in the
// other language, used by the `:lang` command (spec 0006).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pathInLanguage } from '../lib/site.ts';

test('a translated page goes to the same page in the other language', () => {
  assert.equal(pathInLanguage('/', 'ca'), '/ca');
  assert.equal(pathInLanguage('/ca', 'en'), '/');
  assert.equal(pathInLanguage('/status/404', 'ca'), '/ca/status/404');
  assert.equal(pathInLanguage('/ca/status/404', 'en'), '/status/404');
});

test('a page in its own language stays where it is', () => {
  assert.equal(pathInLanguage('/status/200', 'en'), '/status/200');
  assert.equal(pathInLanguage('/ca/status/200', 'ca'), '/ca/status/200');
  assert.equal(pathInLanguage('/ca', 'ca'), '/ca');
});

test("a page that isn't translated goes to that language's home page", () => {
  assert.equal(pathInLanguage('/blog', 'ca'), '/ca');
  assert.equal(pathInLanguage('/blog/hello-world', 'ca'), '/ca');
  assert.equal(pathInLanguage('/blog', 'en'), '/');
  assert.equal(pathInLanguage('/nope', 'ca'), '/ca');
});
