import i18n from '../../i18n/text.json';

export const t = (k: string): string => {
  return i18n[k] || '';
};