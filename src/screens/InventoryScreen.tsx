import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, Alert } from 'react-native';
import { C, fonts, ZONES, ZoneKey, statusOf, money } from '../theme';
import { GroceryItem } from '../types';
import QtyStepper from '../components/QtyStepper';

type Tab = { key: string; label: string; icon: string; count: number; color?: string; bg?: string };

export default function InventoryScreen({
  items,
  onOpenItem,
  onGoAdd,
  onChangeQty,
  onRemove,
  onComingSoon,
}: {
  items: GroceryItem[];
  onOpenItem: (it: GroceryItem) => void;
  onGoAdd: () => void;
  onChangeQty: (it: GroceryItem, delta: number) => void;
  onRemove: (id: string) => void;
  onComingSoon: () => void;
}) {
  const [zone, setZone] = useState<string>('all');
  const [q, setQ] = useState('');

  const tabs: Tab[] = [
    { key: 'all', label: 'All', icon: '🍂', count: items.length },
    ...(Object.entries(ZONES) as [ZoneKey, typeof ZONES[ZoneKey]][]).map(([k, z]) => ({
      key: k,
      label: z.label,
      icon: z.icon,
      count: items.filter((i) => i.zone === k).length,
      color: z.color,
      bg: z.bg,
    })),
  ];

  const list = items.filter(
    (i) => (zone === 'all' || i.zone === zone) && i.name.toLowerCase().includes(q.toLowerCase())
  );

  const confirmRemove = (it: GroceryItem) => {
    Alert.alert('Remove item', `Remove "${it.name}" from your pantry?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onRemove(it.id) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topPad}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Inventory</Text>
          <TouchableOpacity onPress={onGoAdd} style={styles.addBtn} activeOpacity={0.8}>
            <Text style={styles.addPlus}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 15, color: '#9AA290' }}>🔍</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search milk, spinach..."
            placeholderTextColor="#9AA290"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {tabs.map((t) => {
          const active = zone === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setZone(t.key)}
              style={[
                styles.tab,
                {
                  borderColor: active ? t.color || C.text : C.border,
                  backgroundColor: active ? t.bg || '#EFE7D6' : '#fff',
                },
              ]}
              activeOpacity={0.8}
            >
              <Text>{t.icon}</Text>
              <Text style={[styles.tabLabel, { color: active ? t.color || C.text : '#5A6450' }]}>{t.label}</Text>
              <Text style={[styles.tabCount, { color: active ? t.color || C.text : '#5A6450' }]}>{t.count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySub}>Tap + to add your first pantry item.</Text>
          <TouchableOpacity onPress={onGoAdd} style={styles.emptyBtn} activeOpacity={0.85}>
            <Text style={styles.emptyBtnText}>+ Add item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(it) => it.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: it }) => {
            const st = statusOf(it.days);
            const low = it.qty < (it.threshold ?? 1);
            return (
              <TouchableOpacity onPress={() => onOpenItem(it)} onLongPress={() => confirmRemove(it)} style={styles.row} activeOpacity={0.85}>
                <View style={styles.rowTop}>
                  <View style={[styles.rowIcon, { backgroundColor: ZONES[it.zone]?.bg || '#F0ECE0' }]}>
                    <Text style={{ fontSize: 26 }}>{it.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{it.name}</Text>
                    <Text style={styles.rowMeta}>
                      {it.cat} · {it.spot}
                      {low ? '  · ' : ''}
                      {low ? <Text style={styles.lowText}>low stock</Text> : null}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 5 }}>
                    <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                      <Text style={[styles.statusLabel, { color: st.color }]}>{st.label}</Text>
                    </View>
                    <Text style={styles.price}>{money(it.price)}</Text>
                  </View>
                </View>
                <View style={styles.rowBottom}>
                  <QtyStepper qty={it.qty} unit={it.unit} onDec={() => onChangeQty(it, -1)} onInc={() => onChangeQty(it, 1)} size="sm" />
                  <Text style={styles.holdHint}>Hold to remove</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topPad: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  heading: { fontFamily: fonts.display700, fontSize: 26, letterSpacing: -0.7, color: C.text },
  addBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  addPlus: { color: '#F4EFE3', fontSize: 24, marginTop: -2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, height: 46, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14.5, fontFamily: fonts.body400, color: C.text },
  tabsRow: { gap: 8, paddingHorizontal: 20, paddingBottom: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 13, paddingVertical: 9, paddingHorizontal: 14 },
  tabLabel: { fontFamily: fonts.body700, fontSize: 13 },
  tabCount: { fontFamily: fonts.body700, fontSize: 13, opacity: 0.6 },
  list: { padding: 20, paddingBottom: 130, gap: 10 },
  row: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 13, paddingHorizontal: 14, marginBottom: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  rowIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontFamily: fonts.body700, fontSize: 15, color: C.text },
  rowMeta: { fontSize: 12, color: C.muted, fontFamily: fonts.body500, marginTop: 2 },
  lowText: { color: '#9A6713', fontFamily: fonts.body700 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4EFE3' },
  holdHint: { fontSize: 11, color: '#B7BCAE', fontFamily: fonts.body500 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusLabel: { fontFamily: fonts.body700, fontSize: 11 },
  price: { fontSize: 12, color: '#A9B0A0', fontFamily: fonts.body600 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, marginTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontFamily: fonts.display700, fontSize: 20, color: C.text, textAlign: 'center' },
  emptySub: { fontSize: 14, color: C.muted, fontFamily: fonts.body500, textAlign: 'center', marginTop: 6 },
  emptyBtn: { marginTop: 22, backgroundColor: C.green, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 28 },
  emptyBtnText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 15 },
});
