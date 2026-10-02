import React, { useState, useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, AppState, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { C, NAV_SCREENS } from './src/theme';
import { GroceryItem, Recipe, Screen, ShoppingItem } from './src/types';
import { RECIPES, SHOPPING } from './src/data';
import { loadItems, saveItems, loadCart, saveCart, hasOnboarded, setOnboarded, loadApiKey, saveApiKey, loadProfileName, saveProfileName, loadShopping, saveShopping } from './src/storage';
import { suggestRecipesFromPantry } from './src/services/claude';
import { todayISO } from './src/dates';
import { withLiveDates } from './src/items';
import { backTarget, navReducer } from './src/navigation';
import { Purchase, restock } from './src/restock';

import BottomNav from './src/components/BottomNav';
import ComingSoonModal from './src/components/ComingSoonModal';
import AddMethodSheet from './src/components/AddMethodSheet';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import ExpiryScreen from './src/screens/ExpiryScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import ScanScreen from './src/screens/ScanScreen';
import VoiceScreen from './src/screens/VoiceScreen';
import StorageTipsScreen from './src/screens/StorageTipsScreen';
import PriceHistoryScreen from './src/screens/PriceHistoryScreen';
import StoreComparisonScreen from './src/screens/StoreComparisonScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [ready, setReady] = useState(false);
  const [nav, dispatchNav] = useReducer(navReducer, { screen: 'home', history: [] });
  const { screen } = nav;
  const [onbIdx, setOnbIdx] = useState(0);
  const [storedItems, setItems] = useState<GroceryItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [today, setToday] = useState(todayISO);
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(RECIPES[0]);
  const [cart, setCart] = useState<Record<string, boolean>>({});
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [profileName, setProfileName] = useState('');
  const [shopping, setShopping] = useState<ShoppingItem[]>(SHOPPING);
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [loadedItems, storedCart, onboarded, storedKey, storedName, storedShopping] = await Promise.all([
        loadItems(), loadCart(), hasOnboarded(), loadApiKey(), loadProfileName(), loadShopping(),
      ]);
      setItems(loadedItems);
      setCart(storedCart);
      setApiKey(storedKey);
      setProfileName(storedName);
      setShopping(storedShopping ?? SHOPPING);
      dispatchNav({ type: 'go', screen: onboarded ? 'home' : 'onboarding' });
      setReady(true);
    })();
  }, []);

  // Keep `today` current so "days left" ticks over at midnight and when the
  // app returns from the background on a later day.
  useEffect(() => {
    const refresh = () => setToday((cur) => { const t = todayISO(); return t === cur ? cur : t; });
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') refresh(); });
    const timer = setInterval(refresh, 60000);
    return () => { sub.remove(); clearInterval(timer); };
  }, []);

  const items = useMemo(() => storedItems.map((i) => withLiveDates(i, today)), [storedItems, today]);
  const activeItem = useMemo(() => items.find((i) => i.id === activeItemId) ?? null, [items, activeItemId]);

  useEffect(() => { if (ready) saveItems(storedItems); }, [storedItems, ready]);
  useEffect(() => { if (ready) saveCart(cart); }, [cart, ready]);
  useEffect(() => { if (ready) saveShopping(shopping); }, [shopping, ready]);

  const push = useCallback((s: Screen) => dispatchNav({ type: 'push', screen: s }), []);
  const go = useCallback((s: Screen) => dispatchNav({ type: 'go', screen: s }), []);
  const back = useCallback(() => dispatchNav({ type: 'back' }), []);

  // Android hardware/gesture Back: step back through the app's own history,
  // then fall back to Home from other tabs; only leave the app from Home.
  // (Open modals handle Back themselves via onRequestClose.)
  const navRef = useRef(nav);
  navRef.current = nav;
  const onbIdxRef = useRef(onbIdx);
  onbIdxRef.current = onbIdx;
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navRef.current.screen === 'onboarding' && onbIdxRef.current > 0) {
        setOnbIdx((i) => Math.max(0, i - 1));
        return true;
      }
      if (!backTarget(navRef.current)) return false;
      dispatchNav({ type: 'back' });
      return true;
    });
    return () => sub.remove();
  }, []);

  const openItem = (it: GroceryItem) => { setActiveItemId(it.id); push('item'); };
  const openRecipe = (r: Recipe) => { setActiveRecipe(r); push('recipeDetail'); };

  const generateRecipes = useCallback(async () => {
    if (!apiKey || items.length === 0) return;
    setRecipesLoading(true);
    setRecipesError(null);
    try {
      const rs = await suggestRecipesFromPantry(items, apiKey);
      if (rs.length === 0) setRecipesError('No recipes came back. Try again.');
      setAiRecipes(rs);
    } catch (e: any) {
      setRecipesError(e?.message || 'Could not generate recipes. Check your API key and try again.');
    } finally {
      setRecipesLoading(false);
    }
  }, [apiKey, items]);
  const toggleCart = (id: string) => setCart((c) => ({ ...c, [id]: !c[id] }));
  const finishOnboarding = () => { setOnboarded(); go('home'); };

  const addItems = (newItems: GroceryItem[]) => {
    setItems((prev) => [...prev, ...newItems]);
    go('inventory');
  };

  const addItem = (item: GroceryItem) => addItems([item]);

  const openAddSheet = () => setAddSheetVisible(true);
  const closeAddSheet = () => setAddSheetVisible(false);

  const handleUpdateApiKey = async (key: string) => {
    setApiKey(key);
    await saveApiKey(key);
  };

  const handleUpdateProfileName = async (name: string) => {
    setProfileName(name);
    await saveProfileName(name);
  };

  const addToShopping = (newOnes: ShoppingItem[]) => {
    setShopping((prev) => {
      const existing = new Set(prev.map((s) => s.name.toLowerCase()));
      return [...prev, ...newOnes.filter((s) => !existing.has(s.name.toLowerCase()))];
    });
  };

  const addItemToShopping = (it: GroceryItem) => {
    addToShopping([{ id: 'sh-' + it.id + '-' + Date.now(), name: it.name, emoji: it.emoji, note: 'Added from pantry', lastPrice: it.price, lastStore: it.store, qty: 1, unit: it.unit, itemId: it.id }]);
    push('list');
  };

  const addMissingToShopping = (names: string[]) => {
    addToShopping(names.map((n, i) => ({
      id: 'sh-' + n.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() + '-' + i,
      name: n, emoji: '🛒', note: 'Need for recipe', lastPrice: 0, lastStore: '', qty: 1, unit: 'no',
    })));
    push('list');
  };

  const addShoppingItem = (name: string, qty: number, unit: string) => {
    const n = name.trim();
    if (!n) return;
    addToShopping([{ id: 'sh-manual-' + Date.now(), name: n, emoji: '🛒', note: 'Added manually', lastPrice: 0, lastStore: '', qty: Math.max(1, qty), unit }]);
  };

  // Adjust a pantry item's quantity. The item stays in the pantry; when its
  // quantity drops below its low-stock threshold it is added to the shopping list.
  const changeItemQty = (item: GroceryItem, delta: number) => {
    const newQty = Math.max(0, Math.round((item.qty + delta) * 100) / 100);
    const updated = { ...item, qty: newQty };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    const threshold = item.threshold ?? 1;
    if (newQty < threshold) {
      addToShopping([{
        id: 'sh-' + item.id + '-' + Date.now(),
        name: item.name, emoji: item.emoji, note: 'Running low', lastPrice: item.price, lastStore: item.store, qty: 1, unit: item.unit, itemId: item.id,
      }]);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setActiveItemId((cur) => (cur === id ? null : cur));
    if (screen === 'item') back();
  };

  const updateItemUnit = (id: string, unit: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unit } : i)));
  };

  const updateItemThreshold = (id: string, threshold: number) => {
    const t = Math.max(0, Math.round(threshold));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, threshold: t } : i)));
  };

  const changeShoppingQty = (id: string, delta: number) => {
    setShopping((prev) => prev.map((s) => (s.id === id ? { ...s, qty: Math.max(1, Math.round(((s.qty ?? 1) + delta) * 100) / 100) } : s)));
  };

  const updateShoppingUnit = (id: string, unit: string) => {
    setShopping((prev) => prev.map((s) => (s.id === id ? { ...s, unit } : s)));
  };

  // "Done shopping": move the bought items into the pantry and off the list.
  const checkout = (purchases: Purchase[], store: string) => {
    if (purchases.length === 0) return;
    const bought = new Set(purchases.map((p) => p.item.id));
    setItems((prev) => restock(prev, purchases, store, todayISO()));
    setShopping((prev) => prev.filter((s) => !bought.has(s.id)));
    setCart((c) => { const n = { ...c }; bought.forEach((id) => delete n[id]); return n; });
    go('inventory');
  };

  const removeShoppingItem = (id: string) => {
    setShopping((prev) => prev.filter((s) => s.id !== id));
    setCart((c) => { const n = { ...c }; delete n[id]; return n; });
  };

  if (!fontsLoaded || !ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={C.green} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={screen === 'onboarding' ? [] : ['top']}>
        <StatusBar style={screen === 'onboarding' ? 'light' : 'dark'} />
        <View style={styles.content}>
          {screen === 'onboarding' && (
            <OnboardingScreen
              idx={onbIdx}
              onNext={() => (onbIdx < 2 ? setOnbIdx((i) => i + 1) : finishOnboarding())}
              onSkip={finishOnboarding}
            />
          )}
          {screen === 'home' && (
            <HomeScreen
              items={items}
              profileName={profileName}
              onUpdateProfileName={handleUpdateProfileName}
              onGoInventory={() => go('inventory')}
              onGoExpiry={() => push('expiry')}
              onGoRecipes={() => go('recipes')}
              onOpenRecipe={openRecipe}
              onComingSoon={() => {}}
              onGoAdd={openAddSheet}
            />
          )}
          {screen === 'inventory' && (
            <InventoryScreen
              items={items}
              onOpenItem={openItem}
              onGoAdd={openAddSheet}
              onChangeQty={changeItemQty}
              onRemove={removeItem}
              onComingSoon={() => {}}
            />
          )}
          {screen === 'item' && activeItem && (
            <ItemDetailScreen
              item={activeItem}
              onBack={back}
              onGoTips={() => push('tips')}
              onGoPrice={() => push('price')}
              onAddToShoppingList={() => addItemToShopping(activeItem)}
              onFindRecipes={() => push('recipes')}
              onChangeQty={(delta) => changeItemQty(activeItem, delta)}
              onChangeUnit={(u) => updateItemUnit(activeItem.id, u)}
              onChangeThreshold={(t) => updateItemThreshold(activeItem.id, t)}
              onRemove={() => removeItem(activeItem.id)}
            />
          )}
          {screen === 'expiry' && (
            <ExpiryScreen
              items={items.filter((i) => i.days <= 3)}
              onBack={back}
              onOpenItem={openItem}
              onOpenRecipe={openRecipe}
              onGoRecipes={() => go('recipes')}
            />
          )}
          {screen === 'recipes' && (
            <RecipesScreen
              items={items}
              recipes={aiRecipes}
              loading={recipesLoading}
              error={recipesError}
              onGenerate={generateRecipes}
              onOpenRecipe={openRecipe}
              apiKey={apiKey}
              onApiKeyChange={handleUpdateApiKey}
            />
          )}
          {screen === 'recipeDetail' && (
            <RecipeDetailScreen recipe={activeRecipe} onBack={back} onAddMissingToList={addMissingToShopping} />
          )}
          {screen === 'list' && (
            <ShoppingListScreen
              shopping={shopping}
              cart={cart}
              onToggle={toggleCart}
              onManualAdd={addShoppingItem}
              onChangeQty={changeShoppingQty}
              onChangeUnit={updateShoppingUnit}
              onRemove={removeShoppingItem}
              onCheckout={checkout}
            />
          )}
          {screen === 'add' && <AddItemScreen onBack={back} onSave={addItem} onGoScan={() => push('scan')} />}
          {screen === 'scan' && (
            <ScanScreen
              onBack={back}
              onSave={addItems}
              apiKey={apiKey}
              onApiKeyChange={handleUpdateApiKey}
            />
          )}
          {screen === 'voice' && (
            <VoiceScreen
              onBack={back}
              onSave={addItems}
              apiKey={apiKey}
              onApiKeyChange={handleUpdateApiKey}
            />
          )}
          {screen === 'tips' && activeItem && <StorageTipsScreen item={activeItem} onBack={back} />}
          {screen === 'price' && activeItem && (
            <PriceHistoryScreen item={activeItem} onBack={back} onGoStore={() => push('store')} />
          )}
          {screen === 'store' && activeItem && <StoreComparisonScreen item={activeItem} onBack={back} />}
        </View>

        {NAV_SCREENS.includes(screen) && (
          <BottomNav screen={screen} onGo={go} onScan={() => push('scan')} />
        )}

        <AddMethodSheet
          visible={addSheetVisible}
          onClose={closeAddSheet}
          onManual={() => { closeAddSheet(); push('add'); }}
          onScan={() => { closeAddSheet(); push('scan'); }}
          onVoice={() => { closeAddSheet(); push('voice'); }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.cream },
  root: { flex: 1, backgroundColor: C.cream },
  content: { flex: 1 },
});
