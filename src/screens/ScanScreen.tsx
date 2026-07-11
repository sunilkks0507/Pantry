import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, TextInput, Alert, Image, Animated, Easing,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { C, fonts, ZONES, ZoneKey, money } from '../theme';
import { GroceryItem } from '../types';
import { ParsedItem, parseItemsFromImage } from '../services/claude';
import { saveApiKey } from '../storage';
import BackButton from '../components/BackButton';

interface Props {
  onBack: () => void;
  onSave: (items: GroceryItem[]) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

function parsedToGrocery(p: ParsedItem): GroceryItem {
  return {
    id: p.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() + '-' + Math.random(),
    name: p.name,
    emoji: p.emoji || '🛒',
    cat: p.cat || 'Other',
    qty: p.qty || 1,
    unit: p.unit || 'ct',
    zone: (p.zone as ZoneKey) || 'pantry',
    spot: p.spot || 'Pantry shelf',
    days: p.days ?? 7,
    bought: p.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: p.price || 0,
    store: p.store || '—',
    loc: '',
    tip: p.tip || '',
    hist: [],
  };
}

export default function ScanScreen({ onBack, onSave, apiKey, onApiKeyChange }: Props) {
  const [localKey, setLocalKey] = useState(apiKey);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [mode, setMode] = useState<'receipt' | 'label'>('receipt');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedItem[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [keyVisible, setKeyVisible] = useState(!apiKey);

  const scanline = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!imageUri || parsed.length > 0) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanline, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanline, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [imageUri, parsed.length, scanline]);
  const scanlineY = scanline.interpolate({ inputRange: [0, 1], outputRange: [0, 280] });

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access in your device settings.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: 'images' });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(asset.base64 || null);
      const ext = asset.uri.split('.').pop()?.toLowerCase();
      setImageMime(ext === 'png' ? 'image/png' : 'image/jpeg');
      setParsed([]);
      setSelected({});
    }
  };

  const analyze = async () => {
    const key = localKey.trim();
    if (!key) { Alert.alert('API key required', 'Enter your Google AI (Gemini) key to use AI scanning.'); return; }
    if (!imageBase64) { Alert.alert('No image', 'Please pick or capture an image first.'); return; }
    setLoading(true);
    try {
      await saveApiKey(key);
      onApiKeyChange(key);
      const items = await parseItemsFromImage(imageBase64, imageMime, key, mode);
      if (items.length === 0) {
        Alert.alert('No items found', 'Gemini could not detect any food items. Try a clearer photo or receipt.');
      } else {
        setParsed(items);
        const sel: Record<number, boolean> = {};
        items.forEach((_, i) => { sel[i] = true; });
        setSelected(sel);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const toAdd = parsed.filter((_, i) => selected[i]).map(parsedToGrocery);
    if (toAdd.length === 0) { Alert.alert('Nothing selected', 'Select at least one item to add.'); return; }
    onSave(toAdd);
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const scanStore = parsed.find((p) => p.store)?.store || 'your photo';
  const scanDate = parsed.find((p) => p.date)?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (parsed.length > 0) {
    return (
      <ScrollView contentContainerStyle={styles.reviewScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <BackButton onPress={onBack} />
          <Text style={styles.heading}>Review scan</Text>
        </View>

        <View style={styles.successBanner}>
          <Text style={{ fontSize: 20 }}>✅</Text>
          <Text style={styles.successText}>
            Found <Text style={styles.successBold}>{parsed.length} items</Text> from{' '}
            <Text style={styles.successBold}>{scanStore}</Text> · {scanDate}
          </Text>
        </View>

        {parsed.map((item, i) => {
          const detail = [`${item.qty} ${item.unit}`, item.price ? money(item.price) : null, `${item.days}d`]
            .filter(Boolean)
            .join(' · ');
          return (
            <TouchableOpacity
              key={i}
              style={[styles.itemRow, !selected[i] && styles.itemRowDim]}
              onPress={() => setSelected((s) => ({ ...s, [i]: !s[i] }))}
              activeOpacity={0.8}
            >
              <View style={[styles.itemIcon, { backgroundColor: ZONES[item.zone as ZoneKey]?.bg || '#F0ECE0' }]}>
                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{detail}</Text>
              </View>
              <View style={[styles.checkbox, selected[i] && styles.checkboxOn]}>
                {selected[i] && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>Add {selectedCount} item{selectedCount !== 1 ? 's' : ''} to pantry</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.dark}>
      {!imageUri ? (
        <ScrollView contentContainerStyle={styles.pickScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.topRowDark}>
            <BackButton onPress={onBack} light />
            <Text style={styles.headingLight}>Scan to add</Text>
          </View>

          {keyVisible ? (
            <View style={styles.apiCard}>
              <Text style={styles.apiLabel}>🔑 Gemini API key</Text>
              <TextInput
                value={localKey}
                onChangeText={setLocalKey}
                placeholder="AIza..."
                placeholderTextColor="#9AA290"
                style={styles.apiInput}
                secureTextEntry
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={async () => { await saveApiKey(localKey.trim()); onApiKeyChange(localKey.trim()); setKeyVisible(false); }}
                style={styles.saveKeyBtn}
              >
                <Text style={styles.saveKeyText}>Save key</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setKeyVisible(true)} style={styles.keyChip}>
              <Text style={styles.keyChipText}>🔑 API key saved · tap to change</Text>
            </TouchableOpacity>
          )}

          <View style={styles.pickRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)} activeOpacity={0.85}>
              <Text style={{ fontSize: 26 }}>📷</Text>
              <Text style={styles.pickLabel}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)} activeOpacity={0.85}>
              <Text style={{ fontSize: 26 }}>🖼️</Text>
              <Text style={styles.pickLabel}>Photo library</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <>
          <View style={styles.viewfinder}>
            <View style={styles.viewfinderTopRow}>
              <BackButton onPress={() => { setImageUri(null); setImageBase64(null); }} light />
              <View style={styles.modeRow}>
                <TouchableOpacity onPress={() => setMode('receipt')} style={[styles.modeChip, mode === 'receipt' && styles.modeChipActive]}>
                  <Text style={[styles.modeChipText, mode === 'receipt' && styles.modeChipTextActive]}>Receipt</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode('label')} style={[styles.modeChip, mode === 'label' && styles.modeChipActive]}>
                  <Text style={[styles.modeChipText, mode === 'label' && styles.modeChipTextActive]}>Label</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.frame}>
              <Image source={{ uri: imageUri }} style={styles.frameImage} resizeMode="cover" />
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              {!loading && (
                <Animated.View style={[styles.scanline, { transform: [{ translateY: scanlineY }] }]} />
              )}
            </View>

            <View style={styles.captionBox}>
              <Text style={styles.captionTitle}>
                {loading ? 'Gemini is reading your image…' : 'Hold steady — reading ' + mode}
              </Text>
              <Text style={styles.captionSub}>We'll pull item names, prices, store & date automatically.</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />
              ) : (
                <TouchableOpacity onPress={analyze} style={styles.shutterBtn} activeOpacity={0.85} />
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dark: { flex: 1, backgroundColor: '#191D17' },
  pickScroll: { padding: 20, paddingBottom: 60 },
  topRowDark: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  headingLight: { fontFamily: fonts.display700, fontSize: 21, color: '#fff' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18, paddingHorizontal: 20, paddingTop: 12 },
  heading: { fontFamily: fonts.display700, fontSize: 21, color: C.text },
  reviewScroll: { paddingBottom: 60, backgroundColor: C.cream, flexGrow: 1 },
  apiCard: { backgroundColor: '#22261F', borderWidth: 1, borderColor: '#33392E', borderRadius: 18, padding: 16, marginBottom: 16, gap: 10 },
  apiLabel: { fontFamily: fonts.body700, fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  apiInput: { backgroundColor: '#191D17', borderWidth: 1, borderColor: '#33392E', borderRadius: 12, paddingHorizontal: 14, height: 46, fontSize: 14, fontFamily: fonts.body400, color: '#fff' },
  saveKeyBtn: { backgroundColor: C.green, borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center' },
  saveKeyText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 14 },
  keyChip: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, marginBottom: 16 },
  keyChipText: { fontSize: 12, fontFamily: fonts.body600, color: 'rgba(255,255,255,0.75)' },
  pickRow: { flexDirection: 'row', gap: 12 },
  pickBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 18, paddingVertical: 18, alignItems: 'center', gap: 8 },
  pickLabel: { fontFamily: fonts.body700, fontSize: 13, color: '#fff' },
  viewfinder: { flex: 1 },
  viewfinderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14 },
  modeRow: { flexDirection: 'row', gap: 7 },
  modeChip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.14)' },
  modeChipActive: { backgroundColor: C.orange },
  modeChipText: { color: 'rgba(255,255,255,0.8)', fontFamily: fonts.body700, fontSize: 12.5 },
  modeChipTextActive: { color: '#fff' },
  frame: { marginTop: 20, marginHorizontal: 40, height: 340, borderRadius: 14, overflow: 'hidden', backgroundColor: '#33392E' },
  frameImage: { width: '100%', height: '100%' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#6FD08C' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
  scanline: { position: 'absolute', left: 8, right: 8, height: 2.5, backgroundColor: '#6FD08C', shadowColor: '#6FD08C', shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  captionBox: { padding: 26, paddingHorizontal: 24, alignItems: 'center' },
  captionTitle: { color: '#fff', fontFamily: fonts.display700, fontSize: 18, marginBottom: 6, textAlign: 'center' },
  captionSub: { color: 'rgba(255,255,255,0.55)', fontSize: 13.5, marginBottom: 24, textAlign: 'center' },
  shutterBtn: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#fff', borderWidth: 5, borderColor: 'rgba(255,255,255,0.35)' },
  successBanner: { marginHorizontal: 20, marginTop: 8, marginBottom: 14, backgroundColor: '#EAF4E8', borderWidth: 1, borderColor: '#D5E8CF', borderRadius: 16, padding: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 11 },
  successText: { flex: 1, fontSize: 13.5, color: '#2C6B43', fontFamily: fonts.body600, lineHeight: 19 },
  successBold: { fontFamily: fonts.body700 },
  sectionTitle: { fontFamily: fonts.display700, fontSize: 17, color: C.text, marginBottom: 12, marginHorizontal: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 12, marginHorizontal: 20, marginBottom: 10 },
  itemRowDim: { opacity: 0.45 },
  itemIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontFamily: fonts.body700, fontSize: 14, color: C.text },
  itemMeta: { fontSize: 12, fontFamily: fonts.body500, color: C.muted, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: C.green, borderColor: C.green },
  checkmark: { color: '#fff', fontSize: 13, fontFamily: fonts.body700 },
  addBtn: { backgroundColor: C.green, borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginHorizontal: 20 },
  addBtnText: { color: '#F4EFE3', fontFamily: fonts.display700, fontSize: 16 },
});
