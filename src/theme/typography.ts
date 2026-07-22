import { TextStyle } from 'react-native';
import { colors } from './colors';

export const fontFamilies = {
  orbitronRegular: 'Orbitron_400Regular',
  orbitronMedium: 'Orbitron_500Medium',
  orbitronSemiBold: 'Orbitron_600SemiBold',
  orbitronBold: 'Orbitron_700Bold',
  orbitronExtraBold: 'Orbitron_800ExtraBold',
  orbitronBlack: 'Orbitron_900Black',
  rajdhaniRegular: 'Rajdhani_400Regular',
  rajdhaniMedium: 'Rajdhani_500Medium',
  rajdhaniSemiBold: 'Rajdhani_600SemiBold',
  rajdhaniBold: 'Rajdhani_700Bold',
  interRegular: 'Inter_400Regular',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
} as const;

export const typography = {
  logoNumber: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 38,
    letterSpacing: 4,
    color: colors.neonPink,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  logoRush: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 46,
    letterSpacing: 6,
    color: colors.electricBlue,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  splashSubtitle: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    letterSpacing: 3,
    color: colors.muted,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  tapToStart: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    letterSpacing: 4,
    color: colors.neonPink,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  buttonLarge: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 17,
    letterSpacing: 1.5,
    color: colors.white,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  buttonNormal: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: colors.white,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  navLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  currency: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.white,
  } satisfies TextStyle,
} as const;
