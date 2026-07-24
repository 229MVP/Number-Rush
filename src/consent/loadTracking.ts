import type { TrackingModule } from './trackingModuleTypes';

/** Default stub; Metro prefers platform extensions. */
export function loadTrackingModule(): TrackingModule | null {
  return null;
}
