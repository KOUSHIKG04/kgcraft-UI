import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  cp,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createServer } from "node:http";

const execute = promisify(execFile);
const cli = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const registry = fileURLToPath(new URL("../registry/", import.meta.url));
const run = (cwd, ...args) =>
  execute(process.execPath, [cli, ...args], { cwd, timeout: 30000 });
const read = (cwd, name) => readFile(path.join(cwd, name), "utf8");
const write = async (cwd, name, value) => {
  const target = path.join(cwd, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(
    target,
    typeof value === "string" ? value : JSON.stringify(value),
  );
};
async function fixture(t, css = "src/index.css") {
  const directory = await mkdtemp(path.join(tmpdir(), "kgcraft-cli-test-"));
  t.after(async () => {
    assert.equal(path.dirname(directory), path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith("kgcraft-cli-test-"));
    await rm(directory, { recursive: true, force: true });
  });
  await write(directory, "package.json", {
    name: "external-consumer",
    private: true,
    dependencies: { react: "^19.2.0", tailwindcss: "^4.3.1" },
  });
  await write(
    directory,
    css,
    '@import "tailwindcss";\n:root { --primary: pink; }\n',
  );
  return directory;
}

test("bundled installation outside the monorepo includes all files, styles and client boundaries", async (t) => {
  const cwd = await fixture(t);
  await write(cwd, "components.json", '{"custom":"keep this"}');
  assert.match((await run(cwd, "list")).stdout, /accordion/);
  await run(cwd, "init", "-y");
  assert.equal(await read(cwd, "components.json"), '{"custom":"keep this"}');
  const result = await run(cwd, "add", "button", "accordian", "--skip-install");
  assert.match(result.stdout, /Dependencies NOT installed/);
  const button = await read(cwd, "src/components/ui/button.tsx");
  assert.match(button, /^"use client"/);
  assert.match(button, /from "\.\/kgcraft-utils"/);
  assert.doesNotMatch(button, /@repo|@\/lib/);
  assert.match(
    await read(cwd, "src/components/ui/button-variants.tsx"),
    /briskPrimary/,
  );
  assert.match(
    await read(cwd, "src/components/ui/button-variants.tsx"),
    /bg-kgcraft-primary/,
  );
  assert.match(
    await read(cwd, "src/components/ui/accordian.tsx"),
    /^"use client"/,
  );
  assert.match(
    await read(cwd, "src/components/ui/accordian.tsx"),
    /Accordian as Accordion/,
  );
  assert.match(
    await read(cwd, "src/components/ui/kgcraft-utils.ts"),
    /function cn/,
  );
  assert.doesNotMatch(
    await read(cwd, "src/components/ui/kgcraft-theme.css"),
    /\s--primary:/,
  );
  const css = await read(cwd, "src/index.css");
  assert.match(css, /--primary: pink/);
  assert.match(css, /@source "\.\/components\/ui"/);
  await run(cwd, "add", "button", "accordion", "--skip-install");
  assert.equal(await read(cwd, "src/index.css"), css);
  await assert.rejects(run(cwd, "init", "-y"), /already exists/);
});

test("supports Next-style paths and custom component directories without tsconfig aliases", async (t) => {
  const cwd = await fixture(t, "app/globals.css");
  await write(cwd, "package.json", {
    dependencies: { react: "^19", tailwindcss: "^4" },
  });
  await run(cwd, "init", "-y", "--components-dir", "design/controls");
  await run(cwd, "add", "accordion", "--skip-install");
  const css = await read(cwd, "app/globals.css");
  assert.match(css, /@import "\.\.\/design\/controls\/kgcraft-theme.css"/);
  assert.match(
    await read(cwd, "design/controls/accordian.tsx"),
    /\.\/kgcraft-utils/,
  );
});

test("conflicts abort the entire request, explicit overwrite replaces files", async (t) => {
  const cwd = await fixture(t);
  await run(cwd, "init", "-y");
  await write(cwd, "src/components/ui/button.tsx", "// user's custom button");
  const css = await read(cwd, "src/index.css");
  await assert.rejects(
    run(cwd, "add", "button", "accordion", "--skip-install"),
    /File already exists/,
  );
  assert.equal(
    await read(cwd, "src/components/ui/button.tsx"),
    "// user's custom button",
  );
  assert.equal(await read(cwd, "src/index.css"), css);
  await assert.rejects(read(cwd, "src/components/ui/accordian.tsx"), /ENOENT/);
  await run(cwd, "add", "button", "--skip-install", "--overwrite");
  assert.match(
    await read(cwd, "src/components/ui/button.tsx"),
    /React.forwardRef/,
  );
});

test("unknown names, invalid project paths, and invalid managers fail before writes", async (t) => {
  const cwd = await fixture(t);
  await assert.rejects(
    run(cwd, "init", "-y", "--components-dir", "../escape"),
    /project-relative/,
  );
  await run(cwd, "init", "-y");
  await assert.rejects(
    run(cwd, "add", "button", "missing", "--skip-install"),
    /Unknown component/,
  );
  await assert.rejects(
    run(cwd, "add", "button", "--package-manager", "bad", "--skip-install"),
    /Package manager/,
  );
  await assert.rejects(read(cwd, "src/components/ui/button.tsx"), /ENOENT/);
});

test("rejects symlink or junction write destinations", async (t) => {
  const cwd = await fixture(t);
  const outside = await fixture(t);
  await run(cwd, "init", "-y");
  await mkdir(path.join(cwd, "src/components"));
  try {
    await symlink(outside, path.join(cwd, "src/components/ui"), "junction");
  } catch (error) {
    if (error.code === "EPERM") return t.skip("Symlink privilege unavailable");
    throw error;
  }
  await assert.rejects(
    run(cwd, "add", "button", "--skip-install"),
    /symlink or junction/,
  );
  await assert.rejects(read(outside, "button.tsx"), /ENOENT/);
});

test("local registries require trust and reject unsafe files or dependency specs", async (t) => {
  const cwd = await fixture(t);
  await cp(registry, path.join(cwd, "registry"), { recursive: true });
  await run(cwd, "init", "-y", "--registry", "registry");
  await assert.rejects(
    run(cwd, "add", "button", "--skip-install"),
    /pass --yes/,
  );
  const item = JSON.parse(await read(cwd, "registry/items/button.json"));
  const validPath = item.files[0].path;
  item.files[0].path = "../../escape.ts";
  await write(cwd, "registry/items/button.json", item);
  await assert.rejects(
    run(cwd, "add", "button", "--skip-install", "-y"),
    /Error:/,
  );
  item.files[0].path = validPath;
  item.dependencies = ["--prefix=/tmp/escape"];
  await write(cwd, "registry/items/button.json", item);
  await assert.rejects(
    run(cwd, "add", "button", "--skip-install", "-y"),
    /Error:/,
  );
  await assert.rejects(read(cwd, "src/components/ui/button.tsx"), /ENOENT/);
});

test("HTTP registry downloads, missing responses and malformed payloads", async (t) => {
  const cwd = await fixture(t);
  let mode = "ok";
  const requests = [];
  const server = createServer(async (req, res) => {
    requests.push(req.url);
    if (mode === "missing") {
      res.writeHead(404);
      return res.end();
    }
    if (mode === "malformed") return res.end("not json");
    const files = {
      "/r/registry.json": "registry.json",
      "/r/items/button.json": "items/button.json",
    };
    if (!files[req.url]) {
      res.writeHead(404);
      return res.end();
    }
    res.setHeader("Content-Type", "application/json");
    res.end(await read(registry, files[req.url]));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const url = `http://127.0.0.1:${server.address().port}/r`;
  await run(cwd, "init", "-y", "--registry", url);
  await run(cwd, "add", "button", "--skip-install", "-y");
  assert.ok(requests.includes("/r/items/button.json"));
  mode = "missing";
  await assert.rejects(
    run(cwd, "add", "button", "--skip-install", "-y"),
    /HTTP 404/,
  );
  mode = "malformed";
  await assert.rejects(run(cwd, "list"), /Error:/);
  await assert.rejects(
    run(cwd, "list", "--registry", "http://example.com/r"),
    /require HTTPS/,
  );
});

test("unsupported Tailwind versions and missing global styles have actionable errors", async (t) => {
  const cwd = await fixture(t);
  await assert.rejects(
    run(cwd, "init", "-y", "--css", "missing.css"),
    /Global CSS not found/,
  );
  await write(cwd, "package.json", {
    dependencies: { react: "^19.0.0", tailwindcss: "^3.4.0" },
  });
  await assert.rejects(run(cwd, "init", "-y"), /Tailwind CSS 4/);
  await assert.rejects(read(cwd, "kgcraft-ui.json"), /ENOENT/);
});
