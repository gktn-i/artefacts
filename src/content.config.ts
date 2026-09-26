/* ============================================================================
   Keine Content Collections: src/content/<modul>/ enthält .astro-Abschnitte,
   die [slug].astro direkt per import.meta.glob lädt. Astro 5 legt für jeden
   Ordner dort sonst eine Legacy-Collection an und warnt beim Build pro Modul,
   dass keine .md-Dateien darin liegen. Eine Collection mit eigenem (leerem)
   Loader schaltet diese Automatik ab.
   ========================================================================== */
import { defineCollection } from "astro:content";

export const collections = {
  keine: defineCollection({ loader: () => [] }),
};
