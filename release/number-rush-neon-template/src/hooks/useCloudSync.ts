import { useCloudSyncContext } from '../sync/CloudSyncProvider';

export function useCloudSync() {
  return useCloudSyncContext();
}
