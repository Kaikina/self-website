import type { Locale, Translation } from "./types";
import en from "./en";
import fr from "./fr";
import es from "./es";
import pt from "./pt";

export const translations: Record<Locale, Translation> = { en, fr, es, pt };

export function getTranslation(locale: Locale): Translation {
  return translations[locale];
}

export { locales, defaultLocale, localeLabels, localeHtmlLang, localeOgLocale, getLocalizedPath } from "./types";
export type { Locale, Translation } from "./types";
