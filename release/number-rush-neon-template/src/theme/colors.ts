export const colors = {
  background: '#050617',
  backgroundSecondary: '#0A0D24',
  card: '#10132E',
  panelLight: '#171B3D',
  neonPink: '#FF2DBB',
  magenta: '#FF0F8F',
  electricBlue: '#16C8FF',
  cyan: '#4DEBFF',
  purple: '#8D3DFF',
  orange: '#FF9D1C',
  yellow: '#FFD339',
  green: '#57F287',
  red: '#FF365E',
  white: '#F7F8FF',
  muted: '#9298BA',
} as const;

export type ColorName = keyof typeof colors;

export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
