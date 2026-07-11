import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, fonts } from '../theme';

export default function ComingSoonModal({
  visible,
  onClose,
  icon,
  title,
  body,
}: {
  visible: boolean;
  onClose: () => void;
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Text style={{ fontSize: 30 }}>{icon}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <TouchableOpacity onPress={onClose} style={styles.btn} activeOpacity={0.85}>
            <Text style={styles.btnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(32,39,31,0.45)', alignItems: 'center', justifyContent: 'center', padding: 30 },
  card: { width: '100%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
  iconWrap: { width: 60, height: 60, borderRadius: 18, backgroundColor: C.purpleBg, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontFamily: fonts.display700, fontSize: 18, color: C.text, marginBottom: 8, textAlign: 'center' },
  body: { fontFamily: fonts.body500, fontSize: 13.5, color: C.muted, textAlign: 'center', lineHeight: 19, marginBottom: 18 },
  btn: { backgroundColor: C.green, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28 },
  btnText: { fontFamily: fonts.display700, color: C.cream, fontSize: 14 },
});
