import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { C } from '../theme';

export default function BackButton({ onPress, light }: { onPress: () => void; light?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, light && styles.btnLight]} activeOpacity={0.7}>
      <Text style={[styles.chevron, light && styles.chevronLight]}>‹</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLight: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 0,
  },
  chevron: { fontSize: 22, color: C.text, marginTop: -2 },
  chevronLight: { color: '#fff' },
});
