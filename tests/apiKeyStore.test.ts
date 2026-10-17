import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApiKeyStore, KV, LEGACY_KEY, SECURE_KEY } from '../src/apiKeyStore';

function memKV(init: Record<string, string> = {}): KV & { data: Record<string, string> } {
  const data = { ...init };
  return {
    data,
    getItem: async (k) => (k in data ? data[k] : null),
    setItem: async (k, v) => { data[k] = v; },
    removeItem: async (k) => { delete data[k]; },
  };
}

test('a key saved in plain storage by older versions is moved to the keystore', async () => {
  const secure = memKV();
  const plain = memKV({ [LEGACY_KEY]: 'AIza-old', '@pantry/items': '[]' });
  const store = createApiKeyStore(secure, plain);
  assert.equal(await store.load(), 'AIza-old');
  assert.equal(secure.data[SECURE_KEY], 'AIza-old');
  assert.equal(LEGACY_KEY in plain.data, false);
  assert.equal(plain.data['@pantry/items'], '[]'); // other data untouched
  assert.equal(await store.load(), 'AIza-old');
});

test('saving writes only to the keystore and clears any plain copy', async () => {
  const secure = memKV();
  const plain = memKV({ [LEGACY_KEY]: 'stale' });
  const store = createApiKeyStore(secure, plain);
  await store.save('  AIza-new ');
  assert.equal(secure.data[SECURE_KEY], 'AIza-new');
  assert.equal(LEGACY_KEY in plain.data, false);
});

test('saving an empty key removes it', async () => {
  const secure = memKV({ [SECURE_KEY]: 'AIza' });
  const store = createApiKeyStore(secure, memKV());
  await store.save('');
  assert.equal(await store.load(), '');
});

test('without a keystore (web) the key stays in plain storage', async () => {
  const plain = memKV();
  const store = createApiKeyStore(null, plain);
  await store.save('AIza-web');
  assert.equal(plain.data[LEGACY_KEY], 'AIza-web');
  assert.equal(await store.load(), 'AIza-web');
});
