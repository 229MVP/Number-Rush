export type AppErrorContext = {
  screen?: string;
  appVersion: string;
  platform: string;
  releaseChannel: string;
  componentStack?: string | null;
};

export type ReportedError = {
  name: string;
  message: string;
  context: AppErrorContext;
  timestamp: string;
};
