import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { C, fonts, ZONES, ZoneKey } from '../theme';
import { GroceryItem } from '../types';
import { ParsedItem, parseItemsFromTranscript } from '../services/claude';
import { saveApiKey } from '../storage';
import BackButton from '../components/BackButton';

interface Props {
  onBack: () => void;
  onSave: (items: GroceryItem[]) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

// expo-speech-recognition ships native code Expo Go doesn't bundle — its own
// module scope calls a native lookup that throws immediately on import when
// the native module is missing. A static `import` is hoisted and evaluated
// unconditionally by the bundler, so it must be loaded via a guarded, lazy
// require() instead, only ever attempted once, at first render.
let speech: null | {
  ExpoSpeechRecognitionModule: any;
  useSpeechRecognitionEvent: (event: string, handler: (e: any) => void) => void;
} = null;
let speechLoadAttempted = false;

function loadSpeechModule() {
  if (speechLoadAttempted) return speech;
  speechLoadAttempted = true;
  try {
    speech = require('expo-speech-recognition');
  } catch {
    speech = null;
  }
  return speech;
}

export default function VoiceScreen(props: Props) {
  const [api] = useState(() => loadSpeechModule());
  if (!api) {
    return <VoiceUnavailable onBack={props.onBack} />;
  }
  return <VoiceRecorder {...props} api={api} />;
}

function VoiceUnavailable({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <BackButton onPress={onBack} />
        <Text style={styles.heading}>Voice input</Text>
      </View>
      <View style={styles.unavailableBox}>
        <Text style={styles.unavailableEmoji}>🎙️</Text>
        <Text style={styles.unavailableTitle}>Voice input isn't available here</Text>
        <Text style={styles.unavailableSub}>
          This feature needs a custom development build — it can't run inside the standard Expo Go app.
          Use Scan or Manual entry instead, or build a dev client to enable it.
        </Text>
      </View>
    </ScrollView>
  );
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
    bought: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: 0,
    store: '—',
    loc: '',
    tip: p.tip || '',
    hist: [],
  };
}

function VoiceRecorder({
  onBack, onSave, apiKey, onApiKeyChange, api,
}: Props & { api: { ExpoSpeechRecognitionModule: any; useSpeechRecognitionEvent: (event: string, handler: (e: any) => void) => void } }) {
  const { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } = api;
  const [localKey, setLocalKey] = useState(apiKey);
  const [keyVisible, setKeyVisible] = useState(!apiKey);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedItem[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results?.[0]?.transcript || '';
    setTranscript(text);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
  });

  useSpeechRecognitionEvent('error', (e) => {
    setListening(false);
    Alert.alert('Speech error', e.message || 'Could not recognise speech. Please try again.');
  });

  const startListening = async () => {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Microphone permission is required for voice input.');
      return;
    }
    setTranscript('');
    setParsed([]);
    setSelected({});
    setListening(true);
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true });
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
    setListening(false);
  };

  const analyse = async () => {
    const key = localKey.trim();
    if (!key) { Alert.alert('API key required', 'Enter your Google AI (Gemini) key to use AI voice parsing.'); return; }
    if (!transcript.trim()) { Alert.alert('No speech detected', 'Please record something first.'); return; }
    setLoading(true);
    try {
      await saveApiKey(key);
      onApiKeyChange(key);
      const items = await parseItemsFromTranscript(transcript, key);
      if (items.length === 0) {
        Alert.alert('No items found', "Gemini couldn't find any food items in what you said. Try again and mention specific items.");
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

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <BackButton onPress={onBack} />
        <Text style={styles.heading}>Voice input</Text>
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

      <View style={styles.micSection}>
        <TouchableOpacity
          onPress={listening ? stopListening : startListening}
          style={[styles.micBtn, listening && styles.micBtnActive]}
          activeOpacity={0.85}
        >
          <Text style={styles.micEmoji}>{listening ? '⏹' : '🎙️'}</Text>
        </TouchableOpacity>
        <Text style={styles.micHint}>
          {listening ? 'Listening… tap to stop' : 'Tap to start speaking'}
        </Text>
        <Text style={styles.micExample}>
          e.g. "Two cartons of eggs, a bag of spinach and some chicken thighs"
        </Text>
      </View>

      {transcript.length > 0 && (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>What you said</Text>
          <TextInput
            value={transcript}
            onChangeText={setTranscript}
            multiline
            style={styles.transcriptText}
          />
        </View>
      )}

      {transcript.length > 0 && !loading && parsed.length === 0 && (
        <TouchableOpacity style={styles.analyzeBtn} onPress={analyse} activeOpacity={0.85}>
          <Text style={styles.analyzeBtnText}>✨ Parse with Gemini</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.green} />
          <Text style={styles.loadingText}>Gemini is parsing your items…</Text>
        </View>
      )}

      {parsed.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Found {parsed.length} item{parsed.length > 1 ? 's' : ''}</Text>
          {parsed.map((item, i) => (
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
                <Text style={styles.itemMeta}>{item.qty} {item.unit} · {item.days}d · {item.zone}</Text>
              </View>
              <View style={[styles.checkbox, selected[i] && styles.checkboxOn]}>
                {selected[i] && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>Add {Object.values(selected).filter(Boolean).length} item{Object.values(selected).filter(Boolean).length !== 1 ? 's' : ''} to pantry</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 60 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  heading: { fontFamily: fonts.display700, fontSize: 21, color: C.text },
  unavailableBox: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 40 },
  unavailableEmoji: { fontSize: 52, marginBottom: 16 },
  unavailableTitle: { fontFamily: fonts.display700, fontSize: 19, color: C.text, textAlign: 'center' },
  unavailableSub: { fontSize: 14, color: C.muted, fontFamily: fonts.body500, textAlign: 'center', marginTop: 10, lineHeight: 21 },
  apiCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 16, marginBottom: 16, gap: 10 },
  apiLabel: { fontFamily: fonts.body700, fontSize: 13, color: C.muted },
  apiInput: { backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, height: 46, fontSize: 14, fontFamily: fonts.body400, color: C.text },
  saveKeyBtn: { backgroundColor: C.green, borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center' },
  saveKeyText: { color: '#F4EFE3', fontFamily: fonts.body700, fontSize: 14 },
  keyChip: { alignSelf: 'flex-start', backgroundColor: '#EAF4E8', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, marginBottom: 16 },
  keyChipText: { fontSize: 12, fontFamily: fonts.body600, color: C.greenMid },
  micSection: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  micBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  micBtnActive: { backgroundColor: '#C0432B' },
  micEmoji: { fontSize: 36 },
  micHint: { fontFamily: fonts.body700, fontSize: 15, color: C.text },
  micExample: { fontSize: 12, fontFamily: fonts.body500, color: C.muted, textAlign: 'center', paddingHorizontal: 20 },
  transcriptBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 14 },
  transcriptLabel: { fontFamily: fonts.body700, fontSize: 12, color: C.muted, marginBottom: 6 },
  transcriptText: { fontFamily: fonts.body400, fontSize: 15, color: C.text, minHeight: 60 },
  analyzeBtn: { backgroundColor: C.green, borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  analyzeBtnText: { color: '#F4EFE3', fontFamily: fonts.display700, fontSize: 16 },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  loadingText: { fontFamily: fonts.body500, fontSize: 14, color: C.muted },
  sectionTitle: { fontFamily: fonts.display700, fontSize: 17, color: C.text, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 12, marginBottom: 10 },
  itemRowDim: { opacity: 0.45 },
  itemIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontFamily: fonts.body700, fontSize: 14, color: C.text },
  itemMeta: { fontSize: 12, fontFamily: fonts.body500, color: C.muted, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: C.green, borderColor: C.green },
  checkmark: { color: '#fff', fontSize: 13, fontFamily: fonts.body700 },
  addBtn: { backgroundColor: C.green, borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  addBtnText: { color: '#F4EFE3', fontFamily: fonts.display700, fontSize: 16 },
});
