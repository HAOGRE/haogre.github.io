import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import satori from "satori";
import sharp from "sharp";
import { getPostSlug } from "@/utils/getPostPaths";
import config from "@/config";

const require = createRequire(import.meta.url);
const regularFontPath =
  require.resolve("@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff");
const boldFontPath =
  require.resolve("@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff");

export async function getDynamicOgImagePaths(locale: "zh-cn" | "en") {
  if (!config.features.dynamicOgImage) {
    return [];
  }

  const allPosts = await getCollection("posts");
  const englishTranslationKeys = new Set(
    allPosts
      .filter(({ data }) => data.lang === "en" && data.translationKey)
      .map(({ data }) => data.translationKey)
  );
  const posts = allPosts.filter(({ data }) => {
    const isVisible = !data.draft && !data.ogImage;
    if (!isVisible) return false;

    if (locale === "en") {
      return (
        data.lang === "en" ||
        !(
          data.translationKey && englishTranslationKeys.has(data.translationKey)
        )
      );
    }

    return data.lang !== "en";
  });

  return posts.map(post => ({
    params: { slug: getPostSlug(post.id, post.filePath) },
    props: post,
  }));
}

export async function getStaticPaths() {
  return getDynamicOgImagePaths("zh-cn");
}

export const GET: APIRoute = async ({ props }) => {
  if (!config.features.dynamicOgImage) {
    return new Response(null, { status: 404, statusText: "Not found" });
  }

  const limit = (value: string, max: number) =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value;
  const title = limit(props.data.title, 48);
  const description = limit(props.data.description, 112);
  const language = props.data.lang === "en" ? "ENGLISH ARTICLE" : "中文文章";
  const tags = props.data.tags.slice(0, 3).join("  ·  ");

  const [regularData, boldData] = await Promise.all([
    readFile(regularFontPath),
    readFile(boldFontPath),
  ]);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          background: "#f7f7f2",
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 42,
                right: 42,
                width: 112,
                height: 112,
                border: "4px solid #111",
                background: "#dbe8ff",
                transform: "rotate(12deg)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 28,
                right: 28,
                bottom: 28,
                left: 28,
                border: "4px solid #111",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                padding: "54px 62px 42px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            color: "#2f64d6",
                            fontSize: 24,
                            fontWeight: "bold",
                            letterSpacing: 2,
                          },
                          children: language,
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            color: "#555",
                            fontSize: 24,
                            fontWeight: "bold",
                          },
                          children: config.site.title,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      marginTop: 44,
                      maxWidth: "92%",
                    },
                    children: [
                      {
                        type: "p",
                        props: {
                          style: {
                            color: "#111",
                            fontSize: 64,
                            fontWeight: "bold",
                            lineHeight: 1.14,
                            margin: 0,
                            maxHeight: 170,
                            overflow: "hidden",
                          },
                          children: title,
                        },
                      },
                      {
                        type: "p",
                        props: {
                          style: {
                            color: "#555",
                            fontSize: 25,
                            lineHeight: 1.35,
                            margin: "28px 0 0",
                            maxHeight: 72,
                            overflow: "hidden",
                          },
                          children: description,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "2px solid #ddd",
                      marginTop: "auto",
                      paddingTop: 22,
                      width: "100%",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            color: "#777",
                            fontSize: 22,
                            overflow: "hidden",
                          },
                          children: tags,
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            color: "#111",
                            fontSize: 24,
                            fontWeight: "bold",
                          },
                          children: `by ${props.data.author}`,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: [
        {
          name: "Noto Sans SC",
          data: regularData,
          weight: 400,
          style: "normal",
        },
        {
          name: "Noto Sans SC",
          data: boldData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: { "Content-Type": "image/png" },
  });
};
