import { Platform } from 'react-native';
import { getAppEnvironment, getAppVersion } from '../config/environment';
import { logger } from '../logging/logger';
import type { AppErrorContext, ReportedError } from './errorTypes';

export function buildErrorContext(
  partial?: Partial<AppErrorContext>,
): AppErrorContext {
  return {
    screen: partial?.screen,
    appVersion: getAppVersion(),
    platform: Platform.OS,
    releaseChannel: getAppEnvironment(),
    componentStack: partial?.componentStack ?? null,
  };
}

export function reportError(
  error: unknown,
  partial?: Partial<AppErrorContext>,
): ReportedError {
  const err = error instanceof Error ? error : new Error(String(error));
  const reported: ReportedError = {
    name: err.name,
    message: err.message,
    context: buildErrorContext(partial),
    timestamp: new Date().toISOString(),
  };
  logger.error('Unhandled UI error', {
    name: reported.name,
    message: reported.message,
    screen: reported.context.screen,
    appVersion: reported.context.appVersion,
    platform: reported.context.platform,
    releaseChannel: reported.context.releaseChannel,
    // Do not log full storage / secrets
  });
  return reported;
}
