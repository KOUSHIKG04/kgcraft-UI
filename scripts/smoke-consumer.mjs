// Run after pnpm cli:pack. Installs the tarball in a fresh directory outside the monorepo.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const cliPackage = JSON.parse(
  await readFile(path.join(root, "packages/cli/package.json"), "utf8"),
);
const tarball = path.join(
  root,
  "artifacts",
  `${cliPackage.name}-${cliPackage.version}.tgz`,
);
await readFile(tarball);
const cwd = await mkdtemp(path.join(tmpdir(), "kgcraft-external-consumer-"));
console.log(`External consumer: ${cwd}`);
const write = async (name, value) => {
  const target = path.join(cwd, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(
    target,
    typeof value === "string" ? value : JSON.stringify(value, null, 2),
  );
};
function run(executable, args) {
  const result = spawnSync(executable, args, {
    cwd,
    stdio: "inherit",
    timeout: 240_000,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${executable} failed`);
}
function npm(command) {
  // All command strings here are fixed literals; paths are carried in package.json.
  if (process.platform === "win32")
    run(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", `npm ${command}`]);
  else run("npm", command.split(" "));
}
await write("package.json", {
  name: "kgcraft-external-consumer",
  private: true,
  type: "module",
  packageManager: "npm@10.9.4",
  scripts: { build: "tsc --noEmit && vite build" },
  dependencies: { react: "^19.2.0", "react-dom": "^19.2.0" },
  devDependencies: {
    "kgcraft-ui-cli": `file:${tarball.replaceAll("\\", "/")}`,
    typescript: "5.9.2",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    tailwindcss: "4.3.1",
    "@tailwindcss/vite": "4.3.1",
    vite: "8.1.0",
  },
});
await write(
  "src/index.css",
  '@import "tailwindcss";\n:root { --primary: hotpink; }\n',
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
  },
  include: ["src"],
});
await write(
  "index.html",
  '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>KGCraft external consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
);
await write(
  "vite.config.mjs",
  'import { defineConfig } from "vite";\nimport tailwindcss from "@tailwindcss/vite";\nexport default defineConfig({ plugins: [tailwindcss()] });\n',
);
await write(
  "src/main.tsx",
  `import { createRoot } from "react-dom/client";
import { Button } from "./components/ui/button";
import { Accordion } from "./components/ui/accordian";
import "./index.css";
createRoot(document.getElementById("root")!).render(<main className="p-8"><h1>KGCraft external consumer</h1><Button variant="briskPrimary" onClick={() => alert("Works!")}>Contact me</Button><Accordion content="Installed from the packaged CLI">About me</Accordion></main>);
`,
);
npm("install --no-audit --no-fund");
npm("exec -- kgcraft-ui list");
const cli = path.join(cwd, "node_modules/kgcraft-ui-cli/dist/index.js");
run(process.execPath, [cli, "init", "-y"]);
run(process.execPath, [
  cli,
  "add",
  "button",
  "accordion",
  "--package-manager",
  "npm",
]);
npm("run build");
const assets = await readdir(path.join(cwd, "dist/assets"));
const cssName = assets.find((name) => name.endsWith(".css"));
assert.ok(cssName, "Vite must emit CSS");
const css = await readFile(path.join(cwd, "dist/assets", cssName), "utf8");
assert.match(css, /\.bg-kgcraft-primary/);
assert.match(css, /--kgcraft-primary/);
assert.match(css, /--primary:\s*hotpink/);
const pkg = JSON.parse(await readFile(path.join(cwd, "package.json"), "utf8"));
for (const name of [
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "framer-motion",
  "lucide-react",
])
  assert.ok(pkg.dependencies[name], `${name} must be installed by the CLI`);
console.log(
  "PASS: packed CLI, dependency installation, TypeScript, Vite production build, generated Tailwind styles and host theme preservation.",
);
console.log(`Consumer retained for inspection: ${cwd}`);
