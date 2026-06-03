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

const TAG_SLUGS = {
  "zh-cn": {
    随笔: "musings",
    碎片: "fragments",
    其他: "miscellaneous",
    病历: "health-notes",
  },
  en: {
    musings: "随笔",
    fragments: "碎片",
    miscellaneous: "其他",
    "health-notes": "病历",
  },
} as const;

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

function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function getLocalizedTagRoute(
  route: string,
  currentLocale: SupportedLocale
): string {
  const tagMatch = route.match(/^tags\/([^/]+)(\/.*)?$/);
  if (!tagMatch) return route;

  const tag = decodePathSegment(tagMatch[1]);
  const mappedTag =
    TAG_SLUGS[currentLocale][tag as keyof typeof TAG_SLUGS[typeof currentLocale]];
  if (!mappedTag) return route;

  return `tags/${mappedTag}${tagMatch[2] ?? ""}`;
}

export function getLocalizedPathname(
  pathname: string,
  currentLocale: string | undefined,
  targetLocale: string | undefined
): string {
  const locale = normalizeLocale(currentLocale);
  const target = normalizeLocale(targetLocale);
  const logicalRoute = getLogicalPathname(pathname, locale).replace(/^\/+/, "");
  const route =
    locale === target ? logicalRoute : getLocalizedTagRoute(logicalRoute, locale);
  return getRelativeLocaleUrl(target, route);
}
