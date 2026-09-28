import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSanket } from '@/context/SanketContext';
import { useTheme } from '@/hooks/use-theme';

const SLIDES = [
  {
    step: '01 / 03',
    badge: 'HYDROLOGICAL MONITORING',
    icon: 'waves',
    accentColor: '#38bdf8',
    title: 'Sub-Centimeter Hydrology',
    desc: 'Autonomous field stations measure ultrasonic river gauge elevation and soil saturation in real time, detecting flood crests hours before embankments overflow.',
  },
  {
    step: '02 / 03',
    badge: 'ZERO CELLULAR DEPENDENCY',
    icon: 'radio-tower',
    accentColor: '#22d3ee',
    title: 'Decentralized LoRa Mesh',
    desc: 'When cyclones knock out cellular networks, Sankat-Net forms a self-healing 433MHz peer-to-peer radio mesh with AES-128 encryption to route disaster telemetry.',
  },
  {
    step: '03 / 03',
    badge: 'CITIZEN RESCUE & SAFETY',
    icon: 'shield-alert-outline',
    accentColor: '#22c55e',
    title: 'Hyperlocal Alerts & SOS',
    desc: 'Receive immediate acoustic siren alerts, verified high-ground evacuation shelters, and 1-tap SOS broadcasts customized specifically for your residential sector.',
  },
];

export function GuideStep() {
  const { setUserFlowStep } = useSanket();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Animated slide transition
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const isNativeDriver = Platform.OS !== 'web';

  const animateToSlide = (nextIndex: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: isNativeDriver,
      }),
      Animated.timing(slideAnim, {
        toValue: nextIndex > currentSlide ? -16 : 16,
        duration: 150,
        useNativeDriver: isNativeDriver,
      }),
    ]).start(() => {
      setCurrentSlide(nextIndex);
      slideAnim.setValue(nextIndex > currentSlide ? 16 : -16);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: isNativeDriver,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: isNativeDriver,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      animateToSlide(currentSlide + 1);
    } else {
      setUserFlowStep('auth');
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      animateToSlide(currentSlide - 1);
    } else {
      setUserFlowStep('welcome');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
        },
      ]}>
      {/* Background Subtle Ambient Glow */}
      <View style={[styles.ambientGlow, { backgroundColor: `${slide.accentColor}10` }]} />

      {/* Top Minimal Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={handlePrev}
          style={styles.backBtn}
          activeOpacity={0.7}>
          <Feather name="arrow-left" size={16} color={theme.textSecondary} />
          <Text style={[styles.backBtnText, { color: theme.textSecondary }]}>Back</Text>
        </TouchableOpacity>

        <View
          style={[
            styles.stepBadge,
            { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
          ]}>
          <Text style={[styles.stepBadgeText, { color: theme.textSecondary }]}>{slide.step}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setUserFlowStep('auth')}
          style={styles.skipBtn}
          activeOpacity={0.7}>
          <Text style={[styles.skipBtnText, { color: theme.textSecondary }]}>Skip</Text>
          <Feather name="chevrons-right" size={14} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Center Animated Content */}
      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        {/* Rounded Full Icon Emblem */}
        <View style={styles.iconWrapper}>
          <View
            style={[
              styles.iconHalo,
              {
                backgroundColor: `${slide.accentColor}25`,
                shadowColor: slide.accentColor,
              },
            ]}
          />
          <View
            style={[
              styles.iconCircle,
              {
                borderColor: `${slide.accentColor}60`,
                backgroundColor: theme.card,
              },
            ]}>
            <MaterialCommunityIcons
              name={slide.icon as any}
              size={54}
              color={slide.accentColor}
            />
          </View>
        </View>

        {/* Text Presentation */}
        <View style={styles.textBlock}>
          <Text style={[styles.badgeText, { color: slide.accentColor }]}>
            {slide.badge}
          </Text>
          <Text style={[styles.titleText, { color: theme.text }]}>{slide.title}</Text>
          <Text style={[styles.descText, { color: theme.textSecondary }]}>{slide.desc}</Text>
        </View>

        {/* Clean Modern Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => animateToSlide(idx)}
              style={[
                styles.dot,
                idx === currentSlide
                  ? [styles.activeDot, { backgroundColor: slide.accentColor }]
                  : [styles.inactiveDot, { backgroundColor: theme.cardBorder }],
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Bottom Action Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: '#0284c7' }]}
          activeOpacity={0.88}
          onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentSlide === SLIDES.length - 1 ? 'Continue to Sign In' : 'Next Step'}
          </Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07111f',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '100%',
  },
  ambientGlow: {
    position: 'absolute',
    top: '25%',
    width: 380,
    height: 380,
    borderRadius: 190,
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
  },
  topNav: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#8295aa',
    fontSize: 13,
    fontWeight: '600',
  },
  stepBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  stepBadgeText: {
    color: '#8295aa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  skipBtnText: {
    color: '#8295aa',
    fontSize: 13,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
    gap: 28,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconHalo: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70, // rounded-full
    backgroundColor: '#0b1625',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  titleText: {
    color: '#edf6ff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 12,
  },
  descText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 380,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  bottomSection: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  nextBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
