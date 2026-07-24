import type { ConfigContext, ExpoConfig } from 'expo/config';

import appJson from './app.json';

function stripPlugin(
  plugins: ExpoConfig['plugins'],
  name: string,
): NonNullable<ExpoConfig['plugins']> {
  return (plugins ?? []).filter((entry) => {
    const pluginName = Array.isArray(entry) ? entry[0] : entry;
    return pluginName !== name;
  });
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = { ...appJson.expo, ...config };
  let plugins = stripPlugin(base.plugins, 'react-native-google-mobile-ads');
  plugins = stripPlugin(plugins, 'expo-tracking-transparency');

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
