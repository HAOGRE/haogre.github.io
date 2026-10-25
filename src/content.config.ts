import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";

function imageAwareGlob(options: Parameters<typeof glob>[0]) {
  const loader = glob(options);
  const load = loader.load;
  loader.load = async context => {
    // Public uploads aren't part of Astro's Markdown digest. Re-render on startup
    // so replaced originals or a deleted image cache cannot leave stale srcsets.
    // The image optimizer still reuses its disk cache for unchanged pixels.
    context.store.clear();
    await load(context);
  };
  return loader;
}

const posts = defineCollection({
  loader: imageAwareGlob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${BLOG_PATH}`,
  }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      lang: z.enum(["zh-cn", "en"]).optional(),
      translationKey: z.string().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: imageAwareGlob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/pages",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

export const collections = { posts, pages };
