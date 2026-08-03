import type { ConfigContext, ExpoConfig } from 'expo/config';

import appJson from './app.json';

/**
 * Mirrors `TEMPLATE_FEATURES.monetization` in src/config/templateFeatures.ts.
 * Duplicated (not imported) because Expo's config loader transpiles this
 * file in isolation and cannot resolve project-relative TS imports here.
 * Keep this value in sync with templateFeatures.ts.
 */
const TEMPLATE_MONETIZATION_ENABLED = false;

function stripPlugin(
  plugins: ExpoConfig['plugins'],
  name: string,
): NonNullable<ExpoConfig['plugins']> {
  return (plugins ?? []).filter((entry) => {
    const pluginName = Array.isArray(entry) ? entry[0] : entry;
    return pluginName !== name;
  });
}

/**
 * Sellable template posture: monetization is disabled (see
 * src/config/templateFeatures.ts), so the AdMob and App Tracking
 * Transparency Expo plugins are NOT registered here. That keeps the
 * `com.google.android.gms.permission.AD_ID` Android permission and the
 * NSUserTrackingUsageDescription out of the shipped app entirely.
 *
 * If you re-enable `TEMPLATE_FEATURES.monetization`, set
 * EXPO_PUBLIC_ADMOB_ANDROID_APP_ID / EXPO_PUBLIC_ADMOB_IOS_APP_ID and
 * re-add these plugin entries (see CUSTOMIZATION_GUIDE.md).
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const base = { ...appJson.expo, ...config };
  let plugins = stripPlugin(base.plugins, 'react-native-google-mobile-ads');
  plugins = stripPlugin(plugins, 'expo-tracking-transparency');

  if (!TEMPLATE_MONETIZATION_ENABLED) {
    return { ...base, plugins };
  }

  return {
    ...base,
    plugins: [
      ...plugins,
      [
        'react-native-google-mobile-ads',
        {
          androidAppId:
            process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
            'ca-app-pub-3940256099942544~3347511713',
          iosAppId:
            process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ||
            'ca-app-pub-3940256099942544~1458002511',
          delayAppMeasurementInit: true,
          userTrackingUsageDescription:
            'Allowing tracking helps us show more relevant ads and measure ad performance.',
        },
      ],
      'expo-tracking-transparency',
    ],
  };
};
