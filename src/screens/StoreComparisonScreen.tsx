import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, fonts, ZONES, STORE_META, STORE_PRICE_FACTOR, money } from '../theme';
import { GroceryItem } from '../types';
import BackButton from '../components/BackButton';

export default function StoreComparisonScreen({ item, onBack }: { item: GroceryItem; onBack: () => void }) {
  const zone = ZONES[item.zone];

  const histByStore: Record<string, number> = {};
  item.hist.forEach((h) => { histByStore[h.store] = h.price; });

  const stores = Object.keys(STORE_META);
  const comp = stores.map((store) => ({
    store,
    price: histByStore[store] != null ? histByStore[store] : Math.round(item.price * (STORE_PRICE_FACTOR[store] ?? 1) * 100) / 100,
  }));
  const cmin = Math.min(...comp.map((c) => c.price));
  const cmax = Math.max(...comp.map((c) => c.price));
  comp.sort((a, b) => a.price - b.price);

  const rows = comp.map((c) => {
    const best = c.price === cmin;
    const meta = STORE_META[c.store];
    return {
      store: c.store,
      price: c.price,
      best,
      meta,
      cardBorder: best ? '#9FCBA6' : C.border,
      priceColor: best ? '#2C6B43' : C.text,
      barColor: best ? '#5BA86F' : '#C9D2BD',
      barW: `${cmax === cmin ? 100 : 40 + ((cmax - c.price) / (cmax - cmin)) * 60}%` as `${number}%`,
    };
  });

  const curStorePrice = histByStore[item.store] != null ? histByStore[item.store] : item.price;
  const saveAmt = curStorePrice - comp[0].price;
  const saveMsg = saveAmt > 0.01
    ? `${comp[0].store} is cheapest at ${money(comp[0].price)} — about ${money(saveAmt)} less per ${item.unit} than where you last bought it.`
    : `You bought this at the best price around — ${money(comp[0].price)} at ${comp[0].store}.`;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <BackButton onPress={onBack} />
        <Text style={styles.heading}>Compare stores</Text>
      </View>

      <View style={styles.itemRow}>
        <View style={[styles.itemIcon, { backgroundColor: zone?.bg || '#F0ECE0' }]}>
          <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
      </View>

      <LinearGradient colors={[C.greenMid, C.green]} style={styles.banner}>
        <Text style={{ fontSize: 26 }}>🏆</Text>
        <Text style={styles.bannerText}>{saveMsg}</Text>
      </LinearGradient>

      <View style={styles.list}>
        {rows.map((r) => (
          <View key={r.store} style={[styles.storeCard, { borderColor: r.cardBorder }]}>
            <View style={styles.storeTopRow}>
              <View style={[styles.logo, { backgroundColor: r.meta.bg }]}>
                <Text style={[styles.logoText, { color: r.meta.color }]}>{r.meta.initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.storeNameRow}>
                  <Text style={styles.storeName}>{r.store}</Text>
                  {r.best && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestBadgeText}>Best price</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.distance}>📍 {r.meta.dist}</Text>
              </View>
              <Text style={[styles.price, { color: r.priceColor }]}>{money(r.price)}</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { width: r.barW, backgroundColor: r.barColor }]} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  heading: { fontFamily: fonts.display700, fontSize: 21, letterSpacing: -0.5, color: C.text },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 6 },
  itemIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontFamily: fonts.display700, fontSize: 18, color: C.text },
  banner: { marginHorizontal: 20, marginBottom: 16, borderRadius: 20, padding: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 13 },
  bannerText: { flex: 1, fontSize: 14, lineHeight: 20, color: '#F4EFE3', fontFamily: fonts.body500 },
  list: { paddingHorizontal: 20, gap: 11 },
  storeCard: { backgroundColor: '#fff', borderWidth: 1.5, borderRadius: 18, padding: 14, paddingHorizontal: 16 },
  storeTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: fonts.display700, fontSize: 16 },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  storeName: { fontFamily: fonts.body700, fontSize: 15, color: C.text },
  bestBadge: { backgroundColor: '#E8F2E5', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  bestBadgeText: { color: '#2C6B43', fontFamily: fonts.body700, fontSize: 10.5 },
  distance: { fontSize: 12, color: C.muted, fontFamily: fonts.body500, marginTop: 2 },
  price: { fontFamily: fonts.display700, fontSize: 19 },
  barTrack: { height: 7, borderRadius: 5, backgroundColor: '#F1EDE0', marginTop: 11, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 5 },
});
