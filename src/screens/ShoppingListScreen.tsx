import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, TextInput } from 'react-native';
import { C, fonts, money } from '../theme';
import { ShoppingItem } from '../types';

export default function ShoppingListScreen({
  shopping,
  cart,
  onToggle,
  onManualAdd,
}: {
  shopping: ShoppingItem[];
  cart: Record<string, boolean>;
  onToggle: (id: string) => void;
  onManualAdd: (name: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const total = shopping.reduce((a, b) => a + b.lastPrice, 0);
  const checked = shopping.filter((s) => cart[s.id]).length;

  const storeFreq: Record<string, number> = {};
  shopping.forEach((s) => {
    if (s.lastStore) storeFreq[s.lastStore] = (storeFreq[s.lastStore] || 0) + 1;
  });
  const bestStore = Object.keys(storeFreq).sort((a, b) => storeFreq[b] - storeFreq[a])[0] || '—';

  const submit = () => {
    if (!draft.trim()) return;
    onManualAdd(draft.trim());
    setDraft('');
    setAdding(false);
  };

  const isEmpty = shopping.length === 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Shopping list</Text>
        <TouchableOpacity onPress={() => { setDraft(''); setAdding(true); }} style={styles.addBtn} activeOpacity={0.8}>
          <Text style={styles.addPlus}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Items you've run out of, plus anything you add. Last price shown to help you buy smart.</Text>

      <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAdding(false)} />
        <View style={styles.addCard}>
          <Text style={styles.addTitle}>Add to shopping list</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="e.g. Olive oil"
            placeholderTextColor="#9AA290"
            style={styles.addInput}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <TouchableOpacity onPress={submit} style={styles.addConfirm} activeOpacity={0.85}>
            <Text style={styles.addConfirmText}>Add item</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your shopping list is empty</Text>
          <Text style={styles.emptySub}>Items you run out of land here automatically. You can also add anything you need with the + button.</Text>
          <TouchableOpacity onPress={() => { setDraft(''); setAdding(true); }} style={styles.emptyBtn} activeOpacity={0.85}>
            <Text style={styles.emptyBtnText}>+ Add an item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.summary}>
            <View>
              <Text style={styles.summaryMeta}>{shopping.length} items · {checked} in cart</Text>
              <Text style={styles.summaryTitle}>Cheapest run: {bestStore}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryMeta}>Est. total</Text>
              <Text style={styles.summaryTotal}>{money(total)}</Text>
            </View>
          </View>

          <View style={styles.list}>
            {shopping.map((it) => {
              const on = !!cart[it.id];
              return (
                <View key={it.id} style={[styles.row, on && { opacity: 0.5 }]}>
                  <TouchableOpacity
                    onPress={() => onToggle(it.id)}
                    style={[styles.checkbox, { borderColor: on ? C.green : C.border, backgroundColor: on ? C.green : '#fff' }]}
                    activeOpacity={0.8}
                  >
                    {on && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <View style={styles.itemIcon}>
                    <Text style={{ fontSize: 23 }}>{it.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, on && styles.strike]}>{it.name}</Text>
                    <Text style={styles.itemNote}>{it.note}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemPrice}>{it.lastPrice > 0 ? money(it.lastPrice) : ''}</Text>
                    <Text style={styles.itemStore}>{it.lastStore}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 130 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  heading: { fontFamily: fonts.display700, fontSize: 26, letterSpacing: -0.7, color: C.text },
  subtitle: { fontSize: 13.5, color: C.muted, fontFamily: fonts.body500, marginHorizontal: 20, marginTop: 6, lineHeight: 20 },
  addBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  addPlus: { color: '#F4EFE3', fontSize: 24, marginTop: -2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  addCard: { position: 'absolute', left: 24, right: 24, top: '34%', backgroundColor: '#fff', borderRadius: 22, padding: 20 },
  addTitle: { fontFamily: fonts.display700, fontSize: 18, color: C.text, marginBottom: 14 },
  addInput: { backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, fontFamily: fonts.body400, color: C.text },
  addConfirm: { marginTop: 14, backgroundColor: C.green, borderRadius: 14, height: 48, alignItems: 'center', justifyContent: 'center' },
  addConfirmText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 15 },
  summary: { marginHorizontal: 20, marginVertical: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryMeta: { fontSize: 12.5, color: C.muted, fontFamily: fonts.body600 },
  summaryTitle: { fontFamily: fonts.display700, fontSize: 15, color: C.text, marginTop: 2 },
  summaryTotal: { fontFamily: fonts.display800, fontSize: 24, color: C.green, letterSpacing: -0.5 },
  list: { paddingHorizontal: 20, gap: 10 },
  row: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 10 },
  checkbox: { width: 28, height: 28, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#fff', fontSize: 14 },
  itemIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#F4F0E6', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontFamily: fonts.body700, fontSize: 15, color: C.text },
  strike: { textDecorationLine: 'line-through' },
  itemNote: { fontSize: 12, color: C.muted, fontFamily: fonts.body500, marginTop: 2 },
  itemPrice: { fontFamily: fonts.display700, fontSize: 14, color: C.text },
  itemStore: { fontSize: 11, color: '#A9B0A0', fontFamily: fonts.body600 },
  emptyState: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontFamily: fonts.display700, fontSize: 20, color: C.text, textAlign: 'center' },
  emptySub: { fontSize: 14, color: C.muted, fontFamily: fonts.body500, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  emptyBtn: { marginTop: 22, backgroundColor: C.green, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 28 },
  emptyBtnText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 15 },
});
