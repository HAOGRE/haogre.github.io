import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.haogre.com/",
    title: "HAOGRE's blog",
    description: "技术、系统与生活笔记。",
    author: "HAOGRE",
    profile: "https://blog.haogre.com/about/",
    ogImage: "default-og.jpg",
    lang: "zh-cn",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 12,
    perIndex: 8,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: false,
    dynamicOgImage: false,
    showArchives: false,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/HAOGRE" },
    { name: "mail", url: "mailto:haogre@gmail.com" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
