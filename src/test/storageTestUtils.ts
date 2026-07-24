import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearAllStorage(): Promise<void> {
  await AsyncStorage.clear();
}

export async function seedStorage(
  entries: Record<string, unknown>,
): Promise<void> {
  await Promise.all(
    Object.entries(entries).map(([key, value]) =>
      AsyncStorage.setItem(
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ),
    ),
  );
}

export async function seedRaw(key: string, raw: string): Promise<void> {
  await AsyncStorage.setItem(key, raw);
}
