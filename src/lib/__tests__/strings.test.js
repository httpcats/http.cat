import getString, { strings } from '../strings'

beforeEach(() => {
  // required hack for jsdom
  delete window.location
  window.location = { search: '' }
})

it('returns en strings when lang is param is missing', () => {
  expect(getString('APP_TITLE')).toEqual(strings['en']['APP_TITLE'])
})

it('returns en strings when lang is en', () => {
  window.location.search = '?lang=en'

  expect(getString('APP_TITLE')).toEqual(strings['en']['APP_TITLE'])
})

it('returns cat strings when lang is cat', () => {
  window.location.search = '?lang=cat'

  expect(getString('APP_TITLE')).toEqual(strings['cat']['APP_TITLE'])
})
