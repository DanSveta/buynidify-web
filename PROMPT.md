# Buynidify Animation Brief & Prompt

## What this project is

Buynidify is a UK property platform connecting property investors with tenants.

The platform does not own or host a traditional inventory of properties. Users find properties advertised **for sale** on external UK property platforms such as Rightmove and Zoopla.

The main idea is:

- An investor finds a property they may want to buy, but wants to know whether a tenant would actually rent it.
- A tenant finds a property that they would love to rent, but it is currently for sale rather than available to rent.
- Both people publish their interest through Buynidify.
- When the investor and tenant are interested in the same property and agree on the terms, they are matched.
- The tenant commits with a deposit.
- The investor purchases the property.
- Buynidify agents help both sides complete the purchase and tenancy process.
- The investor receives rental income and the tenant gets a home.

More detailed product logic is documented in [`PRODUCT.md`](./PRODUCT.md).

## Animation goal

Create a short, high-quality animation for the **How Buynidify Works** section of the public homepage.

The animation must explain the investor–tenant relationship visually, without relying on captions or labels inside the animation.

The viewer should understand:

1. One person is considering investing in a property.
2. Another person wants to live in that property.
3. Their interests connect through Buynidify.
4. They agree and shake hands.
5. The investor receives rental income.
6. The tenant receives the keys to a home.

## Important creative direction

The result should feel:

- Gen-Z and contemporary;
- cool, surprising, and memorable;
- expressive and character-driven;
- premium enough for a fintech/proptech company;
- friendly rather than formal;
- visually clear without being literal or corporate; and
- suitable for a modern startup landing page.

Avoid a generic business explainer-video aesthetic. The characters should not simply stand beside icons while text explains everything.

## Copy-paste generation prompt

```text
Create an 8–10 second seamless looping animation for a modern UK proptech brand called Buynidify.

The animation must communicate the story entirely through characters, body language, objects, composition, and motion. Do not use explanatory text, captions, labels, headings, interface panels, or character names anywhere inside the animation.

STORY

A stylish young property investor discovers an attractive UK townhouse advertised for sale. Make the investment role understandable visually: the character studies the property, holds a phone displaying a simple rising yield graph, and has a subtle British-pound or investment cue.

A stylish young prospective tenant sees the same property from the opposite side. Make the tenant role understandable visually: the character imagines living there, reacts emotionally and enthusiastically to the home, and has a subtle house-key or moving-home cue.

Blue investment signals travel from the investor toward the property. Warm coral or yellow interest signals travel from the tenant toward the same property. The two signals converge at the house.

The investor and tenant approach one another and complete a friendly handshake. Use a visual burst, checkmark, glow, satisfying connection effect, or another purely visual symbol of agreement. Do not display the word “match” or any other text.

Finish by showing:

- rental income or a pound-coin visual moving toward the investor;
- a golden house key moving toward the tenant;
- the property glowing warmly; and
- both characters visibly happy with the outcome.

Return naturally to the opening composition so the animation loops seamlessly.

VISUAL STYLE

- Gen-Z editorial motion design
- Cool, fashionable, expressive human characters
- Contemporary UK styling and architecture
- Bold proportions and confident poses
- Mixed vector illustration, paper-cut collage, subtle grain, and playful geometric forms
- Deep navy, electric cobalt blue, butter yellow, warm coral, and off-white
- Premium contemporary fintech/proptech campaign aesthetic
- Energetic transitions, visual surprises, overshoot, bounce, and smooth easing
- Strong silhouettes and immediately readable visual storytelling
- Friendly and playful, but not childish

COMPOSITION AND OUTPUT

- Wide 16:9 composition for a website
- Investor begins on the left
- UK property is the visual focus in the center
- Tenant begins on the right
- Keep all important action inside the central safe area so it remains readable on narrower screens
- 8–10 seconds
- Seamless loop
- 24 or 30 fps
- At least 1920 × 1080 for video output
- No audio is required
- Prefer transparent WebM, Rive, or Lottie when possible
- MP4 can be supplied as an additional preview format

AVOID

- Generic corporate explainer-video style
- Outdated or “boomer” business animation
- Stiff characters standing beside icons
- Character labels such as “Investor” or “Tenant”
- Step-by-step text appearing on screen
- Captions, headings, logos, watermarks, or UI panels
- Childish clip art
- Photorealistic stock footage
- Cryptocurrency imagery
- Fractional-investment imagery
- American suburban architecture
- Dollar signs; use subtle UK pound imagery if currency is shown
- Deformed hands, broken keys, morphing faces, or changing character identities

The viewer should understand the complete concept without reading anything: an investor validates tenant demand, both sides commit to the same property, the investor receives income, and the tenant gets a home.
```

## Recommended production approach

For a quick AI concept, test the prompt in:

- Runway
- Luma Dream Machine
- Adobe Firefly Video

For the final website-quality animation, the recommended tools are:

- **Rive** for a lightweight, interactive, responsive animation;
- **Jitter** for polished 2D motion exported as WebM, GIF, or Lottie; or
- **Spline** if the final direction becomes an interactive 3D scene.

The strongest workflow is:

1. Create and approve the character and property style frames.
2. Test acting, timing, and transitions in Runway or Luma.
3. Recreate the approved animation precisely in Rive or Jitter.
4. Export a lightweight web version.
5. Add it to this project and verify desktop and mobile layouts.

## Deliverables

Please provide:

1. Editable source file, preferably Rive, Jitter, After Effects, or equivalent.
2. Transparent WebM if the artwork is designed to sit over the website background.
3. Standard MP4 preview.
4. GIF preview if practical.
5. Poster/first-frame image for loading and fallback states.
6. Any custom fonts, licensed assets, or external dependencies used.

Keep the production web asset reasonably small. Ideally, the main looping animation should remain under approximately 3–5 MB without looking visibly compressed.

## Where the animation belongs

The homepage section is implemented in:

```text
src/sections/HowItWorks.tsx
```

The current experimental comparison components are:

```text
src/sections/HowItWorksShowcase.tsx
src/sections/HowItWorksAnimation.tsx
```

Current experimental media is stored in:

```text
public/animations/
```

These experiments are temporary. Once the preferred animation is ready, replace the comparison area with the final asset rather than keeping all the alternatives on the production homepage.

## How to run the project

### Requirements

- Node.js 20 or newer is recommended.
- npm is required.

### Install dependencies

From the project root, run:

```bash
npm install
```

### Start the development website

```bash
npm run dev
```

Vite will print the local URL, normally:

```text
http://localhost:5173
```

Open that address in a browser, scroll to **How Buynidify Works**, and review the animation in context.

### Create a production build

```bash
npm run build
```

### Run lint checks

```bash
npm run lint
```

Both commands should pass before handing the project back.

## How to add the final animation

### If the output is WebM or MP4

Place the files inside:

```text
public/animations/
```

Use a muted, autoplaying, inline, looping video:

```tsx
<video
  autoPlay
  muted
  loop
  playsInline
  poster="/animations/buynidify-final-poster.webp"
  className="block h-auto w-full"
>
  <source src="/animations/buynidify-final.webm" type="video/webm" />
  <source src="/animations/buynidify-final.mp4" type="video/mp4" />
</video>
```

Do not include audio. Browsers generally require video to be muted for reliable autoplay.

### If the output is a GIF

Place it inside `public/animations/` and render it with an image element. GIF should only be used for preview or fallback because it is usually larger and lower quality than WebM.

```tsx
<img
  src="/animations/buynidify-final.gif"
  alt="An investor and tenant connect around the same property"
  className="block h-auto w-full"
/>
```

### If the output is Rive

Export the `.riv` file and place it in `public/animations/`. Add the appropriate official Rive React runtime, then create a small dedicated React component for playback. Preserve the canvas aspect ratio and pause the animation when it is outside the viewport if practical.

### If the output is Lottie

Export the animation as Lottie JSON and keep any linked image assets together. Verify that the export does not rely on unsupported After Effects effects, masks, expressions, or fonts.

## Integration requirements

- The animation must scale cleanly from mobile to desktop.
- Do not stretch or crop away either character.
- Do not add character labels or explanatory copy inside the artwork.
- Keep the surrounding website heading and supporting copy as normal HTML.
- Respect `prefers-reduced-motion`; show a meaningful still frame when reduced motion is enabled.
- Avoid loading a large animation before it is near the viewport if possible.
- Provide useful alternative text or an accessible description.
- Do not change unrelated homepage sections.
- Do not overwrite another person's unrelated work in the repository.
- Run build and lint checks after integration.

## Acceptance checklist

- [ ] Investor role is understandable without a label.
- [ ] Tenant role is understandable without a label.
- [ ] Both characters clearly want the same property for different reasons.
- [ ] The connection/match is visually obvious.
- [ ] Handshake or commitment moment feels natural.
- [ ] Investor outcome is rental income.
- [ ] Tenant outcome is receiving a home/key.
- [ ] No text appears inside the animation.
- [ ] Style feels contemporary and Gen-Z rather than corporate.
- [ ] Loop has no obvious jump.
- [ ] Characters remain visually consistent.
- [ ] UK context is recognizable but not clichéd.
- [ ] Animation works on desktop and mobile.
- [ ] Reduced-motion fallback is included.
- [ ] Final production asset has an acceptable file size.
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.

