import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
  const [screen, setScreen] = useState<Screen>('home');
  const [onbIdx, setOnbIdx] = useState(0);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [activeItem, setActiveItem] = useState<GroceryItem | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(RECIPES[0]);
  const [cart, setCart] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<Screen[]>([]);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [profileName, setProfileName] = useState('');
  const [shopping, setShopping] = useState<ShoppingItem[]>(SHOPPING);
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [storedItems, storedCart, onboarded, storedKey, storedName, storedShopping] = await Promise.all([
        loadItems(), loadCart(), hasOnboarded(), loadApiKey(), loadProfileName(), loadShopping(),
      ]);
      setItems(storedItems);
      setCart(storedCart);
      setApiKey(storedKey);
      setProfileName(storedName);
      setShopping(storedShopping ?? SHOPPING);
      setScreen(onboarded ? 'home' : 'onboarding');
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) saveItems(items); }, [items, ready]);
  useEffect(() => { if (ready) saveCart(cart); }, [cart, ready]);
  useEffect(() => { if (ready) saveShopping(shopping); }, [shopping, ready]);

  const push = useCallback((s: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(s);
  }, [screen]);

  const go = useCallback((s: Screen) => {
    setHistory([]);
    setScreen(s);
  }, []);

  const back = useCallback(() => {
    setHistory((h) => {
      const copy = [...h];
      const prev = copy.pop() || 'home';
      setScreen(prev as Screen);
      return copy;
    });
  }, []);

  const openItem = (it: GroceryItem) => { setActiveItem(it); push('item'); };
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
    addToShopping([{ id: 'sh-' + it.id + '-' + Date.now(), name: it.name, emoji: it.emoji, note: 'Added from pantry', lastPrice: it.price, lastStore: it.store, qty: 1, unit: it.unit }]);
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
    setActiveItem((cur) => (cur && cur.id === item.id ? updated : cur));
    const threshold = item.threshold ?? 1;
    if (newQty < threshold) {
      addToShopping([{
        id: 'sh-' + item.id + '-' + Date.now(),
        name: item.name, emoji: item.emoji, note: 'Running low', lastPrice: item.price, lastStore: item.store, qty: 1, unit: item.unit,
      }]);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setActiveItem((cur) => (cur && cur.id === id ? null : cur));
    if (screen === 'item') back();
  };

  const updateItemUnit = (id: string, unit: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unit } : i)));
    setActiveItem((cur) => (cur && cur.id === id ? { ...cur, unit } : cur));
  };

  const updateItemThreshold = (id: string, threshold: number) => {
    const t = Math.max(0, Math.round(threshold));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, threshold: t } : i)));
    setActiveItem((cur) => (cur && cur.id === id ? { ...cur, threshold: t } : cur));
  };

  const changeShoppingQty = (id: string, delta: number) => {
    setShopping((prev) => prev.map((s) => (s.id === id ? { ...s, qty: Math.max(1, Math.round(((s.qty ?? 1) + delta) * 100) / 100) } : s)));
  };

  const updateShoppingUnit = (id: string, unit: string) => {
    setShopping((prev) => prev.map((s) => (s.id === id ? { ...s, unit } : s)));
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
