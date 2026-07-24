type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown>;

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'typedReset',
  'confirmationText',
  'storageDump',
]);

const recent = new Map<string, number>();
const DEDUPE_MS = 2500;

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

function redact(meta?: LogMeta): LogMeta | undefined {
  if (!meta) return undefined;
  const out: LogMeta = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key)) {
      out[key] = '[redacted]';
    } else {
      out[key] = value;
    }
  }
  return out;
}

function shouldEmit(level: LogLevel, message: string): boolean {
  if (level === 'debug' && isProd()) return false;
  if (level === 'info' && isProd()) return false;
  const key = `${level}:${message}`;
  const now = Date.now();
  const last = recent.get(key) ?? 0;
  if (now - last < DEDUPE_MS) return false;
  recent.set(key, now);
  return true;
}

function emit(level: LogLevel, message: string, meta?: LogMeta): void {
  if (!shouldEmit(level, message)) return;
  const payload = redact(meta);
  const line = payload ? `${message} ${JSON.stringify(payload)}` : message;
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(`[NumberRush] ${line}`);
    return;
  }
  if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(`[NumberRush] ${line}`);
    return;
  }
  if (!isProd()) {
    // eslint-disable-next-line no-console
    console.log(`[NumberRush:${level}] ${line}`);
  }
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => emit('debug', message, meta),
  info: (message: string, meta?: LogMeta) => emit('info', message, meta),
  warn: (message: string, meta?: LogMeta) => emit('warn', message, meta),
  error: (message: string, meta?: LogMeta) => emit('error', message, meta),
};
