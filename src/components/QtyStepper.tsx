import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, fonts } from '../theme';

export default function QtyStepper({
  qty,
  unit,
  onDec,
  onInc,
  onUnitPress,
  size = 'md',
}: {
  qty: number;
  unit: string;
  onDec: () => void;
  onInc: () => void;
  onUnitPress?: () => void; // if provided, the value label is tappable to change the unit
  size?: 'sm' | 'md';
}) {
  const sm = size === 'sm';
  const btn = sm ? styles.btnSm : styles.btn;
  const btnText = sm ? styles.btnTextSm : styles.btnText;
  const label = (
    <Text style={[styles.value, sm && styles.valueSm]}>
      {qty} {unit}
    </Text>
  );
  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={onDec} style={btn} activeOpacity={0.7}>
        <Text style={btnText}>−</Text>
      </TouchableOpacity>
      {onUnitPress ? (
        <TouchableOpacity onPress={onUnitPress} activeOpacity={0.7} style={styles.labelWrap}>
          {label}
          <Text style={styles.caret}>⌄</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.labelWrap}>{label}</View>
      )}
      <TouchableOpacity onPress={onInc} style={btn} activeOpacity={0.7}>
        <Text style={btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  btnSm: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 22, color: C.green, fontFamily: fonts.body700, marginTop: -3 },
  btnTextSm: { fontSize: 18, color: C.green, fontFamily: fonts.body700, marginTop: -2 },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  value: { fontFamily: fonts.display700, fontSize: 15, color: C.text, minWidth: 46, textAlign: 'center' },
  valueSm: { fontSize: 13, minWidth: 40 },
  caret: { fontSize: 12, color: C.muted, marginTop: -2 },
});
