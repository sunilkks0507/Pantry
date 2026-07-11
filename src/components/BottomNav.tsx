import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, fonts } from '../theme';
import { Screen } from '../types';

const LEFT = [
  { icon: '🏠', label: 'Home', key: 'home' as Screen },
  { icon: '🧺', label: 'Inventory', key: 'inventory' as Screen },
];
const RIGHT = [
  { icon: '🍳', label: 'Recipes', key: 'recipes' as Screen },
  { icon: '🛒', label: 'List', key: 'list' as Screen },
];

export default function BottomNav({
  screen,
  onGo,
  onScan,
}: {
  screen: Screen;
  onGo: (s: Screen) => void;
  onScan: () => void;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  const Tab = (t: { icon: string; label: string; key: Screen }) => {
    const active = screen === t.key;
    return (
      <TouchableOpacity key={t.key} onPress={() => onGo(t.key)} style={styles.tab} activeOpacity={0.7}>
        <Text style={[styles.tabIcon, !active && styles.tabIconInactive]}>{t.icon}</Text>
        <Text style={[styles.tabLabel, { color: active ? C.green : C.muted }]}>{t.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {LEFT.map(Tab)}
        <View style={styles.micSlot}>
          <TouchableOpacity onPress={onScan} activeOpacity={0.85}>
            <Animated.View
              pointerEvents="none"
              style={[styles.pulseRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
            />
            <LinearGradient colors={['#F0916F', C.orange]} style={styles.micBtn}>
              <Text style={styles.micIcon}>📷</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {RIGHT.map(Tab)}
      </View>
      <View style={styles.homeIndicatorRow}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bar: {
    height: 74,
    backgroundColor: 'rgba(251,248,241,0.97)',
    borderTopWidth: 1,
    borderTopColor: '#EBE3D2',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 11,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  tabIcon: { fontSize: 21 },
  tabIconInactive: { opacity: 0.45 },
  tabLabel: { fontSize: 10.5, fontFamily: fonts.body700 },
  micSlot: { flex: 1, alignItems: 'center' },
  pulseRing: {
    position: 'absolute',
    top: -26,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 21,
    backgroundColor: C.orange,
  },
  micBtn: {
    width: 60,
    height: 60,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    ...Platform.select({
      ios: { shadowColor: C.orange, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 8 },
    }),
  },
  micIcon: { fontSize: 24, marginTop: -2 },
  homeIndicatorRow: { height: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(251,248,241,0.97)' },
  homeIndicator: { width: 120, height: 4, borderRadius: 3, backgroundColor: C.text, opacity: 0.25 },
});
