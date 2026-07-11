import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, fonts, ZONES, ZoneKey, statusOf, money } from '../theme';
import { GroceryItem, Recipe } from '../types';
import { RECIPES } from '../data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function boughtTime(bought: string): number {
  const [mon, day] = bought.split(' ');
  const m = MONTHS.indexOf(mon);
  if (m < 0 || !day) return 0;
  return new Date(2000, m, parseInt(day, 10)).getTime();
}
function weekSpendOf(items: GroceryItem[]): number {
  if (items.length === 0) return 0;
  const latest = Math.max(...items.map((i) => boughtTime(i.bought)));
  return items
    .filter((i) => {
      const diff = latest - boughtTime(i.bought);
      return diff >= 0 && diff <= 7 * 86400000;
    })
    .reduce((sum, i) => sum + i.price, 0);
}

export default function HomeScreen({
  items,
  profileName,
  onUpdateProfileName,
  onGoInventory,
  onGoExpiry,
  onGoRecipes,
  onOpenRecipe,
  onComingSoon,
  onGoAdd,
}: {
  items: GroceryItem[];
  profileName: string;
  onUpdateProfileName: (name: string) => void;
  onGoInventory: () => void;
  onGoExpiry: () => void;
  onGoRecipes: () => void;
  onOpenRecipe: (r: Recipe) => void;
  onComingSoon: () => void;
  onGoAdd: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(profileName);

  const expiring = items.filter((i) => i.days <= 3).sort((a, b) => a.days - b.days);
  const expired = expiring.filter((i) => i.days < 0).length;
  const zoneCounts: Record<string, number> = {};
  items.forEach((i) => {
    zoneCounts[i.zone] = (zoneCounts[i.zone] || 0) + 1;
  });
  const top = RECIPES[0];
  const isEmpty = items.length === 0;
  const weekSpend = weekSpendOf(items);
  const initial = profileName.trim() ? profileName.trim()[0].toUpperCase() : '👤';

  const openRename = () => { setDraftName(profileName); setRenaming(true); };
  const saveRename = () => { onUpdateProfileName(draftName.trim()); setRenaming(false); };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>{profileName.trim() ? `Good morning, ${profileName.trim()} 👋` : 'Good morning 👋'}</Text>
          <Text style={styles.heading}>What's in your kitchen</Text>
        </View>
        <TouchableOpacity onPress={openRename} style={styles.avatarBtn} activeOpacity={0.85}>
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={renaming} transparent animationType="fade" onRequestClose={() => setRenaming(false)}>
        <Pressable style={styles.renameBackdrop} onPress={() => setRenaming(false)} />
        <View style={styles.renameCard}>
          <Text style={styles.renameTitle}>Your name</Text>
          <Text style={styles.renameSub}>Shown in the greeting on Home</Text>
          <TextInput
            value={draftName}
            onChangeText={setDraftName}
            placeholder="e.g. Maya"
            placeholderTextColor="#9AA290"
            style={styles.renameInput}
            autoFocus
          />
          <TouchableOpacity onPress={saveRename} style={styles.renameSaveBtn} activeOpacity={0.85}>
            <Text style={styles.renameSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <LinearGradient colors={['#3C7A50', '#2C5E3F']} style={styles.hero}>
        <View style={styles.heroBubble} />
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Items at home</Text>
            <Text style={styles.heroBig}>{items.length}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.heroLabel}>Spent this week</Text>
            <Text style={styles.heroSpend}>{money(weekSpend)}</Text>
          </View>
        </View>
        <View style={styles.zoneRow}>
          {(Object.entries(ZONES) as [ZoneKey, typeof ZONES[ZoneKey]][]).map(([k, z]) => (
            <TouchableOpacity key={k} onPress={onGoInventory} style={styles.zonePill} activeOpacity={0.8}>
              <Text style={{ fontSize: 17 }}>{z.icon}</Text>
              <Text style={styles.zoneCount}>{zoneCounts[k] || 0}</Text>
              <Text style={styles.zoneLabel}>{z.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your pantry is empty</Text>
          <Text style={styles.emptySub}>Start adding items to track what's in your kitchen, monitor expiry dates, and get recipe ideas.</Text>
          <TouchableOpacity onPress={onGoAdd} style={styles.emptyBtn} activeOpacity={0.85}>
            <Text style={styles.emptyBtnText}>+ Add your first item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={onGoExpiry} style={styles.expiryBanner} activeOpacity={0.85}>
            <View style={styles.expiryIcon}>
              <Text style={{ fontSize: 20 }}>⏰</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.expiryTitle}>{expiring.length} items expiring soon</Text>
              <Text style={styles.expirySub}>{expired} expired · tap to review & save food</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Use these first</Text>
            <TouchableOpacity onPress={onGoInventory}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.expiringRow}>
            {expiring.slice(0, 6).map((it) => {
              const st = statusOf(it.days);
              return (
                <View key={it.id} style={styles.expiringCard}>
                  <View style={[styles.expiringIcon, { backgroundColor: ZONES[it.zone]?.bg || '#F0ECE0' }]}>
                    <Text style={{ fontSize: 24 }}>{it.emoji}</Text>
                  </View>
                  <Text style={styles.expiringName} numberOfLines={1}>{it.name}</Text>
                  <Text style={styles.expiringSpot}>{it.spot}</Text>
                  <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                    <Text style={[styles.statusLabel, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Cook before it spoils</Text>
            <TouchableOpacity onPress={onGoRecipes}>
              <Text style={styles.sectionLink}>More</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => onOpenRecipe(top)} style={styles.recipeCard} activeOpacity={0.85}>
            <View style={styles.recipeIcon}>
              <Text style={{ fontSize: 38 }}>{top.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recipeName}>{top.name}</Text>
              <Text style={styles.recipeMeta}>⏱ {top.time} · 🔥 {top.calories} cal</Text>
              <View style={styles.usesTag}>
                <Text style={styles.usesText}>Uses {top.expiringUse}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 6, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 14 },
  greeting: { fontSize: 13, color: C.muted, fontFamily: fonts.body600 },
  heading: { fontFamily: fonts.display700, fontSize: 24, letterSpacing: -0.6, color: C.text, marginTop: 3 },
  avatarBtn: { width: 46, height: 46, borderRadius: 15, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display700, fontSize: 18, color: '#F4EFE3' },
  renameBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  renameCard: {
    position: 'absolute', left: 24, right: 24, top: '38%',
    backgroundColor: '#fff', borderRadius: 22, padding: 20,
  },
  renameTitle: { fontFamily: fonts.display700, fontSize: 18, color: C.text },
  renameSub: { fontSize: 12.5, fontFamily: fonts.body500, color: C.muted, marginTop: 3, marginBottom: 14 },
  renameInput: { backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, height: 46, fontSize: 15, fontFamily: fonts.body400, color: C.text },
  renameSaveBtn: { marginTop: 14, backgroundColor: C.green, borderRadius: 14, height: 48, alignItems: 'center', justifyContent: 'center' },
  renameSaveText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 15 },
  hero: { borderRadius: 26, padding: 22, paddingBottom: 18, overflow: 'hidden' },
  heroBubble: { position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.07)' },
  heroTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroLabel: { fontSize: 13, color: 'rgba(244,239,227,0.8)', fontFamily: fonts.body600 },
  heroBig: { fontFamily: fonts.display800, fontSize: 46, lineHeight: 48, letterSpacing: -1.5, color: '#F4EFE3', marginTop: 2 },
  heroSpend: { fontFamily: fonts.display700, fontSize: 22, letterSpacing: -0.5, color: '#F4EFE3', marginTop: 3 },
  zoneRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  zonePill: { flex: 1, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', gap: 3 },
  zoneCount: { fontFamily: fonts.display700, fontSize: 16, color: '#fff' },
  zoneLabel: { fontSize: 10, color: 'rgba(244,239,227,0.8)', fontFamily: fonts.body600 },
  expiryBanner: { marginTop: 14, backgroundColor: C.amberBg, borderWidth: 1.5, borderColor: '#F0DDA8', borderRadius: 18, padding: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  expiryIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center' },
  expiryTitle: { fontFamily: fonts.display700, fontSize: 15, color: '#7A5A12' },
  expirySub: { fontSize: 12.5, color: '#A07E2E', fontFamily: fonts.body500, marginTop: 2 },
  chevron: { color: '#B58A2E', fontSize: 20 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.display700, fontSize: 18, color: C.text },
  sectionLink: { color: C.greenLt, fontFamily: fonts.body700, fontSize: 13 },
  expiringRow: { gap: 12, paddingRight: 8 },
  expiringCard: { width: 130, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 13 },
  expiringIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  expiringName: { fontFamily: fonts.body700, fontSize: 13.5, color: C.text },
  expiringSpot: { fontSize: 11, color: C.muted, fontFamily: fonts.body500, marginVertical: 4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 7, borderRadius: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusLabel: { fontFamily: fonts.body700, fontSize: 10.5 },
  recipeCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 14, flexDirection: 'row', gap: 14, alignItems: 'center' },
  recipeIcon: { width: 72, height: 72, borderRadius: 18, backgroundColor: '#FCE9D9', alignItems: 'center', justifyContent: 'center' },
  recipeName: { fontFamily: fonts.display700, fontSize: 15, color: C.text },
  recipeMeta: { fontSize: 12, color: C.muted, fontFamily: fonts.body500, marginVertical: 6 },
  usesTag: { backgroundColor: '#E8F2E5', borderRadius: 9, paddingVertical: 4, paddingHorizontal: 9, alignSelf: 'flex-start' },
  usesText: { color: '#2C6B43', fontFamily: fonts.body700, fontSize: 11 },
  emptyState: { marginTop: 32, alignItems: 'center', paddingHorizontal: 16 },
  emptyEmoji: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { fontFamily: fonts.display700, fontSize: 22, color: C.text, textAlign: 'center' },
  emptySub: { fontSize: 14, color: C.muted, fontFamily: fonts.body500, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  emptyBtn: { marginTop: 24, backgroundColor: C.green, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 },
  emptyBtnText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 15 },
});
