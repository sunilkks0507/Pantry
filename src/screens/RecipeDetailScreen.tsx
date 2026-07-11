import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { C, fonts, TILE_BG } from '../theme';
import { Recipe } from '../types';
import { RECIPES } from '../data';
import BackButton from '../components/BackButton';

export default function RecipeDetailScreen({
  recipe,
  onBack,
  onAddMissingToList,
}: {
  recipe: Recipe;
  onBack: () => void;
  onAddMissingToList: (names: string[]) => void;
}) {
  const stats = [
    { icon: '⏱', val: recipe.time },
    { icon: '🔥', val: recipe.calories + ' cal' },
    { icon: '🍽', val: recipe.servings + ' serv' },
  ];
  const idx = Math.max(0, RECIPES.findIndex((r) => r.id === recipe.id));
  const tileBg = TILE_BG[idx % TILE_BG.length];
  const missing = recipe.ingredients.filter(([, have]) => !have).map(([name]) => name);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <BackButton onPress={onBack} />
      </View>

      <View style={[styles.hero, { backgroundColor: tileBg }]}>
        <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
        <Text style={styles.heroName}>{recipe.name}</Text>
        <Text style={styles.heroUses}>Uses {recipe.expiringUse} expiring soon</Text>
        <View style={styles.statRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={{ fontSize: 16 }}>{s.icon}</Text>
              <Text style={styles.statVal}>{s.val}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Nutrition per serving</Text>
        <View style={styles.nutrientGrid}>
          {Object.entries(recipe.nutrients).map(([label, value]) => (
            <View key={label} style={styles.nutrientTile}>
              <Text style={styles.nutrientValue}>{value}</Text>
              <Text style={styles.nutrientLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.benefitsCard}>
          <Text style={{ fontSize: 18 }}>🌿</Text>
          <Text style={styles.benefitsText}>{recipe.benefits}</Text>
        </View>

        <Text style={[styles.h2, { marginTop: 20 }]}>Ingredients</Text>
        <View style={{ gap: 8 }}>
          {recipe.ingredients.map(([name, have], i) => (
            <View key={i} style={styles.ingRow}>
              <View style={[styles.ingBadge, { backgroundColor: have ? '#E8F2E5' : '#FBF0D8' }]}>
                <Text style={{ color: have ? '#2C6B43' : '#9A6713', fontWeight: '700', fontSize: 13 }}>{have ? '✓' : '+'}</Text>
              </View>
              <Text style={styles.ingName}>{name}</Text>
              <Text style={[styles.ingStatus, { color: have ? '#7FAE86' : '#C99A3E' }]}>{have ? 'Have it' : 'Need'}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.h2, { marginTop: 20 }]}>Steps</Text>
        <View style={{ gap: 12 }}>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {missing.length > 0 && (
          <TouchableOpacity onPress={() => onAddMissingToList(missing)} style={styles.missingBtn} activeOpacity={0.85}>
            <Text style={styles.missingBtnText}>+ Add {missing.length} missing to shopping list</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  topRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 2 },
  hero: { borderRadius: 22, marginHorizontal: 20, marginTop: 4, marginBottom: 16, padding: 20, paddingBottom: 22 },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroName: { fontFamily: fonts.display700, fontSize: 22, color: C.text, marginBottom: 4 },
  heroUses: { fontSize: 13, color: C.muted, fontFamily: fonts.body500 },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  statVal: { fontFamily: fonts.display700, fontSize: 13, color: C.text, marginTop: 3 },
  section: { paddingHorizontal: 20 },
  h2: { fontFamily: fonts.display700, fontSize: 17, color: C.text, marginBottom: 10 },
  nutrientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  nutrientTile: { flexBasis: '23%', flexGrow: 1, backgroundColor: '#EAF4E8', borderRadius: 14, paddingVertical: 11, paddingHorizontal: 4, alignItems: 'center' },
  nutrientValue: { fontFamily: fonts.display700, fontSize: 15, color: '#2C6B43' },
  nutrientLabel: { fontSize: 10.5, color: '#6B8470', fontFamily: fonts.body600, marginTop: 2 },
  benefitsCard: { backgroundColor: '#EAF4E8', borderWidth: 1, borderColor: '#D5E8CF', borderRadius: 16, padding: 13, paddingHorizontal: 15, marginTop: 12, flexDirection: 'row', gap: 11 },
  benefitsText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#4A6B4E', fontFamily: fonts.body400 },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10, paddingHorizontal: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 14 },
  ingBadge: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  ingName: { flex: 1, fontSize: 14.5, fontFamily: fonts.body600, color: C.text },
  ingStatus: { fontSize: 12, fontFamily: fonts.body700 },
  stepRow: { flexDirection: 'row', gap: 13 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.display700, color: '#F4EFE3', fontSize: 13 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20, color: '#3A4A38', fontFamily: fonts.body400, paddingTop: 3 },
  missingBtn: { height: 54, marginTop: 22, borderRadius: 16, borderWidth: 1.5, borderColor: C.green, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  missingBtnText: { color: C.green, fontFamily: fonts.display700, fontSize: 15 },
});
