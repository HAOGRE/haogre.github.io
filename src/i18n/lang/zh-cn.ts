import type { UIStrings } from "../types";

export default {
  nav: {
    home: "首页",
    posts: "文章",
    tags: "标签",
    about: "关于",
    archives: "归档",
    search: "搜索",
  },
  post: {
    publishedAt: "发布于",
    updatedAt: "更新于",
    sharePostIntro: "分享文章：",
    sharePostOn: "分享到 {{platform}}",
    sharePostViaEmail: "通过邮件分享",
    tagLabel: "标签",
    backToTop: "返回顶部",
    goBack: "返回",
    editPage: "编辑页面",
    previousPost: "上一篇",
    nextPost: "下一篇",
  },
  pagination: {
    prev: "上一页",
    next: "下一页",
    page: "第",
  },
  home: {
    socialLinks: "链接",
    featured: "精选",
    intro:
      "就是生活的全部",
    archivePrompt: "可以从最近文章开始，也可以直接看",
    archiveLink: "归档",
    archiveSuffix: "。",
    recentPosts: "最近文章",
    allPosts: "全部文章",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  pages: {
    tagTitle: "标签",
    tagDesc: "所有带有该标签的文章",

    tagsTitle: "标签",
    tagsDesc: "文章中使用过的全部标签。",

    postsTitle: "文章",
    postsDesc: "全部文章列表。",

    archivesTitle: "归档",
    archivesDesc: "按时间归档的全部文章。",

    searchTitle: "搜索",
    searchDesc: "搜索文章...",
  },
  a11y: {
    skipToContent: "跳到正文",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    switchToChinese: "切换到中文",
    switchToEnglish: "切换到英文",
    toggleTheme: "切换主题",
    searchPlaceholder: "搜索文章...",
    noResults: "没有找到结果",
    goToPreviousPage: "前往上一页",
    goToNextPage: "前往下一页",
  },
  notFound: {
    title: "404 Not Found",
    message: "页面不存在",
    goHome: "返回首页",
  },
} satisfies UIStrings;
