export type Palette = {
  id: string;
  labelKey: string;
  primary: string;
  primaryHover: string;
  primaryPale: string;
  bgPage: string;
  border: string;
};

export const PALETTES: Palette[] = [
  {
    id: 'forest',
    labelKey: 'themes.forest',
    primary: '#2D6A4F',
    primaryHover: '#40916C',
    primaryPale: '#D8F3DC',
    bgPage: '#FAF7F2',
    border: '#E8E0D0',
  },
  {
    id: 'ocean',
    labelKey: 'themes.ocean',
    primary: '#1E6FB0',
    primaryHover: '#3B82F6',
    primaryPale: '#DBEAFE',
    bgPage: '#F0F8FF',
    border: '#BFDBFE',
  },
  {
    id: 'rose',
    labelKey: 'themes.rose',
    primary: '#BE185D',
    primaryHover: '#EC4899',
    primaryPale: '#FCE7F3',
    bgPage: '#FFF5F9',
    border: '#FBCFE8',
  },
  {
    id: 'slate',
    labelKey: 'themes.slate',
    primary: '#334155',
    primaryHover: '#64748B',
    primaryPale: '#E2E8F0',
    bgPage: '#F8FAFC',
    border: '#CBD5E1',
  },
  {
    id: 'amber',
    labelKey: 'themes.amber',
    primary: '#B45309',
    primaryHover: '#F59E0B',
    primaryPale: '#FEF3C7',
    bgPage: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    id: 'violet',
    labelKey: 'themes.violet',
    primary: '#6D28D9',
    primaryHover: '#8B5CF6',
    primaryPale: '#EDE9FE',
    bgPage: '#F5F3FF',
    border: '#DDD6FE',
  },
  {
    id: 'midnight',
    labelKey: 'themes.midnight',
    primary: '#7C3AED',
    primaryHover: '#A78BFA',
    primaryPale: '#312E81',
    bgPage: '#0F0F1A',
    border: '#312E81',
  },
  {
    id: 'custom',
    labelKey: 'themes.custom',
    primary: '#2D6A4F',
    primaryHover: '#40916C',
    primaryPale: '#D8F3DC',
    bgPage: '#FAF7F2',
    border: '#E8E0D0',
  },
];

export function applyPalette(palette: Palette): void {
  const root = document.documentElement;
  root.style.setProperty('--plx-primary', palette.primary);
  root.style.setProperty('--plx-hover', palette.primaryHover);
  root.style.setProperty('--plx-pale', palette.primaryPale);
  root.style.setProperty('--plx-bg', palette.bgPage);
  root.style.setProperty('--plx-border', palette.border);
}
