# Legacy KGCraft CLI reference

The recommended installation method is now the standard shadcn CLI. See [Installation](INSTALLATION.md). This document covers the optional older custom CLI only.

## Requirements

- Node.js 20+ for the installer. Your framework may require a newer version.
- A React 18+ application with TypeScript.
- Tailwind CSS 4 already configured, with `@import "tailwindcss";` in a global CSS file imported by your app.
- The target app's `package.json` must declare React and Tailwind CSS 4 (for example `"tailwindcss": "^4.3.1"`).

The installer copies source code; it is not a React runtime package. Tailwind CSS 3, Vue, Angular, React Native, and JavaScript-only output are not supported by this flow. It does not configure a framework or install Tailwind's Vite/PostCSS integration for you.

## 1. Build the installer

From the KGCraft repository root:

```powershell
cd E:\kgcraft-ui\kgcraft-ui
pnpm install
pnpm cli:build
```

This generates the registry from the current UI source, bundles a copy with the CLI, and compiles `packages/cli/dist/index.js`. The installer does not search the target app for a monorepo registry anymore.

## 2. Initialize your other application

Open a terminal in your other application's root, such as your local `new-portfolio` checkout. Do not run this step in the KGCraft repository.

```powershell
node "E:\kgcraft-ui\kgcraft-ui\packages\cli\dist\index.js" init -y
```

The command creates `kgcraft-ui.json`:

```json
{
  "version": 1,
  "componentsDir": "src/components/ui",
  "css": "src/index.css",
  "registry": "bundled"
}
```

For Next.js, the installer detects `app/globals.css` or `src/app/globals.css`. For other layouts, specify paths explicitly:

```powershell
node "E:\kgcraft-ui\kgcraft-ui\packages\cli\dist\index.js" init -y --components-dir src/design/ui --css src/styles/globals.css
```

Paths are filesystem paths relative to the application root, not aliases such as `@/components`. Existing shadcn `components.json`, `lib/utils.ts`, and Tailwind configuration remain untouched. An existing `kgcraft-ui.json` is never silently replaced; edit it to change settings.

## 3. Add components

```powershell
node "E:\kgcraft-ui\kgcraft-ui\packages\cli\dist\index.js" list
node "E:\kgcraft-ui\kgcraft-ui\packages\cli\dist\index.js" add button accordion
```

You can add only `button` or only `accordion`. The old `accordian` command spelling remains accepted. Both components produce these files when installed together:

```text
src/components/ui/
  button.tsx
  button-variants.tsx
  accordian.tsx
  accordian-variant.tsx
  kgcraft-utils.ts
  kgcraft-theme.css
```

The installer installs missing component dependencies with your detected package manager, preserving versions already declared by your app. Use `--package-manager npm` (or pnpm/yarn/bun) to override detection. Existing dependency versions must still be compatible with the installed component; check the registry payload's dependency ranges if your app uses older versions.

It adds a theme import and a Tailwind `@source` directive to your global stylesheet. Colors use `--kgcraft-*` variables and `bg-kgcraft-*`/`text-kgcraft-*` utilities, so the original app's `--primary` and similar tokens are not replaced. The `.dark` ancestor class activates the supplied dark colors.

Repeat installs are safe when contents match. A conflicting file stops the whole component request before dependency installation or source writes. To intentionally replace edited files, review them and add `--overwrite`. This can also replace a customized KGCraft theme/helper.

`--skip-install` copies the files and prints the required package-manager command without installing dependencies. This is useful offline, but the app will not build until those dependencies are available.

## 4. Import and render

For `src/App.tsx` in a Vite app:

```tsx
import { Button } from "./components/ui/button";
import { Accordion } from "./components/ui/accordian";

export default function App() {
  return (
    <main className="p-8">
      <Button variant="briskPrimary">Contact me</Button>
      <Accordion content="I build web applications.">About me</Accordion>
    </main>
  );
}
```

The accordion's filename remains `accordian.tsx` for compatibility, but it now exports both `Accordion` and `Accordian`. Button variants are `primary`, `secondary`, `outline`, `briskPrimary`, and `briskSecondary`; sizes are `sm`, `md`, and `lg`.

For `src/app/page.tsx` in Next.js, use `../components/ui/button` and `../components/ui/accordian`, or your project's existing import aliases. The component modules include `"use client"`. If you pass browser event handlers such as `onClick`, place that usage in a client component as Next.js requires. Your root layout must import the global stylesheet.

Once copied, these are your app's source files. You can edit them and build/deploy your app without the KGCraft checkout or CLI installed.

## 5. Share a downloadable installer

From the KGCraft repository:

```sh
pnpm cli:pack
```

Share `artifacts/kgcraft-ui-cli-0.2.0.tgz`. On another machine, inside the receiving app:

```sh
npm install --save-dev /path/to/kgcraft-ui-cli-0.2.0.tgz
npx kgcraft-ui init -y
npx kgcraft-ui add button accordion
```

Replace the tarball path with its actual download location. Keep the archive in a stable location if your package.json references it, or remove the CLI after copying the components. The archive includes the registry, so a public website is unnecessary. Installing npm dependencies still requires network access unless they are cached.

`kgcraft-ui-cli` is the prepared package name, not a claim that it has been published or reserved. Public `npx` installation requires an npm release under a name you control. Before publishing, confirm the package name, version, licensing, and npm account. No npm publication is performed by the build/pack commands.

## Optional: host the component downloads

`pnpm registry:build` writes:

- `packages/registry/registry.json` and `packages/registry/items/*.json`: generated source registry.
- `packages/cli/registry/`: registry included in the installer archive.
- `apps/web/public/r/registry.json` and `apps/web/public/r/items/*.json`: static web assets.

The web app generates these assets before its dev server and production build. After deploying that app, the registry is available at your actual site's `/r` URL. You can also upload the generated `r` directory to another static HTTPS host, preserving its structure. The registry root must serve JSON directly; redirects and oversized responses are rejected.

Then use your real deployed URL:

```sh
npx kgcraft-ui add button --registry https://YOUR-ACTUAL-HOST/r --yes
```

Set `registry` in `kgcraft-ui.json` to persist that URL. Local registry directories are supported too. HTTP is allowed only on localhost for development. External registries provide executable source and dependency specifications; use `--yes` only after trusting that source. Schema validation is not a security audit of downloaded code.

Use the flat `/r/button.json` and `/r/accordion.json` endpoints with shadcn. The legacy CLI's `/r/items/*.json` endpoints retain their separate stylesheet format for compatibility.

## What changed, step by step

1. **Removed the monorepo dependency.** The CLI reads a registry bundled relative to its installed package instead of searching the consumer's directories for `packages/registry`.
2. **Added optional downloads.** Registry selection supports a local directory or HTTPS URL, with timeout, response-size, schema, and dependency-format checks. Failures produce a nonzero exit status.
3. **Eliminated stale component payloads.** `scripts/build-registry.mjs` generates JSON from the current `packages/ui` source, including all button variants, helpers, and styles.
4. **Made the installed files self-contained.** Relative helper imports need no TypeScript aliases. Both components include client boundaries. Accordion naming is compatible with existing consumers.
5. **Separated the component theme.** Generated namespaced colors preserve host theme tokens, while stylesheet imports and Tailwind source scanning are connected automatically.
6. **Protected existing applications.** The installer uses its own config, preflights conflicts, and rejects traversal and symlink/junction write destinations. `--overwrite` is explicit.
7. **Made distribution reproducible.** CLI builds and packaging include fresh registry assets. The archive can be installed without this monorepo.
8. **Added verification.** `pnpm cli:test` covers bundled/HTTP/local registry flows, custom paths, repeated installation, conflicts, invalid input, and filesystem protections. `node scripts/smoke-consumer.mjs` installs the tarball in a fresh external app, installs real dependencies, type-checks and builds it, and checks the emitted theme CSS.

## Verification commands

```sh
pnpm --filter kgcraft-ui-cli check-types
pnpm cli:test
pnpm cli:pack
node scripts/smoke-consumer.mjs
```

The external smoke test needs network access, uses a temporary directory outside the monorepo, and prints that directory for inspection. It does not modify `new-portfolio`. No remote repository, npm package, or public website is changed automatically.
