import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { C, fonts, TILE_BG } from '../theme';
import { GroceryItem, Recipe } from '../types';
import { RECIPES } from '../data';

type FilterKey = 'expiring' | 'quick' | 'protein' | null;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'expiring', label: 'Uses expiring' },
  { key: 'quick', label: 'Quick · under 20m' },
  { key: 'protein', label: 'High protein' },
];

function leadingNumber(s: string): number {
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

export default function RecipesScreen({
  items,
  onOpenRecipe,
}: {
  items: GroceryItem[];
  onOpenRecipe: (r: Recipe) => void;
}) {
  const [filter, setFilter] = useState<FilterKey>(null);

  const expiringIds = new Set(items.filter((i) => i.days <= 3).map((i) => i.id));

  const list = RECIPES.filter((r) => {
    if (filter === 'expiring') return r.uses.some((id) => expiringIds.has(id));
    if (filter === 'quick') return leadingNumber(r.time) < 20;
    if (filter === 'protein') return leadingNumber(r.nutrients.Protein || '0') >= 20;
    return true;
  });

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Cook with what you have</Text>
      <Text style={styles.subtitle}>Recipes that use your soon-to-expire items first.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.label}
              onPress={() => setFilter(active ? null : f.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {list.map((r, i) => {
        const have = r.ingredients.filter(([, has]) => has).length;
        return (
          <TouchableOpacity
            key={r.id}
            onPress={() => onOpenRecipe(r)}
            style={styles.card}
            activeOpacity={0.85}
          >
            <View style={[styles.cardIconWrap, { backgroundColor: TILE_BG[i % TILE_BG.length] }]}>
              <Text style={styles.cardIcon}>{r.emoji}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.cardName}>{r.name}</Text>
              <Text style={styles.cardMeta}>⏱ {r.time} · 🔥 {r.calories} cal · {r.servings} servings</Text>
              <View style={styles.tagRow}>
                <View style={styles.expiringTag}>
                  <Text style={styles.expiringTagText}>⏰ {r.expiringUse}</Text>
                </View>
                <View style={styles.haveTag}>
                  <Text style={styles.haveTagText}>You have {have}/{r.ingredients.length}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 10, paddingBottom: 120 },
  heading: { fontFamily: fonts.display700, fontSize: 26, letterSpacing: -0.7, color: C.text },
  subtitle: { fontSize: 13.5, color: C.muted, fontFamily: fonts.body500, marginTop: 6, lineHeight: 20 },
  filterRow: { gap: 8, paddingVertical: 14 },
  filterChip: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border },
  filterChipActive: { backgroundColor: C.green, borderColor: C.green },
  filterChipText: { fontFamily: fonts.body700, fontSize: 13, color: '#5A6450' },
  filterChipTextActive: { color: '#F4EFE3' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 14, marginBottom: 14, flexDirection: 'row', gap: 14, alignItems: 'center' },
  cardIconWrap: { width: 80, height: 80, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardIcon: { fontSize: 42 },
  cardName: { fontFamily: fonts.display700, fontSize: 16.5, color: C.text, letterSpacing: -0.3 },
  cardMeta: { fontSize: 12.5, color: C.muted, fontFamily: fonts.body600, marginVertical: 5 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  expiringTag: { backgroundColor: '#FBF0D8', borderRadius: 9, paddingVertical: 4, paddingHorizontal: 9 },
  expiringTagText: { color: '#9A6713', fontFamily: fonts.body700, fontSize: 11 },
  haveTag: { backgroundColor: '#E8F2E5', borderRadius: 9, paddingVertical: 4, paddingHorizontal: 9 },
  haveTagText: { color: '#2C6B43', fontFamily: fonts.body700, fontSize: 11 },
});
