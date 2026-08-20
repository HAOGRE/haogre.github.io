type AnalyticsValue = string | number | boolean;
type AnalyticsParams = Record<string, AnalyticsValue | undefined>;

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

const ANALYTICS_WINDOW = window as AnalyticsWindow;
const PROGRESS_MILESTONES = [25, 50, 75, 90] as const;
const TARGET_PATH_EVENTS = new Set([
  "not_found_cta_click",
  "related_content_click",
]);

let lastPageLocation = "";
let lastSearchTerm = "";
let searchTimer: number | undefined;
let articleCleanup: (() => void) | undefined;

function cleanParams(params: AnalyticsParams): Record<string, AnalyticsValue> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as Record<string, AnalyticsValue>;
}

function getPageContext(): AnalyticsParams {
  const main = document.querySelector<HTMLElement>(
    "main[data-page-type], main[data-layout]"
  );
  const siteContentType =
    main?.dataset.pageType ??
    (main?.dataset.layout === "index" ? "home" : "page");
  const siteLanguage = document.documentElement.lang || undefined;

  return {
    site_content_type: siteContentType,
    site_language: siteLanguage,
    article_id: main?.dataset.contentId || undefined,
  };
}

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (typeof ANALYTICS_WINDOW.gtag !== "function") return;

  ANALYTICS_WINDOW.gtag("event", name, {
    ...getPageContext(),
    ...cleanParams(params),
  });
}

function getReferrerDetails() {
  if (!document.referrer) {
    return { referrer_host: "(direct)", referrer_path: "(direct)" };
  }

  try {
    const referrer = new URL(document.referrer);
    return {
      referrer_host: referrer.hostname,
      referrer_path: referrer.pathname,
    };
  } catch {
    return { referrer_host: "(unknown)", referrer_path: "(unknown)" };
  }
}

export function trackPageView() {
  if (typeof ANALYTICS_WINDOW.gtag !== "function") return;

  const pageLocation = window.location.href;
  if (pageLocation === lastPageLocation) return;

  lastPageLocation = pageLocation;
  const pageContext = getPageContext();
  ANALYTICS_WINDOW.gtag("event", "page_view", {
    ...pageContext,
    page_title: document.title,
    page_location: pageLocation,
    page_path: window.location.pathname,
  });

  if (pageContext.site_content_type === "404") {
    trackEvent("not_found_view", {
      requested_path: window.location.pathname,
      ...getReferrerDetails(),
    });
  }
}

function normalizeSearchTerm(term: string) {
  const normalized = term.trim().replace(/\s+/g, " ").slice(0, 100);
  if (!normalized) return "";

  if (/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(normalized)) {
    return "[redacted-email]";
  }

  if (/\d{7,}/.test(normalized)) {
    return "[redacted-number]";
  }

  return normalized;
}

function trackSearchTerm(term: string) {
  const searchTerm = normalizeSearchTerm(term);
  if (!searchTerm || searchTerm === lastSearchTerm) return;

  lastSearchTerm = searchTerm;
  trackEvent("search", { search_term: searchTerm });
}

function scheduleSearchTracking(input: HTMLInputElement) {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    trackSearchTerm(input.value);
  }, 700);
}

function getActiveSeconds(startedAt: number, accumulatedMs: number) {
  const visibleMs =
    document.visibilityState === "visible" ? performance.now() - startedAt : 0;
  return Math.round((accumulatedMs + visibleMs) / 1000);
}

function setupArticleTracking() {
  const main = document.querySelector<HTMLElement>(
    'main[data-page-type="article"]'
  );
  const article = document.querySelector<HTMLElement>("#article");

  if (!main || !article) return undefined;

  const startedAt = performance.now();
  const seenMilestones = new Set<number>();
  let accumulatedVisibleMs = 0;
  let visibleSince = startedAt;
  let articleEngaged = false;
  let animationFrame = 0;

  const getProgress = () => {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (scrollableHeight <= 0) return 100;

    return Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100));
  };

  const reportProgress = () => {
    animationFrame = 0;
    const progress = getProgress();
    const activeSeconds = getActiveSeconds(visibleSince, accumulatedVisibleMs);

    for (const milestone of PROGRESS_MILESTONES) {
      if (progress < milestone || seenMilestones.has(milestone)) continue;

      seenMilestones.add(milestone);
      trackEvent("article_progress", {
        progress_percent: milestone,
        active_seconds: activeSeconds,
      });
    }

    if (!articleEngaged && progress >= 50 && activeSeconds >= 15) {
      articleEngaged = true;
      trackEvent("article_engaged", {
        engagement_signal: "scroll_50_after_15s",
        active_seconds: activeSeconds,
      });
    }
  };

  const onScroll = () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(reportProgress);
    }
  };

  const onVisibilityChange = () => {
    const now = performance.now();
    if (document.visibilityState === "hidden") {
      accumulatedVisibleMs += now - visibleSince;
    } else {
      visibleSince = now;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  reportProgress();

  return () => {
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
  };
}

function getCodeBlockDetails(copyButton: Element) {
  const codeBlock = copyButton.closest("pre");
  if (!codeBlock) return {};

  const code = codeBlock.querySelector("code");
  const codeLanguage = Array.from(code?.classList ?? [])
    .find(className => className.startsWith("language-"))
    ?.replace("language-", "");
  const codeBlockIndex = Array.from(
    document.querySelectorAll("#article pre")
  ).indexOf(codeBlock);

  return {
    code_block_index: codeBlockIndex >= 0 ? codeBlockIndex + 1 : undefined,
    code_language: codeLanguage,
  };
}

function handleClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const analyticsElement = target.closest<HTMLElement>(
    "[data-analytics-event]"
  );
  if (analyticsElement) {
    const eventName = analyticsElement.dataset.analyticsEvent;
    if (eventName) {
      trackEvent(eventName, {
        share_method: analyticsElement.dataset.shareMethod,
        from_language: analyticsElement.dataset.fromLanguage,
        to_language: analyticsElement.dataset.toLanguage,
        target_type: analyticsElement.dataset.targetType,
        target_id: analyticsElement.dataset.targetId,
        target_path: TARGET_PATH_EVENTS.has(eventName)
          ? (analyticsElement.getAttribute("href") ?? undefined)
          : undefined,
        tag_name: analyticsElement.dataset.tagName,
        cta: analyticsElement.dataset.cta,
        contact_method: analyticsElement.dataset.contactMethod,
        social_network: analyticsElement.dataset.socialNetwork,
      });
    }
  }

  const copyButton = target.closest(".copy-code");
  if (copyButton) {
    trackEvent("copy_code", getCodeBlockDetails(copyButton));
  }

  const searchResult = target.closest<HTMLAnchorElement>(
    ".pagefind-ui__result-link"
  );
  if (searchResult) {
    trackEvent("search_result_click", {
      target_path: new URL(searchResult.href, window.location.href).pathname,
      search_term: normalizeSearchTerm(
        new URLSearchParams(window.location.search).get("q") ?? ""
      ),
    });
  }
}

function setupPageFeatures() {
  articleCleanup?.();
  articleCleanup = setupArticleTracking();
}

document.addEventListener("astro:page-load", trackPageView);
document.addEventListener("astro:page-load", setupPageFeatures);
document.addEventListener("click", handleClick);
document.addEventListener("input", event => {
  const target = event.target;
  if (
    target instanceof HTMLInputElement &&
    target.matches(".pagefind-ui__search-input")
  ) {
    scheduleSearchTracking(target);
  }
});

trackPageView();
setupPageFeatures();
