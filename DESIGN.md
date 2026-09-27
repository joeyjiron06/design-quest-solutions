# Design — Design Quest Solutions

**Purpose:** how the site should look, move and feel. Read this before building or changing any UI.

**Companions:** [`docs/Branding.md`](./docs/Branding.md) for words and claims.
[`src/global.css`](./src/global.css) for the tokens. This file explains the intent behind them.

---

## 1. The three feelings

In priority order. Every design decision should serve #1 first.

### 1. Luxurious

The brand should read as a premium service and extremely high-quality, like a luxury brand.
People should think *wow, this is amazing and beautiful.*

### 2. Woman-owned

Carried by the palette: maroon for the dark background, yellow for the accent.
This is a visual signal only — see [Boundaries](#7-boundaries).

### 3. Engineering designs

The UI should scream engineering drawings. People should come away thinking the company is
highly technical, that these are industry experts with a lot of experience. That comes from the
language and the assets on the page, not from decoration.

---

## 2. Colour

Use theme tokens only. Never introduce a colour outside [`src/global.css`](./src/global.css).

| Role | Token | Notes |
|---|---|---|
| Dark sections | `bg-background` inside `.dark` | Oxblood maroon `#381921`. The woman-owned signal. |
| Light sections | `bg-background` (default) | Warm paper. The default for most of the page. |
| Accent | `text-accent` / `bg-accent` | Brass-yellow. Use sparingly: rules, keylines, one CTA, small marks. |
| Body and headings | `text-foreground`, `text-muted-foreground` | |
| Lines and borders | `border-border` | Hairlines are the main structural device. |

**Rules**

- Alternate light and dark sections. Dark is an accent rhythm, not the whole page.
- Accent is a highlight, never a fill for large areas. Gold everywhere stops reading as gold.
- `--radius` is `0rem`. Square corners. Do not round things.

---

## 3. Typography

| Use | Token | Why |
|---|---|---|
| Headings | `font-serif` (Playfair Display) | The luxurious feel. |
| Body and UI | `font-sans` (Inter) | Calm and readable. |
| Technical marks | `font-mono` (JetBrains Mono) | Dimensions, callouts, labels, numbering — the drawing voice. |

**Rules**

- Serif headings get room. Generous line height and space above and below.
- Small caps, wide tracking (`tracking-widest`) and mono for eyebrows and labels, like a title block.
- Never set body copy in serif.

---

## 4. Motion

Animations should feel premium: fade-ins and very smooth curves, but not so slow that the site
feels slow.

| Type | Duration | Easing |
|---|---|---|
| Hover, focus, colour change | 200ms | `ease-out` |
| Reveal on scroll, fade-in, fade-up | 400–600ms | `ease-out` / custom smooth curve |
| Large or staged sequences | 600–800ms max, 60–100ms stagger | `ease-out` |

**Rules**

- Fade and small translate (8–16px). No bounce, no spring, no slide-in from off-screen.
- Animate `opacity` and `transform` only. Nothing that triggers layout.
- One thing moves at a time. Nothing loops or pulses for attention.
- Everything must respect `prefers-reduced-motion`.

---

## 5. Assets and imagery

Take inspiration from CAD drawings, Revit models, 3D wire diagrams and dimensions — anything that
reminds people of HVAC and plumbing engineering drawings.

**Use**

- Wireframe and isometric line geometry — ducts, pipe runs, fittings, equipment.
- Drawing furniture: dimension lines with arrowheads, leader lines and callout bubbles, grid
  bubbles, section marks, title blocks, revision clouds, sheet numbers.
- Faint drafting grids and hairline rules as background structure.
- Line weight hierarchy, the way a real sheet does it.

**Avoid**

- Stock photos of hard hats, handshakes, skylines or generic offices.
- Generic tech visuals: glowing nodes, circuit patterns, abstract 3D blobs.
- Icon sets that could belong to any SaaS company.
- Anything ornamental that a drafter would not recognise.

---

## 6. Layout

- Structure the page like a drawing sheet: strong margins, hairline dividers, aligned columns.
- Whitespace is the luxury signal. When in doubt, add space before adding anything else.
- Label sections like sheet content — eyebrows, numbering, mono metadata.
- Alignment must be exact. On an engineering site, a misaligned edge reads as incompetence.

---

## 7. Boundaries

- **Woman-owned is visual here, not verbal.** The palette carries it. In copy it stays supporting
  cast and never becomes a headline. See `docs/Branding.md` §2, Pillar 4.
- **Language carries the expertise.** Assets set the tone; the words do the proving. Follow the
  voice and vocabulary rules in `docs/Branding.md` §3–4.
- **No new tokens.** If something cannot be built from the theme, raise it instead of inventing
  a value.

---

## 8. Checklist before shipping UI

- [ ] Every colour comes from the theme.
- [ ] Headings serif, body sans, technical marks mono.
- [ ] Square corners.
- [ ] Transitions 200ms; reveals 400–600ms; fade and small translate only.
- [ ] `prefers-reduced-motion` handled.
- [ ] Imagery is drafting-derived, not stock or generic tech.
- [ ] Accent used sparingly.
- [ ] Contrast meets WCAG AA in both palettes.
