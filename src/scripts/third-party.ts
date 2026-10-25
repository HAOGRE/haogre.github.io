// Keep analytics and advertising off the initial rendering/network path.
// Astro's bundled modules run once, including across ClientRouter navigations.
function loadThirdPartyScripts() {
  for (const src of [
    "https://www.googletagmanager.com/gtag/js?id=G-DWCLJNH8M4",
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6427878095783791",
  ]) {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.append(script);
  }
}

window.setTimeout(() => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadThirdPartyScripts, { timeout: 2000 });
  } else {
    loadThirdPartyScripts();
  }
}, 3000);
