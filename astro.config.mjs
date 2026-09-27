// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // GitHub Pages serves this project from
  // https://joeyjiron06.github.io/design-quest-solutions/
  //
  // `site` is the origin, `base` is the sub-path. CI overrides both via
  // `--site` / `--base` (see .github/workflows/astro.yml), so these values
  // exist to keep local `astro build` + `astro preview` identical to prod.
  //
  // Note: with `base` set, `astro dev` serves at
  // http://localhost:4321/design-quest-solutions/ instead of `/`.
  site: "https://joeyjiron06.github.io",
  base: "/design-quest-solutions",
  vite: {
    plugins: [tailwindcss()],
  },
});
