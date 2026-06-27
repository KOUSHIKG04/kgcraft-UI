#!/usr/bin/env node
import { Command } from "commander";
import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import { z } from "zod";
import ora from "ora";
import kleur from "kleur";

const program = new Command();

program
  .name("my-ui")
  .description("Install components from your UI registry")
  .version("0.1.0");

// Zod Schema to validate our registry components
const registryItemSchema = z.object({
  name: z.string(),
  dependencies: z.array(z.string()).optional(),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    }),
  ),
});

// Helper to find the monorepo root directory
function findMonorepoRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return startDir;
}

// COMMAND 1: init
program
  .command("init")
  .description("Initialize your project configuration")
  .action(async () => {
    const response = await prompts([
      {
        type: "text",
        name: "componentDir",
        message: "Where would you like to install the components?",
        initial: "src/components/ui",
      },
    ]);

    const config = {
      $schema: "https://ui.shadcn.com/schema/config.json",
      style: "default",
      rsc: true,
      tsx: true,
      tailwind: {
        config: "tailwind.config.js",
        css: "src/index.css",
      },
      aliases: {
        components: response.componentDir,
        utils: "@/lib/utils",
      },
    };

    await fs.writeJSON(path.join(process.cwd(), "components.json"), config, {
      spaces: 2,
    });
    console.log(kleur.green("✔ Created components.json configuration file!"));
  });

// COMMAND 2: add
program
  .command("add")
  .argument("[components...]", "components to add")
  .option("-o, --overwrite", "overwrite existing files", false)
  .description("Add components to your project")
  .action(async (components, options) => {
    // 1. Read components.json
    const configPath = path.join(process.cwd(), "components.json");
    if (!fs.existsSync(configPath)) {
      console.log(
        kleur.red(
          "✖ components.json not found. Please run 'my-ui init' first.",
        ),
      );
      return;
    }
    const config = await fs.readJSON(configPath);
    const targetDir = path.resolve(process.cwd(), config.aliases.components);

    // If no specific component was named, prompt the user
    let componentsToInstall = components;
    if (!componentsToInstall || componentsToInstall.length === 0) {
      const response = await prompts({
        type: "multiselect",
        name: "selected",
        message: "Which components would you like to add?",
        choices: [
          { title: "Button", value: "button" },
          { title: "Accordion", value: "accordian" },
        ],
        min: 1,
      });
      componentsToInstall = response.selected;
    }

    const monorepoRoot = findMonorepoRoot(process.cwd());
    const registryItemsPath = path.join(
      monorepoRoot,
      "packages",
      "registry",
      "items",
    );

    for (const component of componentsToInstall) {
      const spinner = ora(`Installing ${component}...`).start();
      const componentJsonPath = path.join(
        registryItemsPath,
        `${component}.json`,
      );

      if (!fs.existsSync(componentJsonPath)) {
        spinner.fail(`Component "${component}" not found in registry.`);
        continue;
      }

      try {
        // Read & Validate Registry JSON
        const rawJson = await fs.readJSON(componentJsonPath);
        const item = registryItemSchema.parse(rawJson);

        // Write files
        for (const file of item.files) {
          // Resolve write path (e.g. src/components/ui/button.tsx)
          const fileBase = path.basename(file.path);
          const writePath = path.join(targetDir, fileBase);

          if (fs.existsSync(writePath) && !options.overwrite) {
            spinner.info(
              `Skipped ${fileBase} (file already exists. Use --overwrite to replace).`,
            );
            continue;
          }

          await fs.ensureDir(path.dirname(writePath));
          await fs.writeFile(writePath, file.content);
        }

        // Install required npm dependencies
        if (item.dependencies && item.dependencies.length > 0) {
          spinner.text = `Installing dependencies for ${component}: ${item.dependencies.join(", ")}...`;

          // Detect if we should use pnpm, npm, or yarn
          const hasPnpm =
            fs.existsSync(path.join(process.cwd(), "pnpm-lock.yaml")) ||
            fs.existsSync(path.join(monorepoRoot, "pnpm-lock.yaml"));
          const pkgManager = hasPnpm ? "pnpm" : "npm";
          const installArg = hasPnpm ? "add" : "install";

          await execa(pkgManager, [installArg, ...item.dependencies], {
            cwd: process.cwd(),
          });
        }

        spinner.succeed(`Successfully installed ${component}!`);
      } catch (err: any) {
        spinner.fail(`Failed to install ${component}: ${err.message}`);
      }
    }
  });

program.parse();
