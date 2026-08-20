import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://bib.gktn.dev",
  // `file` erzeugt koch-basics.html statt koch-basics/index.html —
  // damit bleiben alle bisherigen URLs exakt gültig.
  build: { format: "file" },
  // Links werden beim Überfahren vorgeladen — Seitenwechsel fühlen sich
  // wie Panelwechsel innerhalb der Werkbank an.
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
});
