# Landing Page Copy — Design Quest Solutions

**Purpose:** the finished, paste-ready copy for every section of the home page.

**Status:** in progress, 2026-09-23. Written section by section and approved as it goes.

**Structure defined by:** [`docs/plans/landing-page-outline.md`](./landing-page-outline.md)

**Voice defined by:** [`docs/Branding.md`](../Branding.md)

### Conventions

- **US English.** "Modeling", not "modelling". `Branding.md` is written in British English, but the
  audience is Los Angeles, and "BIM modeling services" is the search term people type.
- **Company name.** Design Quest Solutions on first mention, DQS afterward. Never abbreviated in a
  headline where a reader meets the company for the first time.
- **Placeholders** are marked `[PLACEHOLDER — ...]` and need a later session.

### Approval log

| Section | Status |
|---|---|
| 1. Navbar | ✅ Approved |
| 2. Hero | ✅ Approved |
| 3. Credentials | ✅ Approved |
| 4. The problem | ✅ Approved |
| 5. How it works | ✅ Approved |
| 6. Benefits | ✅ Approved |
| 7. Why DQS | ✅ Approved |
| 8. What is in the model | ✅ Approved |
| 9. Code and jurisdiction | ✅ Approved |
| 10. Switching vendors | ✅ Approved |
| 11. About the owners | ❌ Cut |
| 12. FAQ | ✅ Approved |
| 13. Final CTA | ✅ Approved |
| 14. Footer | ✅ Approved |

---

## 1. Navbar

**Anchor:** none. **State:** recognition. **CTA:** primary button.

### Page chrome

**Title tag** — 54 characters

```
HVAC & Plumbing Revit Modeling | Design Quest Solutions
```

**Meta description** — 147 characters

```
We turn your engineer's markups into coordinated HVAC and plumbing Revit models, and flag the code and clash problems before they reach plan check.
```

### Visible copy

| Element | Copy | Target |
|---|---|---|
| Wordmark | Design Quest Solutions | `#top` |
| Link 1 | How It Works | `#process` |
| Link 2 | What We Model | `#model` |
| Link 3 | Code Checks | `#code` |
| Link 4 | FAQ | `#faq` |
| Primary button | Request a Quote | `mailto:` |

### Behavior

- Sticky header, full width, subtle bottom border.
- Desktop: wordmark left, links center or right, button far right.
- Mobile below `md`: wordmark left, button right, the four links collapse into a hamburger panel.
- **The button never collapses into the menu.** It is the only conversion point above the fold on
  a phone.

### Rationale

**"What We Model" over "Services."** Brand rule 4 says name the specific thing. "Services" is the
most generic word in this market and every competitor uses it.

**"Code Checks" over "Code & Compliance."** Shorter, and it implies action rather than a policy
page.

**"Request a Quote" over "Contact Us."** The reader knows the commitment before clicking, and it
matches the actual offer. `Branding.md` allows no pricing on the page.

**Full wordmark, not "DQS."** `Branding.md` §4 forbids abbreviating where a reader meets the
company for the first time. If "Design Quest Solutions" plus the button wraps on narrow phones,
reduce the wordmark font size rather than shortening the name.

### Notes

- No phone number is published. Email is the only action.
- "BIM services" may appear in navigation and search terms. It must never appear in the hero
  headline (`Branding.md` Pillar 2, naming rule).

---

## 2. Hero

**Anchor:** `#top`. **State:** recognition. **Buyer:** design-build general contractor.
**CTA:** primary plus secondary.

### Copy

**Headline (H1)**

```
Revit Models That Find Problems Early
```

**Subhead**

```
Design Quest Solutions turns your engineer's markups into coordinated HVAC and plumbing Revit
models for commercial buildings, and flags the code and clash issues while they're still cheap
to change.
```

**Location line**

```
Los Angeles County specialists, working across Southern California.
```

**Buttons**

| Type | Copy | Target |
|---|---|---|
| Primary | Request a Quote | `mailto:rickjiron@gmail.com?subject=Project%20inquiry` |
| Secondary | See What We Check | `#code` |

**Visual:** `[PLACEHOLDER — hero visual]` Sanitized Revit model view, or a markup-to-model
comparison. To be produced in a later session.

### Layout

- Two columns on desktop: copy left, visual right. Single column on mobile, copy first.
- Order: headline, subhead, buttons, then the location line as a quiet fact beneath. Not a badge.
- No carousel, no autoplaying video, no animation that delays the headline.

### Rationale

**"Revit" over "BIM" in the headline.** Pillar 2 forbids "BIM" as the headline term because it is
the most generic phrase in this market. "Revit" is specific, and "Revit modeling Los Angeles" is
what people actually search.

**"Find Problems Early" is Pillar 1 stated as the product.** `competitors.md` found no competitor
claiming this ground. Everyone else sells drafting capacity.

**"commercial buildings" filters inbound.** It screens out residential inquiries before they reach
the inbox.

**"coordinated" and "cheap to change" are approved vocabulary.** Deliberately avoided: accurate,
precise, high quality, fast, quick turnaround, low cost, seamless, cutting edge.

**No permit promise.** DQS flags issues. It does not guarantee approval and does not stamp.

**Subject-line prefill** keeps the inbox sortable once inquiries arrive.

### Notes

- Rejected headline: **"BIM Models. Done Fast."** "Fast" and "low cost" are the offshore pitch and
  are banned by `Branding.md` §4. "BIM" as a headline term is banned by Pillar 2. No
  turnaround promise may be published until a response-time commitment is decided (§6).
- Rejected headline: **"Modeled by Engineers. Not Drafters."** It invites a reader to infer
  engineer-of-record or stamping authority. `Branding.md` says never blur that boundary.
- The tagline **"We find it before the city does"** is not used here. It is reserved for
  Section 9, Code and Jurisdiction.
- Alternate for later testing: "We Build Revit Models That Find Problems Early" puts a human back
  as the subject, which supports Pillar 4. Two words longer.

---

## 3. Credentials

**Anchor:** `#credentials`. **State:** credibility. **CTA:** none.

A fact strip, not a statistics section. Every item comes from `Branding.md` §6, "What DQS can say
today." Nothing may be added here without evidence behind it.

### Copy

| Label | Supporting line |
|---|---|
| **25+ Years, Each** | Two owners, both with more than 25 years in HVAC and plumbing engineering. Early adopters of Revit, not late converts. |
| **HVAC & Plumbing** | Commercial buildings. No architectural, no structural, no electrical, so our attention never splits. |
| **Owner-Reviewed** | An owner reviews every model before it leaves. Quality doesn't vary by who got assigned. |
| **National CAD Standards** | Worksets, naming, view templates, browser organization. The next person can open it and work. |

No section heading. A fact strip reads as more confident when it does not introduce itself.

### Layout

- Full-width band under the hero, visually distinct from it.
- Four columns on desktop, two on tablet, stacked on mobile.
- Bold label, one line beneath. **No icons.** Icons turn a credibility strip into decoration.

### Rationale

**"25+ years each," never "50+ combined years."** The arithmetic works, but combined-experience
figures are what padded agency sites publish, and a GC reads them that way. Stated separately it
sounds like depth.

**No decade named.** An earlier draft said "since the 1990s." Removed, because no one has verified
the start year and `Branding.md` §6 forbids unverified figures.

**The label names both disciplines.** Pillar 2 asks for HVAC and plumbing named separately and
often. The supporting line carries the exclusivity argument so the label stays clean.

### What is deliberately not here

| Fact | Where it goes |
|---|---|
| Up to five concurrent projects | Section 12, FAQ. As a headline number it reads as a capacity limit. As an answer to "can you handle our volume?" it reads as quality control. |
| Woman-owned | Section 11 and the footer. `Branding.md` Pillar 4 says supporting cast, never the headline. |
| US-based LA team | Section 7, inside Pillar 4, as a plain fact. A competitor already owns "local, no offshoring," so DQS wins on what it knows, not where it sits. |

---

## 4. The Problem

**Anchor:** `#problem`. **State:** pain. **Buyer:** written for the design-build GC.
**CTA:** none.

This section sells nothing. Its job is to make the reader think *these people have seen my last
project*. If it lands, everything after it is believed more easily.

### Copy

**Section headline**

```
Where outsourced models go wrong
```

**Intro line**

```
Most of the teams we talk to have been through at least one of these.
```

**Four blocks**

| Title | Body |
|---|---|
| **Your best people become the cleanup crew** | The model comes in under budget. Then your senior engineer spends the week fixing hosting, families and dimensions instead of designing. The savings didn't disappear. They moved onto your payroll. |
| **It's drawn, but it can't be built** | Pipe running through structure. No room for a hanger. Equipment with no service access. The geometry is right and the installation is impossible. |
| **The correction loop never closes** | You send redlines. The next version fixes two of them and breaks something else. Every round costs a day, and the question that would have prevented it never got asked. |
| **You become the QA department** | Nobody checked it before it reached you. So you check it, every system, every sheet. And you're still the one who finds the problem in the field. |

**Pull quote**

```
A cheap model is the most expensive thing you can buy.
```

**Closing transition into Section 5**

```
None of this is a Revit problem. It's a judgment problem.
```

### Layout

- Headline and intro line, then a two-by-two grid. Stacked on mobile.
- Pull quote gets its own treatment below the grid: larger type, accent color, generous space.
- The transition line sits last, quiet and small, leading into How It Works.

### Rationale

**No numbers.** An earlier draft said "six hours a week." Cut. `Branding.md` §6 bans unbacked
figures, and a GC spots an invented statistic immediately. Every block describes a situation
instead.

**No named villain in the body.** `user-voice.md` §4.5 complains about offshore time zones. It is
written here as "every round costs a day," which conveys the latency without naming a location.
Some prospects use offshore vendors today, and some GCs outsource themselves.

**No forum quotes.** `user-voice.md` §11 requires verification before publishing, several sources
contain profanity, and anonymous quotes read as weak proof. Everything here is paraphrased. The
pull quote is DQS's own line from §9.

**"They moved onto your payroll"** makes the total-cost argument from `Branding.md` §6 without
mentioning price. It answers "you cost more than an offshore team" before the objection is raised.

**"It's a judgment problem"** is the pivot for the whole page. `Branding.md`: *"This is not
drafting. It is engineering judgement applied while a model is being built."*

### Notes and open risks

- **The headline points at a category.** "Outsourced" is milder than "offshore," but DQS is itself
  an outsourced vendor, so a reader could hear it as self-indicting. The transition line resolves
  it: the problem is judgment, not outsourcing. Watch this one in testing.
- **The section opens on four negatives.** If it reads heavy once designed, cut block 4. "You
  become the QA department" overlaps with block 1, and three blocks move faster.
- Alternate pull quote if the current one feels repetitive next to the headline:
  "The savings move. They don't disappear."

---

## 5. How It Works

**Anchor:** `#process`. **State:** relief. **CTA:** none.

Removes uncertainty about the engagement. A GC who has never hired DQS needs to see the path from
what they already have to what they get.

### Copy

**Section headline**

```
From markups to a model you can build from
```

**Intro line**

```
You send what you already have. We handle the rest.
```

**Four steps**

| # | Title | Body |
|---|---|---|
| 1 | **You send the markups** | PDFs from your engineer, your Revit template, and the project scope. That's enough for us to quote it and get started. |
| 2 | **We model it in Revit** | HVAC and plumbing, built inside your template and your standards. Not ours. |
| 3 | **We tell you what we found** | Code conflicts, clashes, and anything that can't be installed the way it's drawn. You get an issue list with the model, not a surprise in the field. |
| 4 | **An owner reviews it** | Every model gets reviewed by an owner before it leaves. Then your engineer takes it from there and stamps it. |

**Closing line**

```
We model. Your engineer stamps. That line never moves.
```

### Layout

- Numbered horizontal steps on desktop, vertical on mobile.
- **Step 3 carries more visual weight than the others.** It is Pillar 1 and the reason the firm
  exists. Larger card, accent border, or a slightly longer block.
- Closing line sits quiet and centered beneath the steps.

### Rationale

**"Not ours" in step 2** answers the loudest complaint in `user-voice.md` §4.4, vendors who ignore
your standards and templates. Two words land harder than an explanation.

**"An owner reviews it," never "signs off."** Sign-off implies approval authority. `Branding.md`
Pillar 4 supplies the exact wording and it is used verbatim.

**The closing line is a liability guardrail.** `Branding.md`: *"DQS models. The engineer stamps.
Never blur this."* Stating it plainly protects DQS, and it builds trust with the MEP engineer of
record rather than costing anything.

**Step 1 is deliberately low-friction.** Three things the reader already has. It makes emailing
feel easy, which is the entire conversion path.

### What is left out on purpose

- **Turnaround time.** No delivery or response promise appears. `Branding.md` §6 forbids it until
  a number is decided.
- **Technical vocabulary.** No LOD, BEP, workset or Navisworks talk. Per the depth rule, Sections
  1 through 7 stay plain enough for a principal. Proof arrives in Sections 8 and 9.

---

## 6. Benefits

**Anchor:** `#benefits`. **State:** relief. **CTA:** none.

Outcome as the headline, the practice that produces it as the subhead. That structure is what
keeps this from becoming a second feature list.

### Copy

**Section headline**

```
What changes when we build it
```

**Four blocks**

| Outcome (headline) | Mechanism (subhead) |
|---|---|
| **Problems cost you less, because you see them sooner** | We check code and clashes while we model, not after. You get an issue list with the delivery, so the expensive version of the problem never happens. |
| **Your senior staff go back to designing** | An owner reviews every model before it leaves. The checking happens on our time, not on your payroll. |
| **The next discipline can pick it up and run** | National CAD standards, clean worksets, consistent family naming, view templates and browser organization. Nobody has to reverse-engineer how it was built. |
| **Capacity without adding payroll** | A small vetted team in Los Angeles. The same people on your projects every time, in your time zone, learning your standards as they go. |

### Layout

- Two-by-two grid on desktop, stacked on mobile.
- Outcome in larger bold type, mechanism in body type beneath. The visual hierarchy is what makes
  this a benefits section rather than a feature grid.

### Rationale

**Block 2 pays off Section 4.** "Your best people become the cleanup crew" is the pain. "Your
senior staff go back to designing" is the relief. Same people, resolved. That pairing makes the
page read as one argument rather than a list of sections.

**No quantified benefits.** No hours saved, no RFI reduction, no percentages. `Branding.md` §6
bans all of it until evidence exists. Each block names a specific situation instead.

**Banned words avoided.** No accurate, precise, high quality, fast or seamless. "Clean worksets"
is fine, since "clean model" is approved vocabulary.

### "Same day" was cut, deliberately

The outline's draft of block 4 included **"questions answered the same day."** Removed.

`Branding.md` §6 forbids publishing a response-time promise until one is decided. "Same day" has
no digits, but it is still a commitment, and a GC who emails at 4pm Friday will hold DQS to it.
Replaced with "in your time zone," which conveys the same availability and promises nothing.

Put it back only after a response-time commitment is agreed.

### Note on overlap with Section 8

Block 3's mechanism names worksets, family naming and browser organization, which is also Section
8's territory. Intentional. Here they are named in passing as proof the outcome is real. Section 8
explains them to someone who will open the file.

---

## 7. Why DQS

**Anchor:** `#why`. **State:** relief. **CTA:** text link.

The comparison section. It answers "why not the firm we used last time" without naming anyone.
Written as an argument, not a restatement of Sections 3 and 6.

### Copy

**Section headline**

```
Four reasons we do things differently
```

**Intro line**

```
We'd rather you ask these of everyone, including us.
```

**Pillar 1 — leads, most visual weight**

> ### We flag problems instead of modeling around them
>
> When a duct won't clear structure, or a vent run doesn't meet the California Plumbing Code, you
> hear about it. The alternative is modeling around it quietly, and that problem resurfaces later
> at a much higher price.

**Pillar 2**

> ### We've been doing these two systems since Revit was new
>
> Two owners, more than 25 years each in HVAC and plumbing engineering, and early adopters of
> Revit. We don't also do structural, electrical, scan-to-BIM or 4D scheduling. This is the whole
> business.

**Pillar 3**

> ### The model is built for whoever opens it next
>
> National CAD standards. Worksets that make sense, families named consistently, view templates
> set up, browser organization you can navigate. Technically correct and miserable to work in is
> still a failure.

**Pillar 4**

> ### You'll know who's working on your project
>
> Two owners with more than 25 years each, and a vetted team in Los Angeles. An owner reviews
> every model before it leaves. Our production staff are US-based and live here, so you're talking
> to the people doing the work.

**CTA — text link**

```
See what we check →   → #code
```

### Layout

- Four alternating rows, graphic on alternating sides. Stacked on mobile.
- **Pillar 1 gets the most weight**: first position, largest treatment.
- CTA link sits after Pillar 4.

### Rationale

**"Technically correct and miserable to work in is still a failure."** From `user-voice.md` §4.7,
buyers describing models that passed every check and were unusable. Every competitor claims
accuracy; none defines quality. This sentence does, and it is the kind of line a reader forwards.

**Never "the owners build every model."** `Branding.md` Pillar 4 is explicit. DQS uses
subcontractors, so that claim is false and easy to disprove. The review is the promise, stated
verbatim.

**Location as a plain fact, not a slogan.** "Our production staff are US-based and live here"
sits at the end of a paragraph, not in a badge. A competitor already owns "local, no offshoring,"
so per Pillar 4 DQS wins on what it knows rather than where it sits.

### Open items

- **`[VERIFY]` — "since Revit was new."** Revit shipped in 2000. If either owner adopted it in the
  mid-2000s, this overstates. `Branding.md` §6 approves "early adopters of Revit" with no date
  attached. Safe replacement headline if unverified:
  **"HVAC and plumbing, all day, for 25 years."**
- **This is the most cuttable section on the page.** Pillar 1 overlaps the hero, Section 5 step 3
  and Benefit 1. Pillar 2 overlaps Credentials. Pillar 3 overlaps Benefit 3. Pillar 4 overlaps
  Credentials. It earns its place only as the comparison section. If it reads as repetition once
  designed, cut it.

---

## 8. What Is In The Model

**Anchor:** `#model`. **State:** scrutiny. **Buyer:** VDC manager, MEP engineer, BIM coordinator.
**CTA:** soft closing line.

The depth shifts here. Sections 1 through 7 are written for a principal. This one is written for
whoever opens the file. Full trade vocabulary is correct.

### Copy

**Section headline**

```
What's actually in the model
```

**Intro line**

```
This part is for whoever's going to open the file.
```

**Group 1 — Model structure**

- Worksets organized by system and level, not by whoever was working that day
- Families named to a consistent convention, with type catalogs where they earn their keep
- View templates set up so sheets stay consistent as the project grows
- Browser organization you can navigate without a legend
- Elements hosted properly, so a level change doesn't detonate the model
- Warning counts kept down and reviewed before the model leaves

**Group 2 — Systems we model**

- Supply, return and exhaust ductwork, with equipment and terminal units
- Hydronic and refrigerant piping
- Domestic hot and cold water
- Sanitary waste and vent
- Natural gas
- Real fittings and valves, not placeholder geometry

**Group 3 — Coordination**

- Clash detection run against architectural and structural
- Hanger and support space accounted for, not assumed
- Service clearances and maintenance access around every piece of equipment
- Equipment connections modeled, not implied
- Ceiling plenum coordination with the other trades

**Group 4 — Working with your team**

- We model in your template, to your standards
- We follow your BIM Execution Plan, or help you scope one if there isn't one yet
- LOD agreed before we start, not argued about after
- An issue list delivered with every model

**Closing line**

```
Not sure what you need? Send the markups and we'll tell you what the scope should be.
```

### Layout

- Four columns on desktop, one per group. Two columns on tablet.
- **Accordion on mobile**, collapsed by default. Twenty-two bullets is a long scroll on a phone,
  and a reader who wants this detail will tap to open it.
- Dense is acceptable. Anyone who reaches this section wants the detail.

### Rationale

**"Not by whoever was working that day."** Anyone who has inherited a messy model knows exactly
what that describes. It proves familiarity faster than any adjective.

**"So a level change doesn't detonate the model."** Hosting problems are the most common inherited
disaster in Revit. Naming the consequence shows DQS has lived it.

**Three negations** — "not placeholder geometry," "not implied," "not argued about after" — each
name a specific shortcut without naming a firm. Neutral contrast aimed at a practice, not a
company.

**"Our QA process" avoided.** `Branding.md` §6 forbids it as a named noun until the checklist is
written down. Group 1 says "reviewed before the model leaves," which describes the action without
claiming a documented system that does not yet exist.

**No adjectives.** No thorough, rigorous or comprehensive. Pillar 3: specifics are the proof.

### Open items

- **`[VERIFY]` — Groups 2 and 3 need a subject-matter review.** The systems and coordination
  lists were written from the brand and research documents, not by a Revit MEP practitioner. A
  wrong or missing technical item on this page would damage a firm whose entire pitch is
  meticulous work. An owner should read these two lists line by line before build.

---

## 9. Code and Jurisdiction

**Anchor:** `#code`. **State:** scrutiny. **CTA:** none.

The empty ground. `competitors.md` found no competitor naming Title 24, the California Mechanical
Code, the California Plumbing Code or LADBS plan check. This is the most defensible section on the
page.

### Copy

**Section headline** — the reserved tagline placement

```
We find it before the city does.
```

**Intro**

```
Plan check corrections are predictable. LADBS publishes the list. We check against it while
we're modeling, not after you've submitted.
```

**What we check against**

| Code | What it covers for us |
|---|---|
| **Title 24** | Ventilation rates, equipment efficiency, duct insulation |
| **California Mechanical Code** | Ductwork, equipment, combustion air, exhaust |
| **California Plumbing Code** | Fixture units, venting, slope, clearances |
| **LADBS standard corrections** | The correction lists the department publishes, checked before you submit |

**What we flag while we model**

- Routing conflicts with structure and architecture
- Clearances around equipment, for both code and service
- Accessibility requirements at fixtures
- Ventilation and exhaust paths that don't work as drawn
- Equipment access and replacement routes
- Anything that will read as a correction when it reaches plan check

**Geography line**

```
Los Angeles County is our home ground. We work across Southern California, and we learn the
jurisdiction before we start.
```

**The boundary — required, not optional**

```
To be clear about what this is. We model and we flag. Your engineer of record reviews, resolves
and stamps. We don't certify anything, and we can't promise you a permit. What we can do is make
sure the obvious corrections aren't in there when you submit.
```

### Layout

- Code table on the left, "what we flag" list on the right. Stacked on mobile.
- Geography line quiet, beneath both.
- **The boundary paragraph gets its own visual treatment**: bordered box or muted background. It
  should read as a deliberate statement, not as fine print.

### Outbound link

Link "LADBS standard corrections" to the published list:

```
https://dbs.lacity.gov/forms-publications/publications/standard-corrections-list
```

`user-voice.md` §10 rates this a high-trust primary source. Linking to a government page DQS
checks against is a strong credibility signal. Open in a new tab with `rel="noopener noreferrer"`.

### Rationale

**The boundary paragraph looks like a disclaimer and is actually the most trust-building paragraph
on the page.** `Branding.md`: *"DQS models. The engineer stamps. Never blur this."* An MEP
engineer of record reading this page is scanning for whether DQS understands its lane. Stating it
plainly answers that, and the last sentence converts the limitation into the offer.

**Geography follows the rule.** Depth in LA County, available across Southern California. No hard
county boundary, because that turns away Orange, Ventura and San Bernardino work DQS can do.

### Open items

- **`[VERIFY]` — the codes table.** The "what it covers for us" column was written from general
  knowledge. This is the most scrutinized table on the page, and a plan checker or engineer will
  read it. An owner must confirm every line before build.
- **Title 24 precision.** Title 24 is the whole California Building Standards Code, with the
  energy code at Part 6. "Title 24" alongside CMC and CPC is how the trade talks, so it is kept.
  If exactness is preferred, use "Title 24 Part 6."

---

## 10. Switching Vendors

**Anchor:** `#switching`. **State:** action. **CTA:** primary button.

Aimed at the switching moment. `user-voice.md` §5.4 found the trigger is a blown deadline, a scope
argument, or silence.

### Copy

**Section headline — the question is the headline**

```
How many hours did your team spend fixing the last model you received?
```

**Body**

```
If the answer is zero, stay where you are. We mean that.

If you had to count, here's what's different on our end. The same people on every one of your
projects. Questions answered in your time zone. Problems flagged in an issue list instead of
buried in the geometry.

We can pick up from a model you already have, or start from the markups. Either works.
```

**CTA**

| Type | Copy | Target |
|---|---|---|
| Primary | Request a Quote | `mailto:rickjiron@gmail.com?subject=Project%20inquiry` |

### Layout

- Full-width band with a contrasting background. This should feel like a different moment in the
  page.
- Centered, narrow measure. Short.
- Headline large. Body is three short paragraphs, not a grid.

### Rationale

**The question is the headline because it is the strongest line in the research.** `Branding.md`
§6 names it as the answer to "we already have a vendor." Burying it under a smaller heading wastes
it.

**"Stay where you are" is the strongest move on the page.** It proves the rest of the page, since
a firm confident enough to send you away believes what it wrote above. It filters, because a happy
buyer was never converting anyway. And it satisfies neutral contrast completely: the incumbent is
never insulted, the reader is handed a measuring stick and left to decide.

**The third paragraph removes the largest objection to acting.** A GC mid-project assumes
switching vendors means starting over. "We can pick up from a model you already have" is the
difference between a reader who agrees and a reader who emails.

**Nothing here needs evidence.** No numbers, no testimonials, no claims. Every line is
publishable today.

---

## 11. About the Owners — CUT

**Status:** cut by decision, 2026-09-23.

### Knock-on changes made

- The `About` link was removed from the navbar in Section 1. It would otherwise point at a dead
  `#about` anchor.
- **Woman-owned** now appears only in the footer. `Branding.md` Pillar 4 allows About or
  credentials; the footer is the remaining valid home.
- Team size, owner review and woman-owned were folded into a new FAQ entry, "How big is your
  team?", so those approved facts still reach the page.

### What the page gives up

- **`competitors.md` Gap 5** found almost no competitor names a single person. DQS now does not
  exploit that gap.
- **No human faces anywhere on the page.** Combined with the cut testimonials, logos and stats,
  nothing on the page comes from outside DQS and no one is named.
- **Section 7 Pillar 4 reads "You'll know who's working on your project."** That claim is now
  unsupported by anything visible. It is defensible — it describes the engagement, not the
  website — but a reader may expect names and not find them. Watch this in testing.

### If it is ever reinstated

What would be needed: both owners' names, preferred titles, one specific background fact each,
what each does day to day, and real headshots. Sentence 2 of each bio is where it succeeds or
fails — "25+ years of experience" is on every competitor site; "twelve years of plumbing design
for hospitals" is not.

---

## 12. FAQ

**Anchor:** `#faq`. **State:** action. **CTA:** none.

The most forwardable section on the page. `Branding.md` §5 notes the reader is often recommending
DQS rather than hiring it. Full trade vocabulary is allowed here.

### Copy

**Section headline**

```
Questions people ask before hiring us
```

#### The four objections — first, so a skeptic hits their doubt immediately

**Why are you more expensive than an offshore team?**

> We're not competing on hourly rate, and we'll lose that comparison every time. Compare the total
> instead. A model that needs a senior engineer to spend a week fixing hosting and families costs
> more than a clean one — that cost just lands on your payroll instead of your invoice. If hourly
> rate is the deciding factor, we're probably not the right fit.

**Can you handle our volume?**

> We run up to five projects at once with a vetted team in Los Angeles. An owner reviews every
> model before it leaves, so quality doesn't change depending on who got assigned. If your volume
> is higher than that, tell us early and we'll be straight with you about what we can take.

**How do I know your quality is real?**

> Ask us to walk you through how we'd set up your model — worksets, family naming, view templates,
> browser organization. You'll know quickly whether we know what we're doing. We'd also rather
> answer your engineer's technical questions directly than send you a brochure.

**We already have a vendor.**

> Then the only question worth asking is how many hours your team spent fixing the last model you
> received. If the answer is zero, stay where you are.

#### Scope and boundaries

**What disciplines do you model?**

> HVAC and plumbing, commercial buildings. That's it. No architectural, no structural, no
> electrical.

**Do you do scan-to-BIM or as-builts?**

> No. That's a different business, and there are firms who do it well. We model from design
> documents and engineer markups.

**Do you stamp drawings?**

> No. We model and we flag issues. Your engineer of record reviews, resolves and stamps. We don't
> blur that line.

**Will you work in our template?**

> Yes, always. We model to your standards, not ours. If your standards aren't written down, we use
> national CAD standards as the baseline.

#### Practical

**What do you need to get started?**

> Your engineer's markups, your Revit template and standards, and the project scope. If you don't
> have a template yet, we'll talk through what makes sense.

**How fast can you turn a model around?**

> It depends on scope, so we won't quote you a number on a website. Send us the markups and we'll
> give you a date along with the price — and we'll tell you if we can't hit yours.

**Where do you work?**

> Los Angeles County is our specialty. We know the local code and what LADBS sends back. We've
> also delivered work across Southern California.

**How big is your team?**

> Two owners with more than 25 years each in HVAC and plumbing engineering, plus a small vetted
> production team in Los Angeles. Design Quest Solutions is a woman-owned business. We're small on
> purpose — it's how an owner can still review every model before it goes out.

### Layout

- Accordion, all questions visible when collapsed so the list stays scannable.
- Order is deliberate: objections, then boundaries, then practical.
- Group headings optional. Twelve questions in one list is acceptable.

### Rationale

**The turnaround answer converts a gap into a strength.** No response-time commitment exists, and
`Branding.md` §6 forbids publishing one. Rather than dodging, the answer refuses to quote a fake
number and offers a real one per project. That reads as honesty, not evasion.

**Two answers deliberately send people away.** "We're probably not the right fit" and "stay where
you are." Both filter price shoppers, which `Branding.md` says to do — DQS loses on sticker price
and should let those go.

**"How big is your team?" recovers the cut About section.** Team size, owner review and
woman-owned all land here as plain facts.

**No response-time number. No certification claims.** Both forbidden by `Branding.md` §6.

### If it runs long

First to cut: "Where do you work?" (covered in Section 9) and "Will you work in our template?"
(covered in Section 5, step 2).

---

## 13. Final CTA

**Anchor:** `#contact`. **State:** action. **CTA:** primary button.

There is no form, so the copy has to do the form's job. That is the main constraint here.

### Copy

**Section headline**

```
Send us the markups
```

**Supporting line**

```
Problems found now cost a conversation. Found later, they cost a change order.
```

**Intake prompt**

```
Tell us what you've got:

- Project type and size
- Where the design stands right now
- Your Revit version and template, if you have one
- When you need to submit
```

**CTA**

| Type | Copy | Target |
|---|---|---|
| Primary button | Request a Quote | `mailto:rickjiron@gmail.com?subject=Project%20inquiry` |
| Plain text beneath | Or email us directly: **rickjiron@gmail.com** | — |

**Closing reassurance**

```
We'll come back with a scope, a price and a date. If it's not a fit, we'll tell you that too.
```

### Layout

- Full-width band, centered, high contrast. Nothing competing in this section.
- Intake prompt as a short list, visually lighter than the headline and button.
- Button prominent. Plain-text email beneath it, smaller.

### Rationale

**The intake prompt replaces the form.** Four items, all things the reader already knows. Without
it, inbound mail is "how much for a Revit model?" and a week of back-and-forth before a quote is
possible.

**The plain-text email is not redundant.** A reader on a work machine with no mail client
configured gets nothing when they click a `mailto:`. Showing the address lets them copy it into
webmail. This is a common and real failure.

**The closing line sets expectations without promising time.** "A scope, a price and a date" says
what comes back. No response-time number, per `Branding.md` §6. "We'll tell you that too" repeats
the filtering honesty from Sections 10 and 12.

### Implementation notes

**Subject-line prefill** keeps the inbox sortable:

```
mailto:rickjiron@gmail.com?subject=Project%20inquiry
```

**Spam scraping.** A plain-text address plus a raw `mailto:` will be harvested within weeks.

| Approach | Tradeoff |
|---|---|
| Assemble the address in JS from `data-user` / `data-domain` attributes | Stops most bots. Fails with JS disabled. |
| Render the address as an image or SVG | Stops all bots. Not copyable, not accessible. **Do not do this.** |
| Accept it and rely on Gmail's spam filter | Zero work. Gmail's filtering is good. |

Recommended: JS assembly for the plain-text address, leave the button's `mailto:` as-is. Most
bots scrape text, not `href` attributes.

### CTA count

"Request a Quote" appears four times: navbar, hero, Section 10, and here. Appropriate for a page
this long. Keep the wording identical every time.

---

## 14. Footer

**Anchor:** none. **CTA:** email link.

### Copy

**Column 1 — Identity**

```
Design Quest Solutions

HVAC and plumbing Revit modeling for commercial buildings.

A woman-owned business in Los Angeles County.
```

**Column 2 — Navigate**

| Label | Target |
|---|---|
| How It Works | `#process` |
| What We Model | `#model` |
| Code Checks | `#code` |
| FAQ | `#faq` |

**Column 3 — Contact**

```
rickjiron@gmail.com

Los Angeles County. Serving Southern California.
```

**Bottom bar**

```
© [current year] Design Quest Solutions
```

### Layout

- Three columns on desktop, stacked on mobile.
- Bottom bar separated by a hairline border, muted text.
- Footer nav matches the navbar exactly. "About" is gone from both.

### Build note

**Do not hardcode the year.** A footer reading "© 2026" in March 2027 is the cheapest possible
credibility leak on a site selling attention to detail.

```astro
© {new Date().getFullYear()} Design Quest Solutions
```

### Woman-owned placement

With Section 11 cut, the footer is the only place this appears outside the FAQ. `Branding.md`
Pillar 4 allows About or credentials; the footer is the remaining valid home. It is a plain fact
in a list of facts, which is exactly the intended weight.

---

## Open items before build

Everything below was raised during copywriting and is unresolved.

### Accuracy checks — an owner must do these

| Item | Section | Risk if wrong |
|---|---|---|
| `[VERIFY]` "since Revit was new" | 7, Pillar 2 | Revit shipped in 2000. If either owner adopted mid-2000s, this overstates. Safe swap: "HVAC and plumbing, all day, for 25 years." |
| `[VERIFY]` Systems and coordination lists | 8, Groups 2 and 3 | Written from brand docs, not by a Revit MEP practitioner. A wrong technical item damages a firm selling meticulous work. |
| `[VERIFY]` Codes table | 9 | The most scrutinized table on the page. A plan checker or engineer will read it. |

### Decisions still open

| Item | Status |
|---|---|
| Response-time commitment | Not set. No number appears anywhere on the page. FAQ answers the question by refusing to quote one. |
| Certifications | None held. No WBENC, California SB or City of LA WBE badge appears. |
| Hero visual and model screenshots | `[PLACEHOLDER]`. Not produced yet. |
| "Questions answered the same day" | Cut from Benefit 4. Restore only after a response-time commitment is agreed. |

### Recommended before launch

| Item | Why |
|---|---|
| Domain email forwarding to the Gmail | A free Gmail domain weakens a premium specialist position for a GC vetting vendors. Accepted as a decision; the recommendation stands. |
| Business phone number | Required for local search ranking. A Google Voice number works. |
| Google Business Profile | Free, and the highest-return item available. Without it DQS cannot appear in the local pack for "Revit MEP modeling Los Angeles." |
| `LocalBusiness` schema in the footer | Structured data for name, area served and disciplines. |
| Privacy policy | Not needed with only a `mailto:`. Becomes necessary under CCPA/CPRA if analytics are added. |

### Fix in the existing page

Both in [`src/pages/index.astro`](../../src/pages/index.astro):

| Problem | Fix |
|---|---|
| Nav wordmark reads "RevitDraft" | Replace with Design Quest Solutions. `Branding.md` §4 retires this name. |
| `<title>` reads "Revit Drafting Consultants" | Replace with the title tag in Section 1. |

Styling must use only the values in [`src/global.css`](../../src/global.css). No new colors.

### Known gap — no third-party proof

With testimonials, client logos, the pilot offer and the About section all cut, nothing on the
page comes from outside DQS and nobody is named. This is correct under `Branding.md` §6 and it is
a real conversion cost. It closes only when the proof in §6 of that document is gathered:

1. Write the QA checklist.
2. Prepare a sanitized sample model a prospect can open.
3. Interview three past clients.
4. Write up two or three real catches.
