#!/usr/bin/env node
import { Command } from "commander";
import prompts from "prompts";
import { initialize, install, listComponents } from "./installer.js";

const program = new Command()
  .name("kgcraft-ui")
  .description(
    "Install editable KGCraft UI components into React + Tailwind CSS 4 projects",
  )
  .version("0.2.0");

program
  .command("init")
  .description(
    "Create kgcraft-ui.json, preserving existing shadcn configuration",
  )
  .option("-y, --yes", "use detected defaults")
  .option("--components-dir <path>", "project-relative component directory")
  .option("--css <path>", "existing global Tailwind stylesheet")
  .option(
    "--registry <source>",
    "bundled, a local directory, or an HTTPS registry URL",
  )
  .action(async (options) => {
    await initialize(process.cwd(), options);
  });

program
  .command("list")
  .description("List available components")
  .option("--registry <source>", "override the configured registry")
  .action(async (options) => {
    for (const item of await listComponents(process.cwd(), options.registry))
      console.log(`${item.name}\t${item.title}`);
  });

program
  .command("add")
  .argument(
    "[components...]",
    "button, accordion (legacy accordian is also accepted)",
  )
  .option("-y, --yes", "trust the selected external registry")
  .option("-o, --overwrite", "replace conflicting component files")
  .option("--skip-install", "copy files without installing dependencies")
  .option("--registry <source>", "override the configured registry")
  .option("--package-manager <manager>", "npm, pnpm, yarn, or bun")
  .action(async (components: string[], options) => {
    if (!components.length) {
      if (!process.stdin.isTTY)
        throw new Error(
          "Specify components, for example: kgcraft-ui add button accordion",
        );
      const items = await listComponents(process.cwd(), options.registry);
      const response = await prompts({
        type: "multiselect",
        name: "items",
        message: "Which components?",
        choices: items.map((item) => ({ title: item.title, value: item.name })),
        min: 1,
      });
      components = response.items;
      if (!components?.length) throw new Error("Installation cancelled.");
    }
    await install(process.cwd(), components, options);
  });

program.parseAsync().catch((error: unknown) => {
  console.error(
    `Error: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
