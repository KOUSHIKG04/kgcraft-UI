# Install KGCraft UI with shadcn

KGCraft now uses the same distribution pattern as the [Scramble Text example](https://siddz.com/components/scramble-text): a component page, a public JSON URL, and the standard shadcn CLI. Consumers do **not** need our custom CLI, an npm release of KGCraft, or `kgcraft-ui.json`.

## 1. Prepare your application

Use a React application with Tailwind CSS 4. If shadcn is not initialized yet, run this from your app's directory and follow its prompts:

```sh
npx shadcn@latest init
```

Existing shadcn projects can skip this step. The standard `components.json` controls aliases, directories, the global CSS file, and TypeScript/JavaScript output.

## 2. Install from the registry URL

The public registry is hosted with the component documentation at [kgcraft-ui-web.vercel.app](https://kgcraft-ui-web.vercel.app/). Run these commands **in the receiving application**:

```sh
npx shadcn@latest add https://kgcraft-ui-web.vercel.app/r/button.json
npx shadcn@latest add https://kgcraft-ui-web.vercel.app/r/accordion.json
```

For local registry development, start this repository and use the URL printed by Vite:

```sh
pnpm install
pnpm web:dev
npx shadcn@latest add http://localhost:5173/r/button.json
npx shadcn@latest add http://localhost:5173/r/accordion.json
```

These are real shadcn URL installations. Localhost works only on the computer running the registry server; it is not a public sharing URL.

The documentation page uses its current origin, so its copyable install command automatically uses the deployed URL. Set `VITE_REGISTRY_URL` at build time only when the registry is hosted at a different URL. A separate registry host must permit cross-origin reads for the page's source/manual panels.

### Other package managers

```sh
pnpm dlx shadcn@latest add https://kgcraft-ui-web.vercel.app/r/button.json
yarn dlx shadcn@latest add https://kgcraft-ui-web.vercel.app/r/button.json
bunx --bun shadcn@latest add https://kgcraft-ui-web.vercel.app/r/button.json
```

The Yarn command requires modern Yarn with `dlx` support.

## 3. Import and use

With shadcn's default UI alias:

```tsx
import { Button } from "@/components/ui/kgcraft-button";
import { Accordion } from "@/components/ui/kgcraft-accordion";

export default function Example() {
  return (
    <main>
      <Button variant="briskPrimary">Get in touch</Button>
      <Accordion content="Yes. The source lives in your project.">
        Can I customize this component?
      </Accordion>
    </main>
  );
}
```

File names are prefixed to avoid replacing existing shadcn Button/Accordion components. If `aliases.ui` points elsewhere, use that alias instead. `target: "@ui/..."` lets shadcn resolve your actual directory.

The components have `"use client"` boundaries for Next.js. If you supply an `onClick` handler, the component using that handler must also be a client component. The legacy `Accordian` export is retained, but the new download's filename is `kgcraft-accordion.tsx`.

shadcn installs the component, variant file, `kgcraft-utils.ts`, and npm dependencies. Theme variables merge into your configured global CSS through native `cssVars` metadata. You do not need to import another KGCraft stylesheet. `--kgcraft-*` variables preserve your existing `--primary`, `--background`, and other theme values. The `.dark` class selects the dark values.

## Manual installation

Open the component page and select **Installation → Manual**:

1. Run the displayed dependency command.
2. Copy every listed source file into the same UI directory.
3. Paste the provided theme into your global Tailwind stylesheet after its Tailwind import. Add it only once, and keep that stylesheet imported by your application.
4. Import and render the component using the example above.

The manual source and commands come from the same generated payload as the CLI, so both use the current component code. The page also includes preview/source views, copy buttons, usage examples, and props tables.

## How the registry is built

```sh
pnpm registry:build
```

`scripts/build-registry.mjs` reads `packages/ui/src` and produces:

| Output                                               | Purpose                             |
| ---------------------------------------------------- | ----------------------------------- |
| `apps/web/public/r/button.json`                      | Public shadcn Button payload        |
| `apps/web/public/r/accordion.json`                   | Public shadcn Accordion payload     |
| `apps/web/public/r/registry.json`                    | Catalog of the public items         |
| `apps/web/public/r/kgcraft-theme.css`                | Theme text for manual installation  |
| `packages/registry/shadcn/`                          | Tracked copy of the shadcn registry |
| `packages/registry/items/`, `packages/cli/registry/` | Older custom CLI compatibility      |

The `accordian.json` URL also works as a compatibility alias. Public shadcn payloads use flat `/r/*.json` URLs; do not substitute the legacy `/r/items/*.json` payloads.

Edit the UI source and regenerate; do not edit generated JSON by hand. The web app's dev/build commands generate the assets explicitly before starting Vite. Vercel deploys `apps/web/dist` and preserves the `/r` files.

## Verification

```sh
pnpm registry:test
pnpm shadcn:test
pnpm --filter web build
```

The integration test installs `shadcn@latest` in a disposable app outside this monorepo, serves the generated JSON over localhost, and runs the real shadcn `add` command. It checks dependency installation, both components, native theme merging, existing component/theme preservation, custom UI aliases, TypeScript, and a Vite production build. It requires network access and retains the temporary app for inspection. To verify the live deployment, run `node scripts/smoke-shadcn.mjs https://kgcraft-ui-web.vercel.app/r`.

This format follows the [official shadcn registry specification](https://ui.shadcn.com/docs/registry/registry-item-json). The previous standalone installer remains available only as an optional [legacy workflow](LEGACY_CLI.md).
