import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
execFileSync(process.execPath, [path.join(root, "scripts/build-registry.mjs")]);
const json = async (file) =>
  JSON.parse(await readFile(path.join(root, file), "utf8"));

const componentNames = [
  "button",
  "accordion",
  "scramble-text",
  "shimmer-text",
  "search-bar",
  "command-palette",
];

for (const name of componentNames) {
  test(`${name}: public shadcn payload is self-contained and theme-safe`, async () => {
    const item = await json(`apps/web/public/r/${name}.json`);
    assert.deepEqual(item, await json(`packages/registry/shadcn/${name}.json`));
    assert.ok(
      item.files.some((file) => file.target === `@ui/kgcraft-${name}.tsx`),
    );
    assert.ok(
      item.files.some((file) => file.target === "@ui/kgcraft-utils.ts"),
    );
    for (const file of item.files) {
      assert.doesNotMatch(file.content, /@repo\/|\.\.\/\.\.\/lib\/utils/);
      assert.ok(file.target.startsWith("@ui/kgcraft-"));
      assert.ok(
        !file.path.endsWith(".css"),
        "shadcn must merge cssVars, not leave an unimported CSS file",
      );
      for (const [, relative] of file.content.matchAll(
        /from "\.\/([^".]+)"/g,
      )) {
        assert.ok(
          item.files.some(
            (entry) =>
              entry.target === `@ui/${relative}.ts` ||
              entry.target === `@ui/${relative}.tsx`,
          ),
          `Missing relative dependency: ${relative}`,
        );
      }
    }
    assert.equal(
      item.cssVars.theme["color-kgcraft-primary"],
      "var(--kgcraft-primary)",
    );
    assert.ok(item.cssVars.light["kgcraft-primary"]);
    assert.ok(item.cssVars.dark["kgcraft-primary"]);
    assert.ok(!Object.hasOwn(item.cssVars.light, "primary"));
  });
}
test("catalog and typo alias match flat installation URLs", async () => {
  const catalog = await json("apps/web/public/r/registry.json");
  for (const item of catalog.items)
    assert.deepEqual(item, await json(`apps/web/public/r/${item.name}.json`));
  const alias = await json("apps/web/public/r/accordian.json");
  assert.deepEqual(
    alias.files,
    (await json("apps/web/public/r/accordion.json")).files,
  );
});
