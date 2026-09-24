# Landing Page Outline — Design Quest Solutions

**Purpose:** define every section on the home page, in order, with its job, its content
requirements and its layout. This is the structural brief the copywriting session works from.

**Status:** draft, 2026-09-23. Structure approved. Copy not written.

**Built from:** [`docs/About.md`](../About.md), [`docs/Branding.md`](../Branding.md),
[`docs/marketing/user-voice.md`](../marketing/user-voice.md),
[`docs/marketing/competitors.md`](../marketing/competitors.md).

**Next step:** `docs/plans/landing-page-copy.md` — finished headlines and body copy, written
section by section against this outline.

### What this document covers

Section inventory, page order, the emotional journey, what each section must contain, layout
structure, calls to action, and the brand rules that constrain each section.

### What it does not cover

- **Finished copy.** No headlines or body text are chosen here. Candidates are listed as options
  to test.
- **Visual identity.** Colours, typography and imagery are a separate decision. Styling must use
  the existing theme in [`src/global.css`](../../src/global.css).

---

## 1. Decisions locked before this outline

| Decision | Setting |
|---|---|
| Page count | One page. Every navigation link is a same-page anchor. |
| Primary action | Email. "Request a quote." |
| Contact address | `rickjiron@gmail.com`, hardcoded. See [Section 8](#8-open-items-and-launch-blockers). |
| Pricing on page | None. Quote on request only. |
| Response-time promise | None. No number is published until one is decided. |
| Autodesk and software logos | None. DQS is a user, not a partner. Displaying the marks would imply a relationship that does not exist. |
| Certification badges | None. No WBENC, California SB or City of LA badge until held. |
| Testimonials | **Cut.** No verified client quotes exist. |
| Client or partner logos | **Cut.** DQS cannot name a client. |
| Risk-reversal offer (paid pilot) | **Cut.** Not an agreed commercial offer yet. |
| Statistics section | **Cut as a metrics block.** Replaced by a credentials strip using only approved facts. |

---

## 2. The journey

The page moves the reader through six states. Every section belongs to one of them. If a proposed
section does not serve a state, it does not belong on the page.

| Order | State | Reader is thinking | Sections |
|---|---|---|---|
| 1 | Recognition | "This firm does the specific thing I need." | Navbar, Hero |
| 2 | Credibility | "These are not amateurs." | Credentials |
| 3 | Pain | "They know exactly what went wrong last time." | The problem |
| 4 | Relief | "There is a way this goes differently." | How it works, Benefits, Why DQS |
| 5 | Scrutiny | "Prove you actually know this trade." | Features, Code and jurisdiction |
| 6 | Action | "I will send them the markups." | Switching vendors, About, FAQ, Final CTA |

The page runs plain on the surface and technical underneath, per `Branding.md` §3. Sections 1
through 7 must be understandable by a design-build principal with no Revit vocabulary. Sections 8
and 9 are where DQS proves it is not a marketing shell, and full trade language belongs there.

---

## 3. Section inventory

Fourteen sections, in page order.

| # | Section | Anchor | State | CTA |
|---|---|---|---|---|
| 1 | Navbar | — | Recognition | Primary button |
| 2 | Hero | `#top` | Recognition | Primary + secondary |
| 3 | Credentials | `#credentials` | Credibility | None |
| 4 | The problem | `#problem` | Pain | None |
| 5 | How it works | `#process` | Relief | None |
| 6 | Benefits | `#benefits` | Relief | None |
| 7 | Why DQS | `#why` | Relief | Text link |
| 8 | What is in the model | `#model` | Scrutiny | None |
| 9 | Code and jurisdiction | `#code` | Scrutiny | None |
| 10 | Switching vendors | `#switching` | Action | Primary button |
| 11 | About the owners | `#about` | Action | None |
| 12 | FAQ | `#faq` | Action | Text link |
| 13 | Final CTA | `#contact` | Action | Primary button |
| 14 | Footer | — | — | Email link |

---

## 4. Section specifications

### 4.1 Navbar

**Job:** orient the reader and keep the primary action reachable at every scroll position.

**Contains**

- Wordmark: **Design Quest Solutions**. The existing "RevitDraft" mark is retired.
- Links: Services (`#process`), Expertise (`#model`), Code (`#code`), About (`#about`),
  FAQ (`#faq`).
- Primary button: **Request a quote** → `mailto:`.

**Layout**

- Sticky, full width, subtle bottom border. The existing header in `src/pages/index.astro`
  already does this and can be kept.
- Desktop: wordmark left, links centre or right, button far right.
- Mobile below `md`: wordmark left, button right, links collapse into a hamburger panel.
  **The button never collapses into the menu.** It is the only conversion point above the fold
  on a phone.

**Brand rules**

- "BIM services" may appear in navigation. It must never appear in the hero headline
  (`Branding.md` Pillar 2, naming rule).

---

### 4.2 Hero

**Job:** the most important section on the page. Make a design-build GC recognise their own
problem and understand what DQS produces, within five seconds.

**Buyer:** design-build general contractor, priority 1.

**Emotion:** recognition, then relief that someone catches problems early.

**Contains**

| Element | Requirement |
|---|---|
| Headline | The transformation: problems found while they are still cheap to fix. Not a description of services. |
| Subhead | The mechanism, in plain language: DQS turns the engineer's PDF markups into a live, coordinated Revit model for HVAC and plumbing. |
| Location line | Depth in Los Angeles County, available across Southern California. Never a hard county boundary. |
| Primary CTA | **Request a quote** → `mailto:` |
| Secondary CTA | **See what we check** → `#code`. A low-commitment path for readers not ready to email. |
| Visual | `[PLACEHOLDER — hero visual]` Sanitised Revit model view, or a markup-to-model comparison. To be produced in a later session. |

**Layout**

- Two columns on desktop: copy left, visual right. Single column on mobile, copy first.
- Headline, subhead, then buttons. Location line sits under the buttons as a quiet fact, not a
  badge.
- No carousel, no video autoplay, no animation that delays the headline.

**Headline candidates to test** — from `user-voice.md` §9, none chosen

- "You have already paid twice for a Revit model. Not this time."
- "The model your GC will not rebuild."
- "Stop paying your best people to clean up someone else's model."
- "Modelled by people who know how it actually gets installed."
- Tagline as headline: "We find it before the city does."

**Brand rules**

- Plain language only. No LOD, BEP, workset or Navisworks vocabulary in this section.
- Name HVAC and plumbing separately. Never lead with "MEP BIM."
- Banned words: fast, quick turnaround, low cost, accurate, precise, high quality, cutting edge,
  seamless, solutions provider.
- No promise of permit approval. DQS does not stamp anything.
- The tagline carries more edge than the rest of the page. Use it once, here or in Section 4.9,
  not in both.

---

### 4.3 Credentials

**Job:** establish that DQS is a real firm with deep specialists, immediately after the hero and
before any argument is made.

**This is not a statistics section.** It carries only facts from `Branding.md` §6 "What DQS can
say today." No project counts, no square footage, no money-or-time-saved claims, no industry
rework percentages. Nothing gets added here later without evidence behind it.

**Contains — four items**

| Fact | Why it is here |
|---|---|
| Two owners, 25+ years each in HVAC and plumbing engineering | Depth. Also early Revit adopters, which can be folded into this item. |
| HVAC and plumbing only, commercial buildings | The specialty is the selling point, not a limitation. |
| An owner reviews every model before it leaves | Pillar 4. Say it exactly this way. Never "the owners build every model." |
| Work follows national CAD standards | Pillar 3. The usability promise. |

**Deliberately excluded from this strip**

| Fact | Where it goes instead |
|---|---|
| Up to five concurrent projects | FAQ, Section 4.12. As a headline number it reads as a capacity limit. As an answer to "can you handle our volume?" it reads as quality control. |
| Woman-owned | About and footer. Supporting cast, never the headline (`Branding.md` Pillar 4). |
| All staff US-based and living in LA | Section 4.7, stated as a plain fact. A competitor already owns "local, no offshoring," so DQS wins on what it knows, not where it sits. |

**Layout**

- Horizontal strip directly under the hero. Four columns on desktop, two on tablet, stacked on
  mobile.
- Short label plus one clarifying line each. No icons that turn this into decoration.

---

### 4.4 The problem

**Job:** prove DQS understands what went wrong on the reader's last project, before selling
anything.

**Buyer:** all three, but written for the GC.

**Emotion:** recognition, then mild frustration recalled. Not alarm.

**Contains**

Three or four failure modes drawn from `user-voice.md` §4, paraphrased. The strongest for this
audience:

1. The cheap model costs more than doing it yourself — senior staff hours spent fixing it.
2. The modeller does not understand how buildings go together — unbuildable results.
3. Revisions loop forever, and the time zone makes it worse.
4. Nobody owns quality, so the client becomes the QA department.

**Layout**

- Section intro of one or two lines, then three or four short blocks.
- Consider a single pull quote treatment for the strongest line.

**Brand rules — important**

- **No direct quotes from forum users.** `user-voice.md` §11 requires verification before
  publishing, several sources contain profanity, and anonymous quotes read as weak proof on a
  commercial site. Paraphrase as "what we hear from architects and GCs."
- **Neutral contrast only.** Describe the buyer's experience. Never name offshore outsourcing as
  a villain. Some prospects use offshore vendors, and some GCs outsource themselves.
- Direct about the problem, never alarmist.

---

### 4.5 How it works

**Job:** remove uncertainty about the engagement. Show the path from what the reader already has
to what they get.

**Contains — three or four steps**

1. You send the engineer's markups, usually as PDFs.
2. DQS models HVAC and plumbing in Revit, inside your template and standards.
3. DQS reports what it finds — code, clash and constructability issues — as an issue list, rather
   than quietly modelling around them.
4. An owner reviews the model before delivery.

**Layout**

- Numbered horizontal steps on desktop, vertical on mobile.
- Each step: short label, one or two sentences.

**Brand rules**

- Plain language. The technical proof comes later, in Sections 4.8 and 4.9.
- Step 3 is Pillar 1 and the core idea of the whole brand. Give it the most weight.
- Keep the boundary explicit somewhere on the page: DQS models, the engineer stamps.

---

### 4.6 Benefits

**Job:** state the outcome the buyer gets, and name the specific practice that produces it.

**Structure:** every block is **outcome as the headline, mechanism as the subhead**. This is the
difference between this section and Section 4.8.

**Contains — four blocks**

| Outcome | Produced by |
|---|---|
| Problems surface while they are still cheap to fix | Code and clash checking during modelling, reported as an issue list, not after the fact |
| Your senior staff stop working as the QA department | An owner reviews every model before delivery |
| The next discipline can open the model and work in it | National CAD standards, worksets, family naming, view templates, browser organisation |
| Capacity without adding payroll | A small vetted LA team, same people each time, same time zone, questions answered the same day |

**Layout**

- Two-by-two grid on desktop, stacked on mobile.

**Brand rules — important**

- **No quantified benefits.** "Save X hours a day," "cut RFIs by X%," and any money-saved figure
  are banned by `Branding.md` §6 until evidence exists. Write the outcome qualitatively and
  specifically instead.
- **No response-time number.** "Same day" may describe availability, but no commitment is stated
  as a number until one is decided.
- Do not use "high quality," "meticulous" or "precise" on their own. Show what they mean.

---

### 4.7 Why DQS

**Job:** the differentiation section. Answer "why not the firm we used last time" without naming
anyone.

**Contains — the four pillars, in order**

1. **We find problems before submittal.** Name the specific code or check. No competitor reviewed
   claims this ground.
2. **HVAC and plumbing, all day, for 25 years.** Two disciplines only, since the early days of
   Revit.
3. **A model your team can actually use.** National CAD standards, concrete specifics.
4. **Real people, here.** Two owners with 25+ years each, a vetted Los Angeles team, and an owner
   reviews every model before it leaves.

**Layout**

- Four alternating rows, or a four-item list with the first given more weight. Pillar 1 leads and
  should look like it leads.

**Contains — supporting facts placed here**

- All production staff are US-based and live in Los Angeles. State it as a plain fact inside
  Pillar 4. Not a slogan, not a badge.

**CTA:** text link to `#code` — "See what we check."

**Brand rules**

- Frame every comparison around the buyer's experience, not a competitor's location.
- Never say the owners build or touch every model. DQS works with subcontractors. The review is
  the promise.

---

### 4.8 What is in the model

**Job:** prove technical depth to the VDC manager, the MEP engineer and anyone who will actually
open the file. This is the section that separates DQS from a marketing shell.

**Buyer:** MEP engineer of record and VDC manager.

**Depth:** full trade vocabulary. This is where it belongs.

**Contains — feature list, grouped**

| Group | Items |
|---|---|
| Model structure | Worksets, family naming conventions, view templates, browser organisation, hosting, warning count management |
| Systems modelled | Ductwork and equipment, hydronic and refrigerant piping, domestic water, sanitary and vent, gas, real fittings rather than placeholders |
| Coordination | Clash workflow, hanger and service clearances, equipment connections, maintenance access, ceiling space coordination |
| Working with your team | Modelling inside your template and standards, BIM Execution Plan adherence, agreed LOD, issue list delivered with the model |

**Layout**

- Grouped columns or an accordion. Dense is acceptable here; the reader who reaches this section
  wants detail.

**Brand rules**

- Specifics are the proof. Adjectives are not.
- Do not refer to "our QA process" as a named noun until the checklist is written down
  (`Branding.md` §6).

---

### 4.9 Code and jurisdiction

**Job:** own the empty ground. No competitor reviewed named Title 24, the California Mechanical
Code, the California Plumbing Code or LADBS plan check. Not one.

**Contains**

- The specific codes DQS checks against: Title 24, California Mechanical Code, California
  Plumbing Code.
- LADBS plan check and its published standard corrections lists.
- What DQS flags while modelling: clearances, accessibility, ventilation, routing conflicts,
  equipment access.
- Geography: depth in LA County, available across Southern California.
- **The boundary, stated plainly:** DQS models and flags issues. The engineer of record stamps.
  DQS does not guarantee permit approval and does not certify anything.

**Layout**

- Named code list plus a short "what we flag" list. Consider a link to the LADBS standard
  corrections list as an outbound credibility signal.

**Brand rules**

- This is Pillar 1 made concrete. Name the specific code every time. Vague accuracy claims sound
  like everyone else.
- The boundary sentence is not optional. It protects DQS and it builds trust with engineers.

---

### 4.10 Switching vendors

**Job:** catch the reader at the switching moment. `user-voice.md` §5.4 shows the trigger is a
blown deadline, a scope argument, or silence. A section aimed at that exact moment will
outperform a general services block.

**Contains**

- One question doing most of the work: *How many hours did your team spend fixing the last model
  you received?*
- Two or three short lines on what changes: the same people each time, questions answered in your
  time zone, problems flagged rather than buried.
- **Primary CTA: Request a quote** → `mailto:`.

**Layout**

- Full-width band with contrasting background. Short. This section should feel like a direct
  address, not a pitch.

**Brand rules**

- Requires no data, so it is publishable today.
- Still neutral contrast. Ask the question, do not insult the incumbent.

---

### 4.11 About the owners

**Job:** put names and faces on the firm. `competitors.md` Gap 5 found almost no competitor names
a single person. This is one of the cheapest advantages on the page.

**Contains**

| Element | Status |
|---|---|
| Owner 1 name, role, background | `[PLACEHOLDER — owner name and bio]` |
| Owner 2 name, role, background | `[PLACEHOLDER — owner name and bio]` |
| Owner photographs | `[PLACEHOLDER — headshots]` To be produced in a later session. |
| 25+ years each, early Revit adopters | Approved fact |
| Woman-owned business | Approved fact. Placed here, not in the hero and not in the credentials strip. |
| Los Angeles based team | Approved fact, stated plainly |

**Layout**

- Two portraits side by side with short bios. Stacked on mobile.
- Real photographs only. No stock imagery of people. Stock photos on an About section destroy the
  exact credibility this section exists to build.

**Brand rules**

- Woman-owned is supporting cast. It matters as a tiebreaker on public work with participation
  goals. Led with, it starts a credentials comparison DQS currently loses.
- Do not apologise for being small. State the size and make it the benefit.

---

### 4.12 FAQ

**Job:** answer the four objections and close the remaining gaps in one scannable place. Also the
most forwardable section on the page, which matters because referral readers are often not the
buyer.

**Contains — the four objections from `Branding.md` §6**

| Question | Answer direction |
|---|---|
| "You cost more than an offshore team." | Compare total cost, never hourly rate. A cheap model that needs senior staff hours to fix costs more than a clean one. Never discount to match. |
| "Can you handle our volume?" | Be exact. DQS runs up to five concurrent projects with a vetted LA team, and an owner reviews every model before delivery. Quality does not vary by who got assigned. |
| "How do I know the quality is real?" | Answer with process and people, not with a pilot offer. The pilot is not an agreed offer yet. |
| "We already have a vendor." | Point back to Section 4.10 and the one question. |

**Contains — scope and boundary questions**

- What disciplines do you model? HVAC and plumbing only. No architectural, structural or
  electrical.
- Do you do scan-to-BIM or as-builts? No. That is a different market.
- Do you stamp drawings? No. DQS models. The engineer of record stamps.
- What do you need to start? The engineer's markups, your template and standards, and the project
  scope.
- Where do you work? Depth in LA County, available across Southern California.
- Will you work inside our template? Yes.

**Layout**

- Accordion. All questions visible when collapsed so the list is scannable.

**Brand rules**

- No response-time answer stated as a number.
- No certification claims.
- Full trade vocabulary is allowed here.

---

### 4.13 Final CTA

**Job:** convert. Single action, no competing choices.

**Contains**

- Short restatement of the core idea: problems found early cost almost nothing, problems found
  late cost a fortune.
- **Primary CTA: Request a quote** → `mailto:rickjiron@gmail.com`
- **Intake prompt.** There is no form, so the copy must do the form's job. Tell the reader what to
  include: project type, size, the markup set, the target submittal date, and the Revit version
  and template.
- Visible email address as text, so a reader on a machine with no mail client configured can still
  copy it.

**Layout**

- Full-width band, centred, high contrast. Nothing else competing in this section.

**Implementation notes**

- Prefill the subject line so inbound mail is sortable:
  `mailto:rickjiron@gmail.com?subject=Project%20inquiry%20—%20[company]`
- A raw `mailto:` will be scraped by spam bots. Consider light obfuscation or a
  `data-user`/`data-domain` attribute assembled in script, and accept that it fails without
  JavaScript.

---

### 4.14 Footer

**Contains**

- Design Quest Solutions, full name.
- Email, shown as text.
- Service area line: Los Angeles County, serving Southern California.
- Woman-owned business line.
- Disciplines line: HVAC and plumbing Revit modelling for commercial buildings.
- Anchor links repeating the navigation.
- Copyright.

**Layout**

- Simple multi-column, collapsing to stacked on mobile.

---

## 5. Rules that apply to every section

From `Branding.md` §3. These are the standing constraints for the copy session.

1. **Lead with the point.** First sentence, every time.
2. **Short sentences.** Twenty words or fewer.
3. **Active voice.** "We check the model," not "the model is checked."
4. **Name the specific thing.** A code, a check, a failure mode, a system.
5. **No unbacked numbers.** Nothing from the `Branding.md` §6 forbidden list reaches the page.
6. **Company name.** "Design Quest Solutions" on first mention, "DQS" afterwards. Never abbreviate
   in a headline where the reader meets the company for the first time.
7. **Service naming.** "HVAC and plumbing Revit modelling" in headlines. "BIM services" in
   navigation and search terms only.
8. **Neutral contrast.** Describe the buyer's experience. Never name a villain.
9. **Depth rule.** Sections 4.1 to 4.7 stay plain. Sections 4.8, 4.9 and 4.12 carry full trade
   vocabulary.

---

## 6. Asset placeholders

Nothing below exists yet. Each one needs a later session.

| Asset | Used in | Notes |
|---|---|---|
| Hero visual | 4.2 | Sanitised Revit view or markup-to-model comparison. The strongest option is a real model the reader could imagine opening. |
| Owner names and bios | 4.11 | Two owners. |
| Owner headshots | 4.11 | Real photographs. No stock imagery of people. |
| Model screenshots | 4.8 | Browser organisation and a coordinated view would both work. |
| Logo and wordmark | 4.1, 4.14 | The current compass icon in `src/pages/index.astro` may be reused as a placeholder. |

---

## 7. Fix in the existing page before building

Both are in [`src/pages/index.astro`](../../src/pages/index.astro).

| Problem | Fix |
|---|---|
| Nav wordmark reads "RevitDraft" | Replace with Design Quest Solutions. `Branding.md` §4 retires this name. |
| `<title>` reads "Revit Drafting Consultants" | Replace with a title carrying the company name and the specialty. |

Styling must use only the values in [`src/global.css`](../../src/global.css). No new colours.

---

## 8. Open items and launch blockers

### Accepted risk — the contact address

`rickjiron@gmail.com` is hardcoded by decision. Two risks were raised and accepted:

1. A free Gmail domain weakens a premium specialist position for a design-build GC who is vetting
   vendors. It is the one place on the page where "not the cheapest" becomes hard to believe.
2. The brand is woman-owned with two owners, and the published contact is a personal address in a
   different name. A reader who notices will ask who runs the firm.

**Recommended before launch, not blocking this outline:** forward a domain address such as
`info@designquestsolutions.com` to the same inbox. The page needs no other change.

### Known gap — no third-party proof

With testimonials, client logos and the pilot offer removed, nothing on the page comes from
outside DQS. This is the correct call under `Branding.md` §6, and it is a real conversion cost.
It closes only when the proof in §6 of that document is gathered, in this order:

1. Write the QA checklist.
2. Prepare a sanitised sample model a prospect can open.
3. Interview three past clients.
4. Write up two or three real catches.

### Still undecided

- Response-time commitment. Until set, no number appears anywhere on the page.
- Certification paperwork. No badge appears until held.
- Visual identity has not been reviewed against the brand.
