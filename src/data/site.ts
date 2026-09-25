/**
 * Shared site constants.
 *
 * Only values that appear in more than one place live here. Prose stays in the
 * section component that renders it.
 *
 * Source of truth: docs/plans/landing-page-copy.md
 * The CTA wording must stay identical everywhere it appears (copy doc, §13).
 */

export const site = {
  brand: "Design Quest Solutions",
  email: "rickjiron@gmail.com",

  /** Subject prefill keeps the inbox sortable (copy doc §2 and §13). */
  quoteHref: "mailto:rickjiron@gmail.com?subject=Project%20inquiry",

  cta: {
    primary: "Request a Quote",
    secondary: "See What We Check",
    secondaryHref: "#code",
  },

  /** Copy doc §1. "About" was removed when §11 was cut. */
  nav: [
    { label: "How It Works", href: "#process" },
    { label: "What We Model", href: "#model" },
    { label: "Code Checks", href: "#code" },
    { label: "FAQ", href: "#faq" },
  ],

  /** Copy doc §3. Full supporting lines, for the Credentials section. */
  credentials: [
    {
      label: "25+ Years, Each",
      note: "Two owners, both with more than 25 years in HVAC and plumbing engineering. Early adopters of Revit, not late converts.",
    },
    {
      label: "HVAC & Plumbing",
      note: "Commercial buildings. No architectural, no structural, no electrical, so our attention never splits.",
    },
    {
      label: "Owner-Reviewed",
      note: "An owner reviews every model before it leaves. Quality doesn't vary by who got assigned.",
    },
    {
      label: "National CAD Standards",
      note: "Worksets, naming, view templates, browser organization. The next person can open it and work.",
    },
  ],

  /**
   * Hero title block. The same approved facts as `credentials`, shortened to
   * fit the drawing-sheet cells. No invented drawing metadata: no sheet
   * number, no revision letter, no date.
   */
  titleBlock: [
    { label: "Discipline", value: "HVAC & Plumbing" },
    { label: "Scope", value: "Commercial buildings" },
    { label: "Region", value: "Los Angeles County" },
    { label: "Experience", value: "25+ years, each" },
    { label: "Review", value: "Owner-reviewed" },
    { label: "Standards", value: "National CAD Standards" },
  ],
} as const;
