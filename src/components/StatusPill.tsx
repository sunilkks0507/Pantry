import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../theme';

export default function StatusPill({
  label,
  bg,
  color,
  dot,
  size = 'sm',
}: {
  label: string;
  bg: string;
  color: string;
  dot: string;
  size?: 'sm' | 'md';
}) {
  const big = size === 'md';
  return (
    <View style={[styles.pill, { backgroundColor: bg, paddingVertical: big ? 6 : 3, paddingHorizontal: big ? 14 : 8, borderRadius: big ? 12 : 9 }]}>
      <View style={[styles.dot, { backgroundColor: dot, width: big ? 7 : 5, height: big ? 7 : 5 }]} />
      <Text style={[styles.label, { color, fontSize: big ? 13 : 11 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  dot: { borderRadius: 10 },
  label: { fontFamily: fonts.body700 },
});
