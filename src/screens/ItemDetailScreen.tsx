import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { C, fonts, ZONES, statusOf, expiresText, money } from '../theme';
import { GroceryItem } from '../types';
import BackButton from '../components/BackButton';

export default function ItemDetailScreen({
  item,
  onBack,
  onGoTips,
  onGoPrice,
  onAddToShoppingList,
  onFindRecipes,
  onChangeQty,
}: {
  item: GroceryItem;
  onBack: () => void;
  onGoTips: () => void;
  onGoPrice: () => void;
  onAddToShoppingList: () => void;
  onFindRecipes: () => void;
  onChangeQty: (delta: number) => void;
}) {
  const st = statusOf(item.days);
  const zone = ZONES[item.zone];
  const lowest = item.hist.length > 0 ? money(Math.min(...item.hist.map((h) => h.price))) : money(item.price);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <BackButton onPress={onBack} />
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.8}>
          <Text style={{ fontSize: 18, color: '#5A6450' }}>⋯</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: zone?.bg || '#F0ECE0' }]}>
          <Text style={{ fontSize: 50 }}>{item.emoji}</Text>
        </View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.cat} · {item.qty} {item.unit}</Text>
        <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
          <Text style={[styles.statusLabel, { color: st.color }]}>Expires {expiresText(item.days)}</Text>
        </View>
      </View>

      <View style={[styles.storedCard, { backgroundColor: zone?.bg || '#F0ECE0' }]}>
        <View style={styles.storedIcon}>
          <Text style={{ fontSize: 24 }}>{zone?.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.storedLabel}>Stored in</Text>
          <Text style={styles.storedValue}>{zone?.label} · {item.spot}</Text>
        </View>
      </View>

      <View style={styles.qtyCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <Text style={styles.qtyHint}>Reaches 0 → moves to shopping list</Text>
        </View>
        <View style={styles.stepper}>
          <TouchableOpacity onPress={() => onChangeQty(-1)} style={styles.stepBtn} activeOpacity={0.7}>
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.qty} {item.unit}</Text>
          <TouchableOpacity onPress={() => onChangeQty(1)} style={styles.stepBtn} activeOpacity={0.7}>
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tileGrid}>
        <View style={styles.tile}>
          <Text style={styles.tileLabel}>Purchased</Text>
          <Text style={styles.tileValue}>{item.bought}</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileLabel}>Paid</Text>
          <Text style={styles.tileValue}>{money(item.price)}</Text>
        </View>
        <View style={styles.tileWide}>
          <View style={styles.tileWideIcon}>
            <Text style={{ fontSize: 18 }}>🛒</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tileLabel}>Bought at</Text>
            <Text style={styles.tileWideValue}>{item.store}{item.loc ? ' · ' + item.loc : ''}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={onGoTips} style={styles.tip} activeOpacity={0.85}>
        <Text style={{ fontSize: 22 }}>💡</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Storage tip</Text>
          <Text style={styles.tipText}>{item.tip}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onGoPrice} style={styles.priceCard} activeOpacity={0.85}>
        <View style={styles.priceIcon}>
          <Text style={{ fontSize: 20 }}>📈</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.priceTitle}>Price history & stores</Text>
          <Text style={styles.priceSub}>Lowest seen {lowest} · compare 4 stores</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onAddToShoppingList} style={styles.outlineBtn} activeOpacity={0.85}>
          <Text style={styles.outlineBtnText}>+ Shopping list</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFindRecipes} style={styles.fillBtn} activeOpacity={0.85}>
          <Text style={styles.fillBtnText}>Find recipes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 8 },
  moreBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  heroIcon: { width: 96, height: 96, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  name: { fontFamily: fonts.display700, fontSize: 26, letterSpacing: -0.6, color: C.text, textAlign: 'center' },
  subtitle: { fontSize: 13.5, color: C.muted, fontFamily: fonts.body600, marginTop: 3 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontFamily: fonts.body700, fontSize: 13 },
  storedCard: { marginHorizontal: 20, marginBottom: 12, borderRadius: 20, padding: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  storedIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },
  storedLabel: { fontSize: 12, color: '#6B7466', fontFamily: fonts.body600 },
  storedValue: { fontFamily: fonts.display700, fontSize: 17, color: C.text, marginTop: 1 },
  qtyCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyLabel: { fontFamily: fonts.display700, fontSize: 15, color: C.text },
  qtyHint: { fontSize: 11.5, color: C.muted, fontFamily: fonts.body500, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 22, color: C.green, fontFamily: fonts.body700, marginTop: -3 },
  qtyValue: { fontFamily: fonts.display700, fontSize: 15, color: C.text, minWidth: 58, textAlign: 'center' },
  tileGrid: { marginHorizontal: 20, marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  tile: { flexBasis: '47%', flexGrow: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14 },
  tileLabel: { fontSize: 12, color: C.muted, fontFamily: fonts.body600, marginBottom: 5 },
  tileValue: { fontFamily: fonts.display700, fontSize: 16, color: C.text },
  tileWide: { flexBasis: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tileWideIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F1EDE0', alignItems: 'center', justifyContent: 'center' },
  tileWideValue: { fontFamily: fonts.body700, fontSize: 15, color: C.text },
  tip: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#EAF4E8', borderWidth: 1, borderColor: '#D5E8CF', borderRadius: 18, padding: 15, paddingHorizontal: 16, flexDirection: 'row', gap: 13 },
  tipTitle: { fontFamily: fonts.display700, fontSize: 14.5, color: '#2C6B43', marginBottom: 3 },
  tipText: { fontSize: 13, lineHeight: 19, color: '#4A6B4E', fontFamily: fonts.body400 },
  priceCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 15, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  priceIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FCE9D9', alignItems: 'center', justifyContent: 'center' },
  priceTitle: { fontFamily: fonts.body700, fontSize: 14.5, color: C.text },
  priceSub: { fontSize: 12.5, color: C.muted, fontFamily: fonts.body500, marginTop: 2 },
  chevron: { color: '#C2C8B8', fontSize: 20 },
  actionRow: { flexDirection: 'row', gap: 11, paddingHorizontal: 20, paddingTop: 4 },
  outlineBtn: { flex: 1, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: C.green, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  outlineBtnText: { color: C.green, fontFamily: fonts.display700, fontSize: 14.5 },
  fillBtn: { flex: 1, height: 52, borderRadius: 16, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  fillBtnText: { color: '#F4EFE3', fontFamily: fonts.display700, fontSize: 14.5 },
});
