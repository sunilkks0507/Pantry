import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createApiKeyStore, KV } from './apiKeyStore';
import { GroceryItem, ShoppingItem } from './types';
import { migrateItem } from './items';

const ITEMS_KEY = '@pantry/items';
const CART_KEY = '@pantry/cart';
const ONBOARDED_KEY = '@pantry/onboarded';
const PROFILE_KEY = '@pantry/profileName';
const SHOPPING_KEY = '@pantry/shopping';

export async function loadItems(): Promise<GroceryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(ITEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((it) => migrateItem(it));
    }
  } catch {}
  return [];
}

export async function saveItems(items: GroceryItem[]) {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {}
}

export async function loadCart(): Promise<Record<string, boolean>> {
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export async function saveCart(cart: Record<string, boolean>) {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

export async function hasOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setOnboarded() {
  try {
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
  } catch {}
}

const secureKV: KV | null = Platform.OS === 'web' ? null : {
  getItem: (k) => SecureStore.getItemAsync(k),
  setItem: (k, v) => SecureStore.setItemAsync(k, v),
  removeItem: (k) => SecureStore.deleteItemAsync(k),
};
const apiKeyStore = createApiKeyStore(secureKV, AsyncStorage);

export async function loadApiKey(): Promise<string> {
  try {
    return await apiKeyStore.load();
  } catch {
    return '';
  }
}

export async function saveApiKey(key: string) {
  try {
    await apiKeyStore.save(key);
  } catch {}
}

export async function loadProfileName(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(PROFILE_KEY)) || '';
  } catch {
    return '';
  }
}

export async function saveProfileName(name: string) {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, name);
  } catch {}
}

export async function loadShopping(): Promise<ShoppingItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(SHOPPING_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export async function saveShopping(shopping: ShoppingItem[]) {
  try {
    await AsyncStorage.setItem(SHOPPING_KEY, JSON.stringify(shopping));
  } catch {}
}
