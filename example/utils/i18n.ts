import i18n from "../../i18n/text.json";
import { get, merge } from "lodash";

let config;
const getConfig = () => {
  if (config) return config;
  const inputI18N = (window as any).__config___ || {};
  config = merge(i18n, inputI18N);
  return config;
};

export const t = <T = string>(k: string): T => {
  const config = getConfig();
  return get(config, k) || "";
};
