export type TrackingModule = {
  getTrackingPermissionsAsync: () => Promise<{ status: string }>;
  requestTrackingPermissionsAsync: () => Promise<{ status: string }>;
  isAvailable: () => boolean;
};
