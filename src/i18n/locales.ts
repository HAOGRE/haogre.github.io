import { getRelativeLocaleUrl } from "astro:i18n";
import { stripBase, stripLocale } from "@/utils/withBase";

export const DEFAULT_LOCALE = "zh-cn";
export const SUPPORTED_LOCALES = [DEFAULT_LOCALE, "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_HREFLANG: Record<SupportedLocale, string> = {
  "zh-cn": "zh-CN",
  en: "en",
};

export const LOCALE_SWITCH_LABEL: Record<SupportedLocale, string> = {
  "zh-cn": "中",
  en: "En",
};

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function normalizeLocale(locale: string | undefined): SupportedLocale {
  const value = locale ?? "";
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export function getAlternateLocale(locale: string | undefined): SupportedLocale {
  return normalizeLocale(locale) === "en" ? DEFAULT_LOCALE : "en";
}

export function getLogicalPathname(
  pathname: string,
  locale: string | undefined
): string {
  const withoutBase = stripBase(pathname);
  const withoutLocale = stripLocale(withoutBase, normalizeLocale(locale));
  const normalized =
    withoutLocale.length > 1 ? withoutLocale.replace(/\/+$/, "") : withoutLocale;

  return normalized || "/";
}

export function getLocalizedPathname(
  pathname: string,
  currentLocale: string | undefined,
  targetLocale: string | undefined
): string {
  const route = getLogicalPathname(pathname, currentLocale).replace(/^\/+/, "");
  return getRelativeLocaleUrl(normalizeLocale(targetLocale), route);
}
