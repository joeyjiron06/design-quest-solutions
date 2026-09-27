// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // GitHub Pages serves this project from
  // https://www.joeyjiron.com/design-quest-solutions/
  //
  // The origin is the custom domain on the joeyjiron06 Pages account, not
  // joeyjiron06.github.io - that host 301-redirects here.
  //
  // `site` is the origin, `base` is the sub-path. CI overrides both via
  // `--site` / `--base` (see .github/workflows/astro.yml), so these values
  // exist to keep local `astro build` + `astro preview` identical to prod.
  //
  // Note: with `base` set, `astro dev` serves at
  // http://localhost:4321/design-quest-solutions/ instead of `/`.
  site: "https://www.joeyjiron.com",
  base: "/design-quest-solutions",
  vite: {
    plugins: [tailwindcss()],
  },
});
