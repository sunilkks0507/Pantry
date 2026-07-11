import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { C, fonts } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onManual: () => void;
  onScan: () => void;
  onVoice: () => void;
}

export default function AddMethodSheet({ visible, onClose, onManual, onScan, onVoice }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Add item to pantry</Text>
        <Text style={styles.sub}>Choose how you'd like to add</Text>

        <TouchableOpacity style={styles.option} onPress={onManual} activeOpacity={0.8}>
          <View style={[styles.optIcon, { backgroundColor: '#EAF4E8' }]}>
            <Text style={styles.optEmoji}>✏️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optTitle}>Manual entry</Text>
            <Text style={styles.optSub}>Type in the item details</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={onScan} activeOpacity={0.8}>
          <View style={[styles.optIcon, { backgroundColor: '#FCE9D9' }]}>
            <Text style={styles.optEmoji}>📷</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optTitle}>Scan receipt or item</Text>
            <Text style={styles.optSub}>AI reads your photo automatically</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={onVoice} activeOpacity={0.8}>
          <View style={[styles.optIcon, { backgroundColor: C.purpleBg }]}>
            <Text style={styles.optEmoji}>🎙️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optTitle}>Voice input</Text>
            <Text style={styles.optSub}>Say what you bought, AI adds it</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: C.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 14,
  },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 20 },
  title: { fontFamily: fonts.display700, fontSize: 20, color: C.text, marginBottom: 4 },
  sub: { fontSize: 13, fontFamily: fonts.body500, color: C.muted, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  optIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optEmoji: { fontSize: 22 },
  optTitle: { fontFamily: fonts.body700, fontSize: 15, color: C.text },
  optSub: { fontSize: 12, fontFamily: fonts.body500, color: C.muted, marginTop: 2 },
  chevron: { fontSize: 20, color: C.muted },
  cancelBtn: { marginTop: 4, alignItems: 'center', padding: 14 },
  cancelText: { fontFamily: fonts.body700, fontSize: 15, color: C.muted },
});
