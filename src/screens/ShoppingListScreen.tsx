import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, TextInput, Alert } from 'react-native';
import { C, fonts, money, UNITS } from '../theme';
import { ShoppingItem } from '../types';
import { Purchase } from '../restock';
import QtyStepper from '../components/QtyStepper';
import UnitPicker from '../components/UnitPicker';

export default function ShoppingListScreen({
  shopping,
  cart,
  onToggle,
  onManualAdd,
  onChangeQty,
  onChangeUnit,
  onRemove,
  onCheckout,
}: {
  shopping: ShoppingItem[];
  cart: Record<string, boolean>;
  onToggle: (id: string) => void;
  onManualAdd: (name: string, qty: number, unit: string) => void;
  onChangeQty: (id: string, delta: number) => void;
  onChangeUnit: (id: string, unit: string) => void;
  onRemove: (id: string) => void;
  onCheckout: (purchases: Purchase[], store: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftQty, setDraftQty] = useState(1);
  const [draftUnit, setDraftUnit] = useState('no');
  const [unitEditId, setUnitEditId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paid, setPaid] = useState<Record<string, string>>({});
  const [store, setStore] = useState('');

  const total = shopping.reduce((a, b) => a + b.lastPrice * (b.qty ?? 1), 0);
  const checked = shopping.filter((s) => cart[s.id]).length;

  const storeFreq: Record<string, number> = {};
  shopping.forEach((s) => {
    if (s.lastStore) storeFreq[s.lastStore] = (storeFreq[s.lastStore] || 0) + 1;
  });
  const bestStore = Object.keys(storeFreq).sort((a, b) => storeFreq[b] - storeFreq[a])[0] || '—';

  const openAdd = () => { setDraft(''); setDraftQty(1); setDraftUnit('no'); setAdding(true); };
  const submit = () => {
    if (!draft.trim()) return;
    onManualAdd(draft.trim(), draftQty, draftUnit);
    setAdding(false);
  };

  const confirmRemove = (it: ShoppingItem) => {
    Alert.alert('Remove item', `Remove "${it.name}" from your shopping list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onRemove(it.id) },
    ]);
  };

  const inCart = shopping.filter((s) => cart[s.id]);
  const openCheckout = () => {
    const pre: Record<string, string> = {};
    inCart.forEach((s) => { pre[s.id] = s.lastPrice > 0 ? String(s.lastPrice) : ''; });
    setPaid(pre);
    setStore(bestStore === '—' ? '' : bestStore);
    setCheckingOut(true);
  };
  const confirmCheckout = () => {
    onCheckout(inCart.map((s) => ({ item: s, price: Math.max(0, Number(paid[s.id]) || 0) })), store);
    setCheckingOut(false);
  };
  const paidTotal = inCart.reduce((sum, s) => sum + (Number(paid[s.id]) || 0), 0);

  const editing = shopping.find((s) => s.id === unitEditId);
  const isEmpty = shopping.length === 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Shopping list</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn} activeOpacity={0.8}>
          <Text style={styles.addPlus}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Items you've run low on, plus anything you add. Last price shown to help you buy smart.</Text>

      {/* Add-to-list modal */}
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
          <View style={styles.addRow}>
            <Text style={styles.addRowLabel}>Quantity</Text>
            <QtyStepper qty={draftQty} unit={draftUnit} onDec={() => setDraftQty((q) => Math.max(1, q - 1))} onInc={() => setDraftQty((q) => q + 1)} size="sm" />
          </View>
          <Text style={[styles.addRowLabel, { marginTop: 12, marginBottom: 8 }]}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitChipRow}>
            {UNITS.map((u) => (
              <TouchableOpacity key={u} onPress={() => setDraftUnit(u)} style={[styles.unitChip, draftUnit === u && styles.unitChipActive]} activeOpacity={0.8}>
                <Text style={[styles.unitChipText, draftUnit === u && styles.unitChipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={submit} style={styles.addConfirm} activeOpacity={0.85}>
            <Text style={styles.addConfirmText}>Add item</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Done shopping: confirm prices + store, then restock the pantry */}
      <Modal visible={checkingOut} transparent animationType="slide" onRequestClose={() => setCheckingOut(false)}>
        <Pressable style={styles.backdrop} onPress={() => setCheckingOut(false)} />
        <View style={styles.checkoutCard}>
          <Text style={styles.addTitle}>Add {inCart.length} to pantry</Text>
          <Text style={styles.checkoutHint}>Check what you paid — it builds each item's price history. Leave blank to skip.</Text>
          <Text style={[styles.addRowLabel, { marginTop: 12, marginBottom: 6 }]}>Store</Text>
          <TextInput
            value={store}
            onChangeText={setStore}
            placeholder="e.g. DMart"
            placeholderTextColor="#9AA290"
            style={styles.addInput}
          />
          <ScrollView style={{ maxHeight: 260, marginTop: 12 }} keyboardShouldPersistTaps="handled">
            {inCart.map((s) => (
              <View key={s.id} style={styles.checkoutRow}>
                <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.itemNote}>{s.qty ?? 1} {s.unit ?? 'no'}</Text>
                </View>
                <Text style={styles.rupee}>₹</Text>
                <TextInput
                  value={paid[s.id] ?? ''}
                  onChangeText={(t) => setPaid((p) => ({ ...p, [s.id]: t.replace(/[^0-9.]/g, '') }))}
                  placeholder="0"
                  placeholderTextColor="#9AA290"
                  keyboardType="decimal-pad"
                  style={styles.priceInput}
                />
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={confirmCheckout} style={styles.addConfirm} activeOpacity={0.85}>
            <Text style={styles.addConfirmText}>Add to pantry{paidTotal > 0 ? ` · ${money(paidTotal)}` : ''}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Per-row unit picker */}
      <UnitPicker
        visible={!!editing}
        value={editing?.unit ?? 'no'}
        onSelect={(u) => { if (unitEditId) onChangeUnit(unitEditId, u); }}
        onClose={() => setUnitEditId(null)}
      />

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your shopping list is empty</Text>
          <Text style={styles.emptySub}>Items that drop below their low-stock level land here automatically. You can also add anything with the + button.</Text>
          <TouchableOpacity onPress={openAdd} style={styles.emptyBtn} activeOpacity={0.85}>
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

          {checked > 0 && (
            <TouchableOpacity onPress={openCheckout} style={styles.doneBtn} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>✓ Done shopping · add {checked} to pantry</Text>
            </TouchableOpacity>
          )}

          <View style={styles.list}>
            {shopping.map((it) => {
              const on = !!cart[it.id];
              return (
                <TouchableOpacity
                  key={it.id}
                  onLongPress={() => confirmRemove(it)}
                  activeOpacity={0.9}
                  style={[styles.row, on && { opacity: 0.5 }]}
                >
                  <View style={styles.rowTop}>
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
                  <View style={styles.rowBottom}>
                    <QtyStepper
                      qty={it.qty ?? 1}
                      unit={it.unit ?? 'no'}
                      onDec={() => onChangeQty(it.id, -1)}
                      onInc={() => onChangeQty(it.id, 1)}
                      onUnitPress={() => setUnitEditId(it.id)}
                      size="sm"
                    />
                    <Text style={styles.holdHint}>Hold to remove</Text>
                  </View>
                </TouchableOpacity>
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
  addCard: { position: 'absolute', left: 24, right: 24, top: '26%', backgroundColor: '#fff', borderRadius: 22, padding: 20 },
  addTitle: { fontFamily: fonts.display700, fontSize: 18, color: C.text, marginBottom: 14 },
  addInput: { backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, fontFamily: fonts.body400, color: C.text },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  addRowLabel: { fontFamily: fonts.body700, fontSize: 13, color: C.muted },
  unitChipRow: { gap: 8, paddingBottom: 2 },
  unitChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 11, backgroundColor: C.cream, borderWidth: 1, borderColor: C.border },
  unitChipActive: { backgroundColor: C.green, borderColor: C.green },
  unitChipText: { fontFamily: fonts.body700, fontSize: 13, color: '#5A6450' },
  unitChipTextActive: { color: '#F4EFE3' },
  addConfirm: { marginTop: 16, backgroundColor: C.green, borderRadius: 14, height: 48, alignItems: 'center', justifyContent: 'center' },
  addConfirmText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 15 },
  summary: { marginHorizontal: 20, marginVertical: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryMeta: { fontSize: 12.5, color: C.muted, fontFamily: fonts.body600 },
  summaryTitle: { fontFamily: fonts.display700, fontSize: 15, color: C.text, marginTop: 2 },
  summaryTotal: { fontFamily: fonts.display800, fontSize: 24, color: C.green, letterSpacing: -0.5 },
  list: { paddingHorizontal: 20, gap: 10 },
  row: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 13, paddingHorizontal: 14, marginBottom: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  checkbox: { width: 28, height: 28, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#fff', fontSize: 14 },
  itemIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#F4F0E6', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontFamily: fonts.body700, fontSize: 15, color: C.text },
  strike: { textDecorationLine: 'line-through' },
  itemNote: { fontSize: 12, color: C.muted, fontFamily: fonts.body500, marginTop: 2 },
  itemPrice: { fontFamily: fonts.display700, fontSize: 14, color: C.text },
  itemStore: { fontSize: 11, color: '#A9B0A0', fontFamily: fonts.body600 },
  doneBtn: { marginHorizontal: 20, marginBottom: 14, backgroundColor: C.green, borderRadius: 14, height: 48, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 15 },
  checkoutCard: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  checkoutHint: { fontSize: 13, color: C.muted, fontFamily: fonts.body500, marginTop: -6, lineHeight: 19 },
  checkoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F4EFE3' },
  rupee: { fontFamily: fonts.body700, fontSize: 15, color: C.muted },
  priceInput: { width: 84, height: 40, backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 10, fontSize: 15, fontFamily: fonts.body600, color: C.text, textAlign: 'right' },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4EFE3' },
  holdHint: { fontSize: 11, color: '#B7BCAE', fontFamily: fonts.body500 },
  emptyState: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontFamily: fonts.display700, fontSize: 20, color: C.text, textAlign: 'center' },
  emptySub: { fontSize: 14, color: C.muted, fontFamily: fonts.body500, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  emptyBtn: { marginTop: 22, backgroundColor: C.green, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 28 },
  emptyBtnText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 15 },
});
