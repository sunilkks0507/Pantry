import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { C, fonts, ZONES, statusOf, expiresText } from '../theme';
import { GroceryItem, Recipe } from '../types';
import { RECIPES } from '../data';
import BackButton from '../components/BackButton';

export default function ExpiryScreen({
  items,
  onBack,
  onOpenItem,
  onOpenRecipe,
  onGoRecipes,
}: {
  items: GroceryItem[];
  onBack: () => void;
  onOpenItem: (it: GroceryItem) => void;
  onOpenRecipe: (r: Recipe) => void;
  onGoRecipes: () => void;
}) {
  const expired = items.filter((i) => i.days < 0);
  const soon = items.filter((i) => i.days >= 0 && i.days <= 3).sort((a, b) => a.days - b.days);

  const cookIt = (it: GroceryItem) => {
    const match = RECIPES.find((r) => r.uses.includes(it.id));
    if (match) onOpenRecipe(match);
    else onGoRecipes();
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <BackButton onPress={onBack} />
        <Text style={styles.heading}>Expiry alerts</Text>
      </View>

      <Text style={styles.intro}>Use or freeze these soon to cut waste. {expired.length + soon.length} items need attention.</Text>

      {expired.length > 0 && (
        <>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionDot, { backgroundColor: '#D9573F' }]} />
            <Text style={styles.sectionExpired}>Expired · {expired.length}</Text>
          </View>
          <View style={styles.list}>
            {expired.map((it) => (
              <View key={it.id} style={styles.expiredRow}>
                <View style={[styles.rowIcon, { backgroundColor: ZONES[it.zone]?.bg || '#F0ECE0' }]}>
                  <Text style={{ fontSize: 24 }}>{it.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{it.name}</Text>
                  <Text style={styles.expiredMeta}>Expired {expiresText(it.days)} · {ZONES[it.zone]?.label} · {it.spot}</Text>
                </View>
                <TouchableOpacity onPress={() => onOpenItem(it)} style={styles.viewBtn} activeOpacity={0.8}>
                  <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.sectionHead}>
        <View style={[styles.sectionDot, { backgroundColor: '#E8A93C' }]} />
        <Text style={styles.sectionSoon}>Expiring soon · {soon.length}</Text>
      </View>
      <View style={styles.list}>
        {soon.map((it) => {
          const st = statusOf(it.days);
          return (
            <View key={it.id} style={styles.soonCard}>
              <View style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: ZONES[it.zone]?.bg || '#F0ECE0' }]}>
                  <Text style={{ fontSize: 24 }}>{it.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{it.name}</Text>
                  <Text style={styles.soonMeta}>Expires {expiresText(it.days)} · {ZONES[it.zone]?.label} · {it.spot}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                  <Text style={[styles.statusLabel, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => cookIt(it)} style={styles.cookBtn} activeOpacity={0.8}>
                  <Text style={styles.cookBtnText}>🍳 Cook it</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onOpenItem(it)} style={styles.detailsBtn} activeOpacity={0.8}>
                  <Text style={styles.detailsBtnText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  heading: { fontFamily: fonts.display700, fontSize: 22, letterSpacing: -0.5, color: C.text },
  intro: { fontSize: 13.5, color: C.muted, fontFamily: fonts.body500, lineHeight: 20, marginHorizontal: 20, marginTop: 6, marginBottom: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 10 },
  sectionDot: { width: 9, height: 9, borderRadius: 5 },
  sectionExpired: { fontFamily: fonts.display700, fontSize: 14, color: C.red },
  sectionSoon: { fontFamily: fonts.display700, fontSize: 14, color: '#9A6713' },
  list: { paddingHorizontal: 20, gap: 10, marginBottom: 12 },
  expiredRow: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F3D9D1', borderRadius: 18, padding: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  expiredMeta: { fontSize: 12.5, color: C.red, fontFamily: fonts.body600, marginTop: 1 },
  viewBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 11, borderWidth: 1, borderColor: C.border, backgroundColor: '#fff' },
  viewBtnText: { color: '#5A6450', fontFamily: fonts.body700, fontSize: 12.5 },
  soonCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 12, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontFamily: fonts.body700, fontSize: 15, color: C.text },
  soonMeta: { fontSize: 12.5, color: '#9A6713', fontFamily: fonts.body600, marginTop: 1 },
  statusPill: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 },
  statusLabel: { fontFamily: fonts.display700, fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 11 },
  cookBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, backgroundColor: '#EAF4E8', alignItems: 'center' },
  cookBtnText: { color: '#2C6B43', fontFamily: fonts.body700, fontSize: 12.5 },
  detailsBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: '#fff', alignItems: 'center' },
  detailsBtnText: { color: '#5A6450', fontFamily: fonts.body700, fontSize: 12.5 },
});
