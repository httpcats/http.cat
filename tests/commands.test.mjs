// The `:` command line's commands and matching
// (specs/0006-keyboard-navigation, "Command line").

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { COMMANDS, matchCommands } from '../lib/commands.ts';

const require = createRequire(import.meta.url);
const statuses = Object.values(require('../lib/statuses.js'));

// the rows as typed text: `theme {dark|light}` for a hint, `theme dark` (or
// `blog`) for an option
const rows = (input) =>
  matchCommands(input, statuses).entries.map((entry) =>
    entry.kind === 'hint' ? `${entry.command} ${entry.usage}` : entry.name,
  );
const errorOf = (input) => matchCommands(input, statuses).error;
const hints = ['status {code}', 'blog', 'lang {eng|cat}', 'theme {dark|light}', 'vim {on|off}'];
const statusRows = (prefix) =>
  statuses.filter(({ code }) => String(code).startsWith(prefix)).map(({ code }) => `status ${code}`);

test('an empty input lists every command with its argument, going somewhere first', () => {
  assert.deepEqual(rows(''), hints);
  assert.deepEqual(rows('   '), hints);
  assert.equal(errorOf(''), null);
});

test('what is typed must be the start of a command', () => {
  assert.deepEqual(rows('st'), ['status {code}']);
  assert.deepEqual(rows('th'), ['theme {dark|light}']);
  assert.deepEqual(rows('theme'), ['theme {dark|light}']);
  assert.deepEqual(rows('V'), ['vim {on|off}']);
  assert.deepEqual(rows('l'), ['lang {eng|cat}']);
  assert.deepEqual(rows('b'), ['blog']);
});

test('after the command and a space, the list is its values', () => {
  assert.deepEqual(rows('theme '), ['theme dark', 'theme light']);
  assert.deepEqual(rows('theme d'), ['theme dark']);
  assert.deepEqual(rows('vim '), ['vim on', 'vim off']);
  assert.deepEqual(rows('vim o'), ['vim on', 'vim off']);
  assert.deepEqual(rows('vim off'), ['vim off']);
  assert.deepEqual(rows('status '), statusRows(''));
  assert.deepEqual(rows('status 4'), statusRows('4'));
  assert.deepEqual(rows('status 40'), statusRows('40'));
  assert.deepEqual(rows('status 404'), ['status 404']);
  assert.deepEqual(rows('lang '), ['lang eng', 'lang cat']);
  assert.deepEqual(rows('lang c'), ['lang cat']);
  assert.deepEqual(rows('lang en'), ['lang eng']);
});

test('blog takes no argument: it is listed ready to run', () => {
  assert.deepEqual(rows('blog'), ['blog']);
  assert.deepEqual(rows('blog '), ['blog']);
  const [blog] = matchCommands('blog', statuses).entries;
  assert.deepEqual(blog, { kind: 'option', command: 'blog', value: '', name: 'blog', descriptionKey: 'COMMAND_BLOG' });
});

test('blog with an argument is E488', () => {
  assert.deepEqual(rows('blog x'), []);
  assert.deepEqual(errorOf('blog  hello world '), { key: 'COMMAND_TRAILING_CHARACTERS', text: 'hello world' });
});

test('case, spaces at the ends and repeated spaces are ignored', () => {
  assert.deepEqual(rows('THEME D'), ['theme dark']);
  assert.deepEqual(rows('  vim   o '), ['vim on', 'vim off']);
  assert.deepEqual(rows('STATUS   404'), ['status 404']);
});

test('options carry what the command line needs to show and run them', () => {
  const [teapot] = matchCommands('status 418', statuses).entries;
  const message = statuses.find(({ code }) => code === 418).message;
  assert.deepEqual(teapot, { kind: 'option', command: 'status', value: '418', name: 'status 418', descriptionKey: undefined, description: message });
  const [dark] = matchCommands('theme dark', statuses).entries;
  assert.deepEqual(dark, { kind: 'option', command: 'theme', value: 'dark', name: 'theme dark', descriptionKey: 'COMMAND_THEME_DARK', description: undefined });
});

test('anything that is not the start of a command is E492', () => {
  for (const input of ['dark', 'th d', 'foo', 'themes', 'statuses 404', 'st 404', 'blogs', 'language']) {
    assert.deepEqual(rows(input), [], input);
    assert.deepEqual(errorOf(input), { key: 'COMMAND_NOT_FOUND', text: input }, input);
  }
});

test('a command with a value it does not take is E474', () => {
  for (const [input, argument] of [
    ['theme blue', 'blue'], ['theme x', 'x'], ['vim offf', 'offf'], ['vim yes', 'yes'],
    ['status 999', '999'], ['status 4040', '4040'], ['status abc', 'abc'], ['status 0', '0'],
    ['lang fr', 'fr'], ['lang catalan', 'catalan'],
  ]) {
    assert.deepEqual(rows(input), [], input);
    assert.deepEqual(errorOf(input), { key: 'COMMAND_INVALID_ARGUMENT', text: argument }, input);
  }
});

test('every description and error is translated', () => {
  const keys = COMMANDS.flatMap((command) => [
    command.descriptionKey,
    ...(command.values?.(statuses) ?? []).map(({ descriptionKey }) => descriptionKey).filter(Boolean),
  ]).concat(['COMMAND_NOT_FOUND', 'COMMAND_INVALID_ARGUMENT', 'COMMAND_TRAILING_CHARACTERS']);
  for (const locale of ['en', 'ca']) {
    const t = JSON.parse(readFileSync(new URL(`../locales/${locale}/common.json`, import.meta.url), 'utf8'));
    assert.deepEqual(keys.filter((key) => !t[key]), [], `${locale} is missing command text`);
  }
});
