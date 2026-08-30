import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const ui = path.join(root, "packages/ui/src");
const read = (file) => readFile(path.join(ui, file), "utf8");
const pkg = JSON.parse(
  await readFile(path.join(ui, "../package.json"), "utf8"),
);
const tokens = [
  "background",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "accent",
  "accent-foreground",
  "muted-foreground",
  "border",
  "input",
  "ring",
];
const globalCss = await read("styles/global.css");

// Use the design system's colors, but do not change the consumer's theme tokens.
function tokenValues(selector) {
  const block = globalCss.match(
    new RegExp(`${selector}\\s*\\{([^}]+)\\}`),
  )?.[1];
  return Object.fromEntries(
    tokens.map((token) => {
      const value = block?.match(new RegExp(`--${token}:\\s*([^;]+);`))?.[1];
      if (!value) throw new Error(`Missing ${selector} theme token: ${token}`);
      return [`kgcraft-${token}`, value];
    }),
  );
}
function variables(selector) {
  return Object.entries(tokenValues(selector))
    .map(([name, value]) => `  --${name}: ${value};`)
    .join("\n");
}
const theme = `/* Generated KGCraft UI theme. Override --kgcraft-* to customize. */\n@theme inline {\n${tokens.map((token) => `  --color-kgcraft-${token}: var(--kgcraft-${token});`).join("\n")}\n}\n\n:root {\n${variables(":root")}\n}\n\n.dark {\n${variables("\\.dark")}\n}\n`;
const tokenPattern = new RegExp(
  `\\b(bg|text|border|ring)-(${[...tokens].sort((a, b) => b.length - a.length).join("|")})(?![\\w-])`,
  "g",
);
function portable(source) {
  return source
    .replaceAll('"../../lib/utils"', '"./kgcraft-utils"')
    .replace(tokenPattern, "$1-kgcraft-$2")
    .replaceAll("\r\n", "\n");
}
const file = (name, content) => ({
  path: `components/ui/${name}`,
  type: "registry:ui",
  content,
});
const shared = [
  file(
    "kgcraft-utils.ts",
    (await read("lib/utils.ts")).replaceAll("\r\n", "\n"),
  ),
  file("kgcraft-theme.css", theme),
];
const definitions = [
  {
    name: "button",
    title: "Button",
    description: "Button with primary, secondary, outline, and brisk variants.",
    files: ["button/button.tsx", "button/button-variants.tsx"],
    dependencies: ["class-variance-authority", "clsx", "tailwind-merge"],
  },
  {
    name: "accordion",
    title: "Accordion",
    description: "Animated accordion with customizable icons and placement.",
    files: ["accordian/accordian.tsx", "accordian/accordian-variant.tsx"],
    dependencies: [
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "framer-motion",
      "lucide-react",
    ],
  },
];
const items = [];
for (const def of definitions) {
  items.push({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: def.name,
    type: "registry:ui",
    title: def.title,
    description: def.description,
    dependencies: def.dependencies.map(
      (name) => `${name}@${pkg.dependencies[name]}`,
    ),
    files: [
      ...(await Promise.all(
        def.files.map(async (source) =>
          file(
            path.basename(source),
            portable(await read(`components/${source}`)),
          ),
        ),
      )),
      ...shared,
    ],
    docs: "React 18+ and Tailwind CSS 4 required. Import kgcraft-theme.css from your global Tailwind stylesheet. The accordion file keeps the legacy accordian.tsx filename and also exports Accordion.",
  });
}
const catalog = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "kgcraft-ui",
  homepage: "https://github.com/KOUSHIKG04/kgcraft-UI",
  items,
};
async function json(directory, name, value) {
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, name),
    JSON.stringify(value, null, 2) + "\n",
  );
}
const outputs = [
  path.join(root, "packages/registry"),
  path.join(root, "packages/cli/registry"),
  path.join(root, "apps/web/public/r"),
];
for (const directory of outputs) {
  await json(directory, "registry.json", catalog);
  for (const item of items)
    await json(path.join(directory, "items"), `${item.name}.json`, item);
  await json(path.join(directory, "items"), "accordian.json", {
    ...items[1],
    name: "accordian",
  });
}

// Public shadcn items use its native theme merge instead of our custom CLI's CSS import.
// Prefix filenames to coexist with an app's existing shadcn button/accordion.
const shadcnItems = items.map((item) => ({
  ...item,
  files: item.files
    .filter((entry) => !entry.path.endsWith(".css"))
    .map((entry) => {
      const filename = path.basename(entry.path);
      const output = filename.startsWith("kgcraft-")
        ? filename
        : `kgcraft-${filename.replaceAll("accordian", "accordion")}`;
      return {
        path: `registry/kgcraft/${output}`,
        type: "registry:ui",
        target: `@ui/${output}`,
        content: entry.content
          .replaceAll('"./button-variants"', '"./kgcraft-button-variants"')
          .replaceAll('"./accordian-variant"', '"./kgcraft-accordion-variant"'),
      };
    }),
  cssVars: {
    theme: Object.fromEntries(
      tokens.map((token) => [
        `color-kgcraft-${token}`,
        `var(--kgcraft-${token})`,
      ]),
    ),
    light: tokenValues(":root"),
    dark: tokenValues("\\.dark"),
  },
  docs: `Import ${item.name === "button" ? "Button" : "Accordion"} from your configured UI directory's kgcraft-${item.name} module. Requires Tailwind CSS 4. No KGCraft CLI or runtime package is needed.`,
}));
for (const directory of [
  path.join(root, "packages/registry/shadcn"),
  path.join(root, "apps/web/public/r"),
]) {
  await json(directory, "registry.json", { ...catalog, items: shadcnItems });
  for (const item of shadcnItems)
    await json(directory, `${item.name}.json`, item);
  await json(directory, "accordian.json", {
    ...shadcnItems[1],
    name: "accordian",
  });
  await writeFile(path.join(directory, "kgcraft-theme.css"), theme);
}
console.log(
  `Generated ${items.length} components from packages/ui (legacy CLI bundle and shadcn /r/*.json).`,
);
