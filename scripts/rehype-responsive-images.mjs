import { optimizeImage } from "./image-optimizer.mjs";

export default function responsiveImages({ publicDir } = {}) {
  return async tree => {
    const images = [];
    function walk(node) {
      if (node.type === "element" && node.tagName === "img") images.push(node);
      for (const child of node.children ?? []) walk(child);
    }
    walk(tree);

    // Sequential per document; the optimizer shares in-flight work across locales.
    for (const [index, image] of images.entries()) {
      const props = (image.properties ??= {});
      props.loading ??= index === 0 ? "eager" : "lazy";
      props.decoding ??= "async";
      const src = props.src;
      if (typeof src !== "string") continue;
      const optimized = await optimizeImage(src, publicDir);
      if (!optimized) continue;
      const { width, height, variants } = optimized;
      // Explicitly sized HTML images keep their intended display size.
      const displayWidth = Math.min(Number(props.width) || width, 736);
      props.width ??= width;
      props.height ??= Math.round((Number(props.width) * height) / width);
      if (!props.srcSet) {
        props.src = variants.at(-1).src;
        props.srcSet = variants.map(v => `${v.src} ${v.width}w`).join(", ");
        props.sizes ??= `(max-width: ${displayWidth + 32}px) calc(100vw - 2rem), ${displayWidth}px`;
      }
    }
  };
}
