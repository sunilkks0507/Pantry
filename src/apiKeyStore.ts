// Where the Gemini API key lives. On phones it goes in the OS keystore
// (Android Keystore / iOS Keychain) via expo-secure-store; it used to be in
// plain AsyncStorage, so the first load moves it over and deletes the old copy.
// Written against small interfaces so the migration can be unit-tested.

export interface KV {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const SECURE_KEY = 'pantry.apiKey'; // secure-store keys: [A-Za-z0-9._-] only
export const LEGACY_KEY = '@pantry/apiKey';

// `secure` is null where no keystore exists (web); the key then stays in `plain`.
export function createApiKeyStore(secure: KV | null, plain: KV) {
  return {
    async load(): Promise<string> {
      if (!secure) return (await plain.getItem(LEGACY_KEY)) || '';
      const stored = await secure.getItem(SECURE_KEY);
      if (stored) return stored;
      const legacy = await plain.getItem(LEGACY_KEY);
      if (legacy) {
        await secure.setItem(SECURE_KEY, legacy);
        await plain.removeItem(LEGACY_KEY);
        return legacy;
      }
      return '';
    },
    async save(key: string): Promise<void> {
      const k = key.trim();
      if (!secure) {
        if (k) await plain.setItem(LEGACY_KEY, k);
        else await plain.removeItem(LEGACY_KEY);
        return;
      }
      if (k) await secure.setItem(SECURE_KEY, k);
      else await secure.removeItem(SECURE_KEY);
      await plain.removeItem(LEGACY_KEY);
    },
  };
}
