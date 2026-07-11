import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, fonts, ZONES } from '../theme';
import { GroceryItem } from '../types';
import { TIPS_DATA } from '../data';
import BackButton from '../components/BackButton';

export default function StorageTipsScreen({ item, onBack }: { item: GroceryItem; onBack: () => void }) {
  const zone = ZONES[item.zone];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <BackButton onPress={onBack} />
        <Text style={styles.heading}>Storage tips</Text>
      </View>

      <LinearGradient colors={[zone?.bg || '#F0ECE0', '#fff']} style={styles.hero}>
        <Text style={styles.heroEmoji}>{item.emoji}</Text>
        <Text style={styles.heroName}>{item.name}</Text>
        <Text style={styles.heroSub}>Best kept in the {zone?.label}</Text>
      </LinearGradient>

      <View style={styles.tip}>
        <Text style={{ fontSize: 22 }}>💡</Text>
        <Text style={styles.tipText}>{item.tip}</Text>
      </View>

      <Text style={styles.sectionTitle}>General freshness rules</Text>
      <View style={styles.list}>
        {TIPS_DATA.map((t, i) => (
          <View key={i} style={styles.ruleCard}>
            <View style={[styles.ruleIcon, { backgroundColor: t.bg }]}>
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>{t.title}</Text>
              <Text style={styles.ruleBody}>{t.body}</Text>
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
  hero: { marginHorizontal: 20, marginTop: 6, marginBottom: 14, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 20, alignItems: 'center' },
  heroEmoji: { fontSize: 54 },
  heroName: { fontFamily: fonts.display700, fontSize: 20, color: C.text, marginTop: 8, marginBottom: 4 },
  heroSub: { fontSize: 13, color: '#6B7466', fontFamily: fonts.body600 },
  tip: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#EAF4E8', borderWidth: 1, borderColor: '#D5E8CF', borderRadius: 18, padding: 16, flexDirection: 'row', gap: 12 },
  tipText: { flex: 1, fontSize: 14, lineHeight: 22, color: '#3A5A3E', fontFamily: fonts.body400 },
  sectionTitle: { fontFamily: fonts.display700, fontSize: 16, color: C.text, marginHorizontal: 20, marginTop: 4, marginBottom: 11 },
  list: { paddingHorizontal: 20, gap: 10 },
  ruleCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 13, alignItems: 'flex-start' },
  ruleIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ruleTitle: { fontFamily: fonts.body700, fontSize: 14.5, color: C.text, marginBottom: 3 },
  ruleBody: { fontSize: 13, lineHeight: 19, color: '#6B7466', fontFamily: fonts.body400 },
});
