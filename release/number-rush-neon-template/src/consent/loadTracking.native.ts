import type { TrackingModule } from './trackingModuleTypes';

export function loadTrackingModule(): TrackingModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-tracking-transparency') as TrackingModule;
  } catch {
    return null;
  }
}
