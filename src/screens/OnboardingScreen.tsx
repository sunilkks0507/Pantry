import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, fonts } from '../theme';
import { ONB } from '../data';

export default function OnboardingScreen({
  idx,
  onNext,
  onSkip,
}: {
  idx: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const s = ONB[idx];
  return (
    <LinearGradient colors={['#2C5E3F', '#3C7A50', '#4F9D69']} style={styles.wrap}>
      <View style={styles.bubble} />
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={{ fontSize: 18 }}>🥬</Text>
          </View>
          <Text style={styles.brandText}>Pantry</Text>
        </View>
        <TouchableOpacity onPress={onSkip}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.emoji}>{s.emoji}</Text>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.copy}>{s.body}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {ONB.map((_, i) => (
            <View key={i} style={[styles.dot, i === idx ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>
        <TouchableOpacity onPress={onNext} style={styles.cta} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{s.cta} →</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 30, paddingTop: 34, paddingBottom: 40, justifyContent: 'space-between' },
  bubble: { position: 'absolute', top: -80, right: -70, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.07)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#F4EFE3', alignItems: 'center', justifyContent: 'center' },
  brandText: { fontFamily: fonts.display700, fontSize: 18, color: '#F4EFE3' },
  skip: { color: 'rgba(244,239,227,0.75)', fontSize: 14, fontFamily: fonts.body600 },
  body: { flex: 1, justifyContent: 'center' },
  emoji: { fontSize: 60, marginBottom: 10 },
  title: { fontFamily: fonts.display700, fontSize: 34, lineHeight: 38, letterSpacing: -1, color: '#F4EFE3', marginBottom: 14 },
  copy: { fontSize: 15.5, lineHeight: 24, color: 'rgba(244,239,227,0.85)', maxWidth: 300, fontFamily: fonts.body400 },
  footer: {},
  dots: { flexDirection: 'row', gap: 7, marginBottom: 22 },
  dot: { height: 7, borderRadius: 4 },
  dotActive: { width: 24, backgroundColor: '#F4EFE3' },
  dotInactive: { width: 7, backgroundColor: 'rgba(244,239,227,0.35)' },
  cta: { width: '100%', height: 56, borderRadius: 18, backgroundColor: '#F4EFE3', alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: C.green, fontFamily: fonts.display700, fontSize: 17 },
});
