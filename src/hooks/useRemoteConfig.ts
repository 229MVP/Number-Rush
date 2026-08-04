import { useRemoteConfigContext } from '../liveops/RemoteConfigProvider';

export function useRemoteConfig() {
  return useRemoteConfigContext();
}
