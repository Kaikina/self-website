import type { Locale, Translation } from "./types";
import en from "./en";
import fr from "./fr";
import es from "./es";

export const translations: Record<Locale, Translation> = { en, fr, es };

export function getTranslation(locale: Locale): Translation {
  return translations[locale];
}

export { locales, defaultLocale, localeLabels, localeHtmlLang, localeOgLocale, getLocalizedPath } from "./types";
export type { Locale, Translation } from "./types";
