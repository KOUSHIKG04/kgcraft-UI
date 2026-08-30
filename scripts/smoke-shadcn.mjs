import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "node:http";

const root = fileURLToPath(new URL("../", import.meta.url));
const remoteBase = process.argv[2]?.replace(/\/$/, "");
const cwd = await mkdtemp(path.join(tmpdir(), "kgcraft-shadcn-consumer-"));
console.log(`Independent shadcn consumer: ${cwd}`);
const write = async (name, content) => {
  const target = path.join(cwd, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(
    target,
    typeof content === "string" ? content : JSON.stringify(content, null, 2),
  );
};
const run = (executable, args, directory = cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd: directory, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${executable} exited with ${code}`)),
    );
  });
// These command strings contain only fixed commands and our server's numeric localhost port.
const npm = (command) =>
  process.platform === "win32"
    ? run(process.env.ComSpec ?? "cmd.exe", [
        "/d",
        "/s",
        "/c",
        `npm ${command}`,
      ])
    : run("npm", command.split(" "));

if (!remoteBase) {
  await run(
    process.execPath,
    [path.join(root, "scripts/build-registry.mjs")],
    root,
  );
}
await write("package.json", {
  name: "kgcraft-shadcn-consumer",
  private: true,
  type: "module",
  scripts: { build: "tsc --noEmit && vite build" },
  dependencies: { react: "^19.2.0", "react-dom": "^19.2.0" },
  devDependencies: {
    shadcn: "latest",
    typescript: "5.9.2",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    tailwindcss: "4.3.1",
    "@tailwindcss/vite": "4.3.1",
    vite: "8.1.0",
  },
});
const config = {
  $schema: "https://ui.shadcn.com/schema/config.json",
  style: "new-york",
  rsc: false,
  tsx: true,
  tailwind: {
    config: "",
    css: "src/index.css",
    baseColor: "neutral",
    cssVariables: true,
  },
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
    lib: "@/lib",
    hooks: "@/hooks",
  },
};
await write("components.json", config);
await write(
  "src/index.css",
  '@import "tailwindcss";\n:root { --primary: hotpink; }\n.dark { --primary: cyan; }\n',
);
await write(
  "src/components/ui/button.tsx",
  "export const ExistingButton = () => <button>Existing button</button>;\n",
);
await write("tsconfig.json", {
  compilerOptions: {
    target: "ES2022",
    lib: ["ES2022", "DOM"],
    module: "ESNext",
    moduleResolution: "Bundler",
    jsx: "react-jsx",
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    baseUrl: ".",
    paths: { "@/*": ["./src/*"] },
  },
  include: ["src"],
});
await write(
  "vite.config.mjs",
  'import { defineConfig } from "vite";\nimport tailwindcss from "@tailwindcss/vite";\nexport default defineConfig({ plugins: [tailwindcss()] });\n',
);
await write(
  "index.html",
  '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>shadcn consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
);
await write(
  "src/main.tsx",
  `import { createRoot } from "react-dom/client";
import { Button } from "./components/ui/kgcraft-button";
import { Accordion } from "./components/ui/kgcraft-accordion";
import { ScrambleText } from "./components/ui/kgcraft-scramble-text";
import { ShimmerText } from "./components/ui/kgcraft-shimmer-text";
import { SearchBar } from "./components/ui/kgcraft-search-bar";
import { CommandPalette } from "./components/ui/kgcraft-command-palette";
import "./index.css";
createRoot(document.getElementById("root")!).render(<main className="p-8"><Button variant="briskPrimary">Contact me</Button><Accordion content="Installed using shadcn">About me</Accordion><ScrambleText text="Hello" /><ShimmerText text="Loading" /><SearchBar /><CommandPalette items={[]} /></main>);
`,
);
const requests = [];
const server = createServer(async (req, res) => {
  const files = {
    "/r/button.json": "button.json",
    "/r/accordion.json": "accordion.json",
    "/r/scramble-text.json": "scramble-text.json",
    "/r/shimmer-text.json": "shimmer-text.json",
    "/r/search-bar.json": "search-bar.json",
    "/r/command-palette.json": "command-palette.json",
  };
  requests.push(req.url);
  if (!files[req.url]) {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    res.setHeader("Content-Type", "application/json");
    res.end(
      await readFile(path.join(root, "apps/web/public/r", files[req.url])),
    );
  } catch {
    res.writeHead(500);
    res.end();
  }
});
if (!remoteBase) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
}
try {
  const base = remoteBase ?? `http://127.0.0.1:${server.address().port}/r`;
  await npm(
    "install --no-audit --no-fund --fetch-retries=0 --fetch-timeout=60000",
  );
  await npm("exec -- shadcn --version");
  await npm(
    `exec -- shadcn add ${base}/button.json ${base}/accordion.json ${base}/scramble-text.json ${base}/shimmer-text.json ${base}/search-bar.json ${base}/command-palette.json --yes`,
  );
  const css = await readFile(path.join(cwd, "src/index.css"), "utf8");
  assert.match(css, /--kgcraft-primary:/);
  assert.match(css, /--color-kgcraft-primary:/);
  assert.match(css, /--primary:\s*hotpink/);
  assert.match(css, /--primary:\s*cyan/);
  assert.match(
    await readFile(path.join(cwd, "src/components/ui/button.tsx"), "utf8"),
    /Existing button/,
  );
  assert.match(
    await readFile(
      path.join(cwd, "src/components/ui/kgcraft-button.tsx"),
      "utf8",
    ),
    /use client/,
  );
  assert.match(
    await readFile(
      path.join(cwd, "src/components/ui/kgcraft-accordion.tsx"),
      "utf8",
    ),
    /use client/,
  );
  for (const name of [
    "scramble-text",
    "shimmer-text",
    "search-bar",
    "command-palette",
  ]) {
    assert.match(
      await readFile(
        path.join(cwd, `src/components/ui/kgcraft-${name}.tsx`),
        "utf8",
      ),
      /use client/,
    );
  }
  if (!remoteBase) {
    for (const name of [
      "button",
      "accordion",
      "scramble-text",
      "shimmer-text",
      "search-bar",
      "command-palette",
    ])
      assert.ok(requests.includes(`/r/${name}.json`));
  }
  assert.ok(!(await readdir(cwd)).includes("kgcraft-ui.json"));
  await npm("run build");
  const assets = await readdir(path.join(cwd, "dist/assets"));
  const builtCss = await readFile(
    path.join(
      cwd,
      "dist/assets",
      assets.find((name) => name.endsWith(".css")),
    ),
    "utf8",
  );
  assert.match(builtCss, /\.bg-kgcraft-primary/);
  // An existing shadcn project may place primitives elsewhere. Test its aliases too.
  config.aliases.ui = "@/design/primitives";
  await write("components.json", config);
  await npm(
    `exec -- shadcn add ${base}/button.json ${base}/accordion.json ${base}/scramble-text.json ${base}/shimmer-text.json ${base}/search-bar.json ${base}/command-palette.json --yes`,
  );
  assert.match(
    await readFile(
      path.join(cwd, "src/design/primitives/kgcraft-button.tsx"),
      "utf8",
    ),
    /kgcraft-utils/,
  );
  assert.match(
    await readFile(
      path.join(cwd, "src/design/primitives/kgcraft-accordion.tsx"),
      "utf8",
    ),
    /kgcraft-utils/,
  );
  await npm("exec -- tsc --noEmit");
  const deps = JSON.parse(
    await readFile(path.join(cwd, "package.json"), "utf8"),
  ).dependencies;
  for (const name of [
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "framer-motion",
    "lucide-react",
  ])
    assert.ok(deps[name]);
  assert.ok(!deps["kgcraft-ui-cli"] && !deps["@repo/ui"]);
  console.log(
    "PASS: shadcn@latest URL install, real dependencies, CSS merge, existing component/theme preservation, custom aliases, TypeScript and Vite build.",
  );
  console.log(`Consumer retained: ${cwd}`);
} finally {
  if (!remoteBase) {
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
  }
}
