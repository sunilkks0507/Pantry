import AsyncStorage from '@react-native-async-storage/async-storage';
import { GroceryItem, ShoppingItem } from './types';

const ITEMS_KEY = '@pantry/items';
const CART_KEY = '@pantry/cart';
const ONBOARDED_KEY = '@pantry/onboarded';
const API_KEY_KEY = '@pantry/apiKey';
const PROFILE_KEY = '@pantry/profileName';
const SHOPPING_KEY = '@pantry/shopping';

export async function loadItems(): Promise<GroceryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(ITEMS_KEY);
    if (raw) return JSON.parse(raw);
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

export async function loadApiKey(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(API_KEY_KEY)) || '';
  } catch {
    return '';
  }
}

export async function saveApiKey(key: string) {
  try {
    await AsyncStorage.setItem(API_KEY_KEY, key);
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
