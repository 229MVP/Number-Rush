import { useRemoteConfigContext } from '../liveops/RemoteConfigProvider';

export function useServerClock() {
  const { serverClock } = useRemoteConfigContext();
  return serverClock;
}
