# Practice: adding a KGCraft component

This repository keeps one editable source for every component and generates the shadcn JSON from it. Do not start by editing `public/r/*.json`; those files are build output.

## The four places to understand

1. **Component source** — `packages/ui/src/components/<name>/<name>.tsx`
2. **Package export** — `packages/ui/src/index.ts`
3. **Registry definition** — the `definitions` array in `scripts/build-registry.mjs`
4. **Documentation** — metadata and preview code in `apps/web/src/App.tsx`

For example, Scramble Text flows through the repository like this:

```text
packages/ui/src/components/scramble-text/scramble-text.tsx
  -> scripts/build-registry.mjs
  -> apps/web/public/r/scramble-text.json
  -> npx shadcn@latest add https://your-host/r/scramble-text.json
  -> the consumer's src/components/ui/kgcraft-scramble-text.tsx
```

## Study each component

### Scramble Text

Open `packages/ui/src/components/scramble-text/scramble-text.tsx`.

- `useState` stores the characters currently visible.
- `useRef` holds the next animation timeout without causing a render.
- `useCallback` gives `play` and `stop` stable references.
- `useEffect` starts the animation and clears the timeout on unmount.
- `prefers-reduced-motion` avoids forcing animation on users who disabled it.
- Only the active character scrambles. After three frames it locks, then the cursor moves to the next character.
- `speed` means characters per second, so increasing it makes the animation faster.

Practice: change `scrambleFrame >= 3` to `scrambleFrame >= 5` and compare how long each character flickers before locking.

### Shimmer Text

Open `packages/ui/src/components/shimmer-text/shimmer-text.tsx`.

- The text uses a gradient background clipped to its glyphs.
- Framer Motion moves `backgroundPosition` across that gradient.
- `useReducedMotion` stops the loop for accessibility.

Practice: add a `shimmerColor` prop and use it in the inline gradient instead of `--kgcraft-primary`.

### Search Bar

Open `packages/ui/src/components/search-bar/search-bar.tsx`.

- When `value` is supplied, the parent controls the input.
- Without `value`, the component uses its own `internalValue`.
- `forwardRef` lets a parent focus the real input.
- The clear button appears only when the field has content.

Practice: add a `loading` prop and replace the Search icon with a spinning loader while a search request runs.

### Command Palette

Open `packages/ui/src/components/command-palette/command-palette.tsx`.

- It supports controlled and uncontrolled open state.
- A window keyboard listener handles Ctrl+K/Command+K and Escape.
- Filtering derives a visible list from `items` and `query`.
- `activeIndex` supports ArrowUp, ArrowDown, and Enter selection.
- Each item owns its action through `onSelect`.

Practice: add group headings such as “Navigation” and “Settings”, then keep keyboard selection working when a group has no matches.

## Add your next component

Suppose the next component is `typing-text`:

1. Create `packages/ui/src/components/typing-text/typing-text.tsx`.
2. Export it from `packages/ui/src/index.ts`.
3. Add this entry to `definitions` in `scripts/build-registry.mjs`:

```js
{
  name: "typing-text",
  title: "Typing Text",
  description: "Types text one character at a time.",
  files: ["typing-text/typing-text.tsx"],
  dependencies: ["clsx", "tailwind-merge"],
}
```

4. Add its title, usage, props, and preview to `apps/web/src/App.tsx`.
5. Add its name to `componentNames` in `scripts/registry.test.mjs`.
6. Generate and verify everything:

```sh
pnpm registry:build
pnpm registry:test
pnpm --filter @repo/ui check-types
pnpm --filter web build
pnpm shadcn:test
```

7. Push the generated JSON and source. After Vercel deploys, install it from `/r/typing-text.json`.

## Current installation URLs

```sh
npx shadcn@latest add https://kgcraft-ui-web.vercel.app/r/scramble-text.json
npx shadcn@latest add https://kgcraft-ui-web.vercel.app/r/shimmer-text.json
npx shadcn@latest add https://kgcraft-ui-web.vercel.app/r/search-bar.json
npx shadcn@latest add https://kgcraft-ui-web.vercel.app/r/command-palette.json
```

These four URLs become available after the source and generated files are pushed and Vercel finishes the next deployment.
