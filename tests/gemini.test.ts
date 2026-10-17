import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractJSONArray, normalizeParsedItem, textFromResponse } from '../src/services/claude';

const reply = (text: string, finishReason = 'STOP') => ({
  candidates: [{ content: { parts: [{ text }] }, finishReason }],
});

test('reads a normal JSON array reply', () => {
  const text = textFromResponse(reply('[{"name":"Milk","qty":1}]'));
  assert.deepEqual(extractJSONArray(text), [{ name: 'Milk', qty: 1 }]);
});

test('accepts an array wrapped in an object', () => {
  assert.deepEqual(extractJSONArray('{"items":[{"name":"Eggs"}]}'), [{ name: 'Eggs' }]);
});

test('an empty answer or [] means nothing was found', () => {
  assert.deepEqual(extractJSONArray(''), []);
  assert.deepEqual(extractJSONArray('[]'), []);
});

test('a reply cut off by the token limit is an error, not "no items"', () => {
  const cut = reply('[{"name":"Milk","qty":1},{"name":"Bre', 'MAX_TOKENS');
  assert.throws(() => textFromResponse(cut), /cut off/);
  assert.throws(() => textFromResponse(reply('', 'MAX_TOKENS')), /ran out of room/);
});

test('blocked requests and unreadable replies explain themselves', () => {
  assert.throws(() => textFromResponse({ promptFeedback: { blockReason: 'SAFETY' } }), /refused.*SAFETY/);
  assert.throws(() => extractJSONArray('Sorry, I cannot read this receipt.'), /Couldn't read/);
});

test('thinking parts are ignored', () => {
  const data = { candidates: [{ content: { parts: [{ text: 'hmm…', thought: true }, { text: '[]' }] }, finishReason: 'STOP' }] };
  assert.equal(textFromResponse(data), '[]');
});

test('numbers sent as text are converted; nameless entries dropped', () => {
  assert.deepEqual(normalizeParsedItem({ name: ' Atta ', qty: '5', days: '180 days', price: '₹260', zone: 'Pantry' }), {
    name: 'Atta', emoji: '', qty: 5, unit: '', days: 180, cat: '', zone: 'pantry', spot: '', tip: '', price: 260, store: '', date: '',
  });
  assert.equal(normalizeParsedItem({ qty: 2 }), null);
  assert.equal(normalizeParsedItem({ name: 'Salt', zone: 'cupboard' })?.zone, 'pantry');
});
