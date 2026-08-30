import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import prompts from "prompts";
import { z } from "zod";

const configName = "kgcraft-ui.json";
const bundled = fileURLToPath(new URL("../registry/", import.meta.url));
const nameSchema = z.string().regex(/^[a-z][a-z0-9-]*$/);
const configSchema = z.object({
  version: z.literal(1),
  componentsDir: z.string(),
  css: z.string(),
  registry: z.string().default("bundled"),
});
const dependencySchema = z
  .string()
  .regex(
    /^(?:@[a-z0-9-]+\/)?[a-z0-9][a-z0-9._-]*@(?:\^|~)?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/,
  );
const itemSchema = z.object({
  name: nameSchema,
  type: z.literal("registry:ui"),
  title: z.string(),
  dependencies: z.array(dependencySchema).default([]),
  files: z
    .array(
      z.object({
        path: z
          .string()
          .regex(/^components\/ui\/[a-z][a-z0-9-]*\.(?:tsx?|css)$/),
        type: z.literal("registry:ui"),
        content: z.string().max(1_000_000),
      }),
    )
    .min(1),
});
const catalogSchema = z.object({
  items: z.array(z.object({ name: nameSchema, title: z.string() })).min(1),
});
type Config = z.infer<typeof configSchema>;
type InitOptions = {
  yes?: boolean;
  componentsDir?: string;
  css?: string;
  registry?: string;
};
type InstallOptions = {
  yes?: boolean;
  overwrite?: boolean;
  skipInstall?: boolean;
  registry?: string;
  packageManager?: string;
};

// Reject traversal, hidden/protected folders, and symlinks/junctions before writes.
async function projectPath(cwd: string, relative: string): Promise<string> {
  const parts = relative.replaceAll("\\", "/").split("/");
  if (
    parts.some(
      (part) =>
        !/^[a-zA-Z0-9][a-zA-Z0-9._ -]*$/.test(part) ||
        part.toLowerCase() === "node_modules",
    )
  )
    throw new Error(
      `Use a normal project-relative path without .. or hidden folders: ${relative}`,
    );
  let resolved = cwd;
  for (const part of parts) {
    resolved = path.join(resolved, part);
    try {
      if ((await fs.lstat(resolved)).isSymbolicLink())
        throw new Error(
          `Refusing to write through a symlink or junction: ${relative}`,
        );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return resolved;
}

async function project(cwd: string) {
  if (!(await fs.pathExists(path.join(cwd, "package.json"))))
    throw new Error(
      "Run this command from your application's directory containing package.json.",
    );
  const pkg = await fs.readJSON(path.join(cwd, "package.json"));
  const dependencies: Record<string, string> = {
    ...pkg.peerDependencies,
    ...pkg.devDependencies,
    ...pkg.dependencies,
  };
  if (!dependencies.react)
    throw new Error("This installer requires a React project.");
  if (
    !dependencies.tailwindcss ||
    !/^[~^]?4(?:\.(?:\d+|x|\*)){0,2}$/.test(dependencies.tailwindcss)
  )
    throw new Error(
      "Set up Tailwind CSS 4 first (tailwindcss version ^4.x). This installer targets React + TypeScript + Tailwind CSS 4.",
    );
  return { pkg, dependencies };
}

async function readConfig(cwd: string): Promise<Config> {
  const target = await projectPath(cwd, configName);
  if (!(await fs.pathExists(target)))
    throw new Error(
      "Run 'kgcraft-ui init' first. Existing components.json files are left untouched.",
    );
  return configSchema.parse(await fs.readJSON(target));
}

function registryLocation(cwd: string, source: string): string {
  if (source === "bundled") return bundled;
  if (/^https?:/i.test(source)) {
    const url = new URL(source);
    if (url.username || url.password || url.search || url.hash)
      throw new Error(
        "Registry URLs cannot contain credentials, queries, or fragments.",
      );
    if (
      url.protocol !== "https:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
      throw new Error(
        "Remote registries require HTTPS. HTTP is allowed only for localhost development.",
      );
    return url.href.replace(/\/$/, "") + "/";
  }
  if (source.includes("://")) throw new Error("Unsupported registry protocol.");
  return path.resolve(cwd, source);
}

async function registryJson(location: string, file: string): Promise<unknown> {
  if (!/^https?:/.test(location)) return fs.readJSON(path.join(location, file));
  const url = new URL(file, location);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    redirect: "error",
  });
  if (!response.ok)
    throw new Error(
      `Registry request failed: HTTP ${response.status} for ${url}`,
    );
  if (!response.body) throw new Error("Registry returned an empty response.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 2_000_000)
        throw new Error("Registry response exceeds the 2 MB limit.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function listComponents(cwd: string, override?: string) {
  const configFile = await projectPath(cwd, configName);
  const source =
    override ??
    ((await fs.pathExists(configFile))
      ? (await readConfig(cwd)).registry
      : "bundled");
  return catalogSchema.parse(
    await registryJson(registryLocation(cwd, source), "registry.json"),
  ).items;
}

async function globalCss(cwd: string, config: Config) {
  const target = await projectPath(cwd, config.css);
  if (path.extname(target) !== ".css" || !(await fs.pathExists(target)))
    throw new Error(
      `Global CSS not found: ${config.css}. Pass --css with your existing Tailwind stylesheet.`,
    );
  const content = await fs.readFile(target, "utf8");
  if (!/@import\s+["']tailwindcss(?:\/[^"']*)?["']/.test(content))
    throw new Error(
      `${config.css} must import Tailwind CSS 4 with @import "tailwindcss";`,
    );
  return { target, content };
}

export async function initialize(cwd: string, options: InitOptions) {
  await project(cwd);
  const configFile = await projectPath(cwd, configName);
  if (await fs.pathExists(configFile))
    throw new Error(
      `${configName} already exists. Edit it to change settings; it was not overwritten.`,
    );
  const prefix = (await fs.pathExists(path.join(cwd, "src"))) ? "src/" : "";
  let css = options.css;
  for (const candidate of [
    "src/app/globals.css",
    "app/globals.css",
    "src/index.css",
    "src/globals.css",
    "src/styles/globals.css",
    "styles/globals.css",
  ]) {
    if (!css && (await fs.pathExists(path.join(cwd, candidate))))
      css = candidate;
  }
  let componentsDir = options.componentsDir ?? `${prefix}components/ui`;
  if (!options.yes && process.stdin.isTTY) {
    const response = await prompts([
      {
        type: "text",
        name: "componentsDir",
        message: "Component directory",
        initial: componentsDir,
      },
      {
        type: "text",
        name: "css",
        message: "Global Tailwind stylesheet",
        initial: css ?? `${prefix}index.css`,
      },
    ]);
    if (!response.componentsDir || !response.css)
      throw new Error("Initialization cancelled.");
    componentsDir = response.componentsDir;
    css = response.css;
  }
  if (!css)
    throw new Error(
      "Could not detect global CSS. Pass --css <path> to your Tailwind stylesheet.",
    );
  const config = configSchema.parse({
    version: 1,
    componentsDir,
    css,
    registry: options.registry ?? "bundled",
  });
  await projectPath(cwd, config.componentsDir);
  await globalCss(cwd, config);
  registryLocation(cwd, config.registry);
  await fs.writeFile(configFile, JSON.stringify(config, null, 2) + "\n", {
    flag: "wx",
  });
  console.log(`Created ${configName}. Next: kgcraft-ui add button accordion`);
}

async function packageManager(cwd: string, configured?: string) {
  const allowed = ["npm", "pnpm", "yarn", "bun"];
  if (configured) {
    if (!allowed.includes(configured))
      throw new Error("Package manager must be npm, pnpm, yarn, or bun.");
    return configured;
  }
  let directory = cwd;
  while (true) {
    const pkgPath = path.join(directory, "package.json");
    if (await fs.pathExists(pkgPath)) {
      const manager = (await fs.readJSON(pkgPath)).packageManager?.split(
        "@",
      )[0];
      if (allowed.includes(manager)) return manager as string;
    }
    for (const [lock, manager] of [
      ["pnpm-lock.yaml", "pnpm"],
      ["yarn.lock", "yarn"],
      ["bun.lock", "bun"],
      ["bun.lockb", "bun"],
      ["package-lock.json", "npm"],
    ] as const) {
      if (await fs.pathExists(path.join(directory, lock))) return manager;
    }
    const parent = path.dirname(directory);
    if (parent === directory) return "npm";
    directory = parent;
  }
}

function relativeImport(from: string, to: string) {
  const value = path.relative(path.dirname(from), to).split(path.sep).join("/");
  return value.startsWith(".") ? value : `./${value}`;
}

export async function install(
  cwd: string,
  names: string[],
  options: InstallOptions,
) {
  const { dependencies } = await project(cwd);
  const config = await readConfig(cwd);
  const source = options.registry ?? config.registry;
  const location = registryLocation(cwd, source);
  if (source !== "bundled" && !options.yes) {
    if (!process.stdin.isTTY)
      throw new Error(
        "External registries supply executable source and npm dependencies. Review the registry, then pass --yes to trust it.",
      );
    const response = await prompts({
      type: "confirm",
      name: "trust",
      message: `Trust source code and dependencies from ${source}?`,
      initial: false,
    });
    if (!response.trust) throw new Error("Installation cancelled.");
  }
  const selected = [
    ...new Set(
      names.map((name) => (name === "accordian" ? "accordion" : name)),
    ),
  ];
  selected.forEach((name) => nameSchema.parse(name));
  const catalog = catalogSchema.parse(
    await registryJson(location, "registry.json"),
  );
  const planned = new Map<string, string>();
  const required = new Set<string>();
  const dir = await projectPath(cwd, config.componentsDir);
  const css = await globalCss(cwd, config);
  const manager = await packageManager(cwd, options.packageManager);
  for (const name of selected) {
    if (!catalog.items.some((item) => item.name === name))
      throw new Error(`Unknown component: ${name}. Run 'kgcraft-ui list'.`);
    const item = itemSchema.parse(
      await registryJson(location, `items/${name}.json`),
    );
    if (item.name !== name)
      throw new Error(`Registry item name does not match ${name}.`);
    for (const file of item.files) {
      const target = await projectPath(
        cwd,
        `${config.componentsDir}/${path.posix.basename(file.path)}`,
      );
      if (target === css.target)
        throw new Error(
          "The component file cannot replace your global stylesheet.",
        );
      const content = file.content.replaceAll("\r\n", "\n");
      if (planned.has(target) && planned.get(target) !== content)
        throw new Error(`Conflicting registry files: ${file.path}`);
      planned.set(target, content);
    }
    item.dependencies.forEach((dependency) => required.add(dependency));
  }
  const theme = path.join(dir, "kgcraft-theme.css");
  if (!planned.has(theme))
    throw new Error("Registry items must include kgcraft-theme.css.");
  // Check the whole request before installing packages or writing component files.
  for (const [target, content] of planned) {
    if (
      (await fs.pathExists(target)) &&
      !options.overwrite &&
      (await fs.readFile(target, "utf8")).replaceAll("\r\n", "\n") !== content
    )
      throw new Error(
        `File already exists with different content: ${path.relative(cwd, target)}. Review your changes, then use --overwrite if intended.`,
      );
  }
  const missing = [...required].filter(
    (spec) => !dependencies[spec.slice(0, spec.lastIndexOf("@"))],
  );
  if (missing.length && !options.skipInstall) {
    console.log(
      `Installing dependencies with ${manager}: ${missing.join(" ")}`,
    );
    await execa(manager, [manager === "npm" ? "install" : "add", ...missing], {
      cwd,
      stdio: "inherit",
    });
  }
  for (const [target, content] of planned) {
    await fs.ensureDir(path.dirname(target));
    await fs.writeFile(target, content);
  }
  const themeImport = relativeImport(css.target, theme);
  const sourcePath = relativeImport(css.target, dir);
  let nextCss = css.content;
  const imports = [...nextCss.matchAll(/@import\s+["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  if (!imports.includes(themeImport))
    nextCss = `@import "${themeImport}";\n${nextCss}`;
  const sourceRule = `@source "${sourcePath}";`;
  if (!nextCss.includes(sourceRule))
    nextCss = `${nextCss.trimEnd()}\n\n${sourceRule}\n`;
  if (nextCss !== css.content) await fs.writeFile(css.target, nextCss);
  console.log(
    `Installed ${selected.join(", ")} in ${config.componentsDir}. Theme connected in ${config.css}.`,
  );
  if (missing.length && options.skipInstall)
    console.log(
      `Dependencies NOT installed. Run: ${manager} ${manager === "npm" ? "install" : "add"} ${missing.join(" ")}`,
    );
}
