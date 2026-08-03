import React, { useEffect } from 'react';
import { configureAnalytics, trackEvent } from './analyticsService';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureAnalytics();
    trackEvent('app_opened');
  }, []);

  return <>{children}</>;
}

export { trackEvent };
