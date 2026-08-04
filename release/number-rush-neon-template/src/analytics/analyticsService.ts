import { isAnalyticsEnabled } from '../config/environment';
import { logger } from '../logging/logger';
import type {
  AnalyticsAdapter,
  AnalyticsEventName,
  AnalyticsPayload,
} from './analyticsTypes';

const noopAdapter: AnalyticsAdapter = {
  track: () => undefined,
};

const devLoggerAdapter: AnalyticsAdapter = {
  track: (event, payload) => {
    logger.debug(`analytics:${event}`, payload);
  },
};

let adapter: AnalyticsAdapter = noopAdapter;

export function configureAnalytics(next?: AnalyticsAdapter): void {
  if (next) {
    adapter = next;
    return;
  }
  adapter = isAnalyticsEnabled() ? devLoggerAdapter : noopAdapter;
}

export function trackEvent(
  event: AnalyticsEventName,
  payload?: AnalyticsPayload,
): void {
  try {
    adapter.track(event, payload);
  } catch {
    // never block gameplay
  }
}

// Default: safe no-op until provider configures
configureAnalytics(noopAdapter);
