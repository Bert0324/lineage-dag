import i18n from '../../i18n/text.json';

export const t = (k: string): string => {
  const inputI18N = (window as any).__config___ || {};
  const config = {
    ...i18n,
    ...inputI18N
  }
  return config[k] || '';
};