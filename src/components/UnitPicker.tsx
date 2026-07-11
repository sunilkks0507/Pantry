import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { C, fonts, UNITS } from '../theme';

export default function UnitPicker({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: string;
  onSelect: (unit: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <Text style={styles.title}>Unit of measure</Text>
        <View style={styles.chips}>
          {UNITS.map((u) => {
            const active = u === value;
            return (
              <TouchableOpacity
                key={u}
                onPress={() => { onSelect(u); onClose(); }}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{u}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  card: { position: 'absolute', left: 20, right: 20, top: '32%', backgroundColor: '#fff', borderRadius: 22, padding: 20 },
  title: { fontFamily: fonts.display700, fontSize: 18, color: C.text, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: C.cream, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.green, borderColor: C.green },
  chipText: { fontFamily: fonts.body700, fontSize: 14, color: '#5A6450' },
  chipTextActive: { color: '#F4EFE3' },
});
