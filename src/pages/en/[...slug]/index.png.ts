import type { APIRoute } from "astro";
import {
  GET as getOgImage,
  getDynamicOgImagePaths,
} from "../../[...slug]/index.png";

export async function getStaticPaths() {
  return getDynamicOgImagePaths("en");
}

export const GET: APIRoute = getOgImage;
