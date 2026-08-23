# AdSense Readiness Design

## Goal

Improve the site's trust signals and AdSense readiness without removing or hiding any existing article, then verify the generated site before submitting the existing `haogre.com` site for a new AdSense review.

## Scope

- Keep all 82 existing posts public, including the four short legacy posts identified during the audit.
- Add a complete About page with author identity, editorial scope, and contact information.
- Add localized Privacy Policy and Contact pages reachable from the shared footer.
- Add the AdSense `ads.txt` declaration for publisher `ca-pub-6427878095783791`.
- Improve shared metadata/structured data only where it supports author and site trust signals.
- Do not change the configured canonical domain (`https://blog.haogre.com/`), post URLs, or existing article content.
- Do not click the AdSense review submission until the site changes are deployed and the user confirms at action time.

## Design

The existing Astro content collections remain the source of truth. Trust pages will use the existing `src/content/pages` collection and the same `Layout`, `Header`, `Breadcrumb`, `Main`, and `Footer` components used by the current About page. A shared footer link group will expose About, Privacy, and Contact without changing the article navigation.

The AdSense declaration will be a static `public/ads.txt` file so it is emitted at the site root. The existing AdSense script stays in `src/layouts/Layout.astro`; no ad placements are added while the site is under review.

## Content Requirements

- About: identify HAOGRE, explain the site's personal technical notes, AI/business essays, network/system troubleshooting, creative writing, and family/life observations, and state that posts are written and edited by the author.
- Privacy: explain analytics, AdSense advertising/cookies, contact email handling, external links, retention, and user rights in plain language; link to Google's relevant privacy resources.
- Contact: provide the public email link and describe appropriate reasons to write, without collecting a form submission.
- Footer labels must be localized in Chinese and English.

## Verification

- Run the repository's existing automated tests.
- Run Astro type checking and a production build.
- Confirm the build contains `/ads.txt`, `/about/`, `/privacy/`, `/contact/`, and their English equivalents.
- Confirm no existing post files are marked as drafts or removed by the change.
- Inspect the deployed public pages and `ads.txt` before preparing the AdSense review action.
