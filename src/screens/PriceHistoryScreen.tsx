import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { C, fonts, ZONES, money } from '../theme';
import { GroceryItem } from '../types';
import BackButton from '../components/BackButton';

export default function PriceHistoryScreen({
  item,
  onBack,
  onGoStore,
}: {
  item: GroceryItem;
  onBack: () => void;
  onGoStore: () => void;
}) {
  const zone = ZONES[item.zone];
  const hist = item.hist.length > 0 ? item.hist : [{ date: item.bought, store: item.store, price: item.price }];
  const prices = hist.map((h) => h.price);
  const pmin = Math.min(...prices);
  const pmax = Math.max(...prices);
  const pavg = prices.reduce((a, b) => a + b, 0) / prices.length;

  const bars = hist.map((h) => ({
    date: h.date,
    price: h.price,
    barH: `${40 + (pmax === pmin ? 40 : ((h.price - pmin) / (pmax - pmin)) * 55)}%` as `${number}%`,
    barColor: h.price === pmin ? '#5BA86F' : h.price === pmax ? '#E0876B' : '#9BBE8C',
    labelColor: h.price === pmin ? '#2C6B43' : '#26331F',
  }));

  const log = [...hist].reverse().map((h) => ({
    ...h,
    color: h.price === pmin ? '#2C6B43' : h.price === pmax ? '#C0432B' : '#26331F',
  }));

  const lastP = prices[prices.length - 1];
  const trendUp = lastP > prices[0];
  const trendText = lastP <= pmin
    ? 'You paid the lowest price on record here — great timing!'
    : trendUp
      ? `Prices are trending up. This was ${money(lastP - pmin)} above the cheapest you’ve paid.`
      : 'Prices have eased recently — a good moment to stock up.';
  const trendIcon = lastP <= pmin ? '🎉' : trendUp ? '📈' : '📉';

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <BackButton onPress={onBack} />
        <Text style={styles.heading}>Price history</Text>
      </View>

      <View style={styles.itemRow}>
        <View style={[styles.itemIcon, { backgroundColor: zone?.bg || '#F0ECE0' }]}>
          <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
        </View>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSub}>Last paid {money(item.price)} at {item.store}</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>Lowest</Text>
            <Text style={[styles.statValue, { color: '#2C6B43' }]}>{money(pmin)}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={[styles.statValue, { color: C.text }]}>{money(pavg)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statLabel}>Highest</Text>
            <Text style={[styles.statValue, { color: C.red }]}>{money(pmax)}</Text>
          </View>
        </View>
        <View style={styles.barsRow}>
          {bars.map((b, i) => (
            <View key={i} style={styles.barCol}>
              <Text style={[styles.barPrice, { color: b.labelColor }]}>{money(b.price)}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: b.barH, backgroundColor: b.barColor }]} />
              </View>
              <Text style={styles.barDate}>{b.date}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.trendCard}>
        <Text style={{ fontSize: 20 }}>{trendIcon}</Text>
        <Text style={styles.trendText}>{trendText}</Text>
      </View>

      <Text style={styles.sectionTitle}>Purchase log</Text>
      <View style={styles.list}>
        {log.map((p, i) => (
          <View key={i} style={styles.logRow}>
            <View style={styles.logIcon}>
              <Text style={{ fontSize: 16 }}>🛒</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.logStore}>{p.store}</Text>
              <Text style={styles.logDate}>{p.date}</Text>
            </View>
            <Text style={[styles.logPrice, { color: p.color }]}>{money(p.price)}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={onGoStore} style={styles.compareBtn} activeOpacity={0.85}>
        <Text style={styles.compareBtnText}>Compare across stores</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  heading: { fontFamily: fonts.display700, fontSize: 21, letterSpacing: -0.5, color: C.text },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 6 },
  itemIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontFamily: fonts.display700, fontSize: 17, color: C.text },
  itemSub: { fontSize: 12.5, color: C.muted, fontFamily: fonts.body600 },
  chartCard: { marginHorizontal: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 18, paddingBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statLabel: { fontSize: 11.5, color: C.muted, fontFamily: fonts.body600 },
  statValue: { fontFamily: fonts.display700, fontSize: 18, marginTop: 2 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, height: 140, paddingTop: 10 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  barPrice: { fontFamily: fonts.display700, fontSize: 12, marginBottom: 6 },
  barTrack: { width: '100%', maxWidth: 46, flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 10, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  barDate: { fontSize: 10.5, color: '#9AA290', fontFamily: fonts.body600, marginTop: 7 },
  trendCard: { marginHorizontal: 20, marginTop: 14, backgroundColor: '#EAF4E8', borderWidth: 1, borderColor: '#D5E8CF', borderRadius: 16, padding: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 11 },
  trendText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#3A5A3E', fontFamily: fonts.body500 },
  sectionTitle: { fontFamily: fonts.display700, fontSize: 16, color: C.text, marginHorizontal: 20, marginTop: 22, marginBottom: 11 },
  list: { paddingHorizontal: 20, gap: 9 },
  logRow: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 15, padding: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#F1EDE0', alignItems: 'center', justifyContent: 'center' },
  logStore: { fontFamily: fonts.body700, fontSize: 14, color: C.text },
  logDate: { fontSize: 12, color: C.muted, fontFamily: fonts.body500 },
  logPrice: { fontFamily: fonts.display700, fontSize: 16 },
  compareBtn: { marginHorizontal: 20, marginTop: 18, height: 52, borderRadius: 16, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  compareBtnText: { color: '#F4EFE3', fontFamily: fonts.display700, fontSize: 15 },
});
