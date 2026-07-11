import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable } from 'react-native';
import { C, fonts, ZONES, ZoneKey, UNITS } from '../theme';
import { GroceryItem } from '../types';
import BackButton from '../components/BackButton';

const EMOJI_BY_ZONE: Record<ZoneKey, string> = {
  fridge: '🥛',
  freezer: '🧊',
  pantry: '🫙',
  kitchen: '🍽️',
};

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Bakery', 'Frozen', 'Dry Goods', 'Beverage', 'Other'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function fmtMonthDay(m: number, d: number) {
  return `${MONTHS[m]} ${d}`;
}

function daysUntil(m: number, d: number): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(now.getFullYear(), m, d);
  if (target < today) target = new Date(now.getFullYear() + 1, m, d);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function MonthDayField({
  label,
  m,
  d,
  onChange,
}: {
  label: string;
  m: number;
  d: number;
  onChange: (m: number, d: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tmpM, setTmpM] = useState(m);
  const [tmpD, setTmpD] = useState(d);

  const openPicker = () => { setTmpM(m); setTmpD(d); setOpen(true); };
  const save = () => { onChange(tmpM, Math.min(tmpD, DAYS_IN_MONTH[tmpM])); setOpen(false); };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={openPicker} style={styles.dateWrap} activeOpacity={0.8}>
        <Text style={styles.dateText}>{fmtMonthDay(m, d)}</Text>
        <Text style={{ fontSize: 14 }}>📅</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setOpen(false)} />
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>{label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {MONTHS.map((mo, i) => (
              <TouchableOpacity
                key={mo}
                onPress={() => setTmpM(i)}
                style={[styles.chip, tmpM === i && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, tmpM === i && styles.chipTextActive]}>{mo}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {Array.from({ length: DAYS_IN_MONTH[tmpM] }, (_, i) => i + 1).map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setTmpD(day)}
                style={[styles.dayChip, tmpD === day && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, tmpD === day && styles.chipTextActive]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={save} style={styles.pickerSaveBtn} activeOpacity={0.85}>
            <Text style={styles.pickerSaveText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

export default function AddItemScreen({
  onBack,
  onSave,
  onGoScan,
}: {
  onBack: () => void;
  onSave: (item: GroceryItem) => void;
  onGoScan: () => void;
}) {
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 86400000);

  const [name, setName] = useState('');
  const [cat, setCat] = useState('Produce');
  const [zone, setZone] = useState<ZoneKey>('fridge');
  const [spot, setSpot] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('no');
  const [threshold, setThreshold] = useState('1');
  const [expiryM, setExpiryM] = useState(inSevenDays.getMonth());
  const [expiryD, setExpiryD] = useState(inSevenDays.getDate());
  const [purchaseM, setPurchaseM] = useState(now.getMonth());
  const [purchaseD, setPurchaseD] = useState(now.getDate());
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const item: GroceryItem = {
      id: name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: name.trim(),
      emoji: EMOJI_BY_ZONE[zone],
      cat,
      qty: Number(qty) || 1,
      unit: unit || 'no',
      zone,
      spot: spot.trim() || ZONES[zone].label,
      days: daysUntil(expiryM, expiryD),
      bought: fmtMonthDay(purchaseM, purchaseD),
      price: Number(price) || 0,
      store: store.trim() || '—',
      loc: '',
      tip: 'Keep it in the ' + ZONES[zone].label.toLowerCase() + ' and check on it before it expires.',
      hist: [],
      threshold: Math.max(0, Math.round(Number(threshold) || 1)),
    };
    onSave(item);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <BackButton onPress={onBack} />
        <Text style={styles.heading}>Add item</Text>
      </View>

      <TouchableOpacity onPress={onGoScan} style={styles.scanShortcut} activeOpacity={0.85}>
        <View style={styles.scanIcon}>
          <Text style={{ fontSize: 20 }}>📷</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.scanTitle}>Scan instead</Text>
          <Text style={styles.scanSub}>Snap a label or receipt to autofill</Text>
        </View>
        <Text style={styles.scanChevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.form}>
        <View>
          <Text style={styles.label}>Item name</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Almond milk"
              placeholderTextColor="#9AA290"
              style={styles.input}
            />
          </View>
        </View>

        <View>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCat(c)}
                style={[styles.catChip, cat === c && styles.catChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.catChipText, cat === c && styles.catChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.rowFields}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.inputWrap}>
              <TextInput value={qty} onChangeText={setQty} keyboardType="numeric" style={styles.input} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Low-stock at</Text>
            <View style={styles.inputWrap}>
              <TextInput value={threshold} onChangeText={setThreshold} keyboardType="numeric" style={styles.input} />
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setUnit(u)}
                style={[styles.catChip, unit === u && styles.catChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.catChipText, unit === u && styles.catChipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.fieldHint}>Below {Number(threshold) || 1} {unit}, we'll add it to your shopping list.</Text>
        </View>

        <View>
          <Text style={[styles.label, { marginBottom: 10 }]}>Storage location</Text>
          <View style={styles.zoneGrid}>
            {(Object.entries(ZONES) as [ZoneKey, typeof ZONES[ZoneKey]][]).map(([k, z]) => (
              <TouchableOpacity
                key={k}
                onPress={() => setZone(k)}
                style={[
                  styles.zoneBtn,
                  { borderColor: zone === k ? z.color : C.border, backgroundColor: zone === k ? z.bg : '#fff' },
                ]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 19 }}>{z.icon}</Text>
                <Text style={[styles.zoneLabel, { color: zone === k ? z.color : '#5A6450' }]}>{z.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.inputWrap, { marginTop: 9 }]}>
            <TextInput
              value={spot}
              onChangeText={setSpot}
              placeholder="e.g. Crisper drawer"
              placeholderTextColor="#9AA290"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.rowFields}>
          <MonthDayField label="Expiry date" m={expiryM} d={expiryD} onChange={(m, d) => { setExpiryM(m); setExpiryD(d); }} />
          <MonthDayField label="Purchase date" m={purchaseM} d={purchaseD} onChange={(m, d) => { setPurchaseM(m); setPurchaseD(d); }} />
        </View>

        <View style={styles.rowFields}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Price paid</Text>
            <View style={styles.inputWrap}>
              <TextInput value={price} onChangeText={setPrice} placeholder="₹0" placeholderTextColor="#9AA290" keyboardType="decimal-pad" style={styles.input} />
            </View>
          </View>
          <View style={{ flex: 1.4 }}>
            <Text style={styles.label}>Store</Text>
            <View style={styles.inputWrap}>
              <TextInput value={store} onChangeText={setStore} placeholder="e.g. Trader Joe's" placeholderTextColor="#9AA290" style={styles.input} />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          style={[styles.saveBtn, !canSave && { opacity: 0.5 }]}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>Save to pantry</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  heading: { fontFamily: fonts.display700, fontSize: 21, color: C.text },
  scanShortcut: {
    marginHorizontal: 20, marginTop: 4, marginBottom: 18,
    backgroundColor: '#FCE2D0', borderWidth: 1, borderColor: '#F3D3BE', borderRadius: 18,
    padding: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 13,
  },
  scanIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  scanTitle: { fontFamily: fonts.display700, fontSize: 15, color: '#A8482C' },
  scanSub: { fontSize: 12.5, color: '#B86A4E', fontFamily: fonts.body500, marginTop: 2 },
  scanChevron: { color: '#D88B6E', fontSize: 20 },
  form: { paddingHorizontal: 20, paddingTop: 0, gap: 14 },
  label: { fontSize: 13, fontFamily: fonts.body700, color: C.muted, marginBottom: 6 },
  fieldHint: { fontSize: 11.5, color: C.muted, fontFamily: fonts.body500, marginTop: 8 },
  inputWrap: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, height: 50, justifyContent: 'center' },
  input: { fontSize: 15, fontFamily: fonts.body400, color: C.text },
  rowFields: { flexDirection: 'row', gap: 10 },
  zoneGrid: { flexDirection: 'row', gap: 8 },
  zoneBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', gap: 4 },
  zoneLabel: { fontFamily: fonts.body700, fontSize: 11 },
  chipRow: { gap: 8, paddingBottom: 2 },
  catChip: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border },
  catChipActive: { backgroundColor: C.green, borderColor: C.green },
  catChipText: { fontFamily: fonts.body700, fontSize: 13, color: '#5A6450' },
  catChipTextActive: { color: '#F4EFE3' },
  dateWrap: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 15, height: 50, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { fontSize: 14, fontFamily: fonts.body600, color: C.text },
  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  pickerCard: { position: 'absolute', left: 20, right: 20, top: '30%', backgroundColor: '#fff', borderRadius: 22, padding: 18, gap: 12 },
  pickerTitle: { fontFamily: fonts.display700, fontSize: 17, color: C.text, marginBottom: 2 },
  chip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 11, backgroundColor: C.cream, marginRight: 6 },
  dayChip: { width: 40, height: 40, borderRadius: 11, backgroundColor: C.cream, marginRight: 6, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: C.green },
  chipText: { fontFamily: fonts.body700, fontSize: 13, color: C.text },
  chipTextActive: { color: '#F4EFE3' },
  pickerSaveBtn: { marginTop: 4, backgroundColor: C.green, borderRadius: 14, height: 48, alignItems: 'center', justifyContent: 'center' },
  pickerSaveText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 15 },
  saveBtn: { width: '100%', height: 54, borderRadius: 18, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveText: { fontFamily: fonts.display700, color: '#F4EFE3', fontSize: 16 },
});
