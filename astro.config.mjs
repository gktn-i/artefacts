import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://bib.gktn.dev",
  // `file` erzeugt koch-basics.html statt koch-basics/index.html —
  // damit bleiben alle bisherigen URLs exakt gültig.
  build: { format: "file" },
});
