import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { highlightCode } from "./lib/highlight-code";
import {
  Accordion,
  Button,
  CommandPalette,
  Input,
  ScrambleText,
  SearchBar,
  ShimmerText,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui";
import {
  AppWindow,
  ArrowUpRight,
  Check,
  Copy,
  Code,
  FileText,
  Home,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import "./App.css";

type ComponentName =
  | "button"
  | "accordion"
  | "scramble-text"
  | "shimmer-text"
  | "search-bar"
  | "command-palette"
  | "input"
  | "tabs";
type Manager = "npm" | "pnpm" | "yarn" | "bun";
type RegistryItem = {
  dependencies: string[];
  files: { path: string; target: string; content: string }[];
};
const components = {
  tabs: {
    title: "Tabs",
    description:
      "Accessible tabs that display one panel at a time. Supports keyboard navigation, disabled tabs, and vertical layouts.",
    symbol: "Tabs, TabsList, TabsTrigger, TabsContent",
    usage:
      '<Tabs defaultValue="preview">\n  <TabsList aria-label="View">\n    <TabsTrigger value="preview">Preview</TabsTrigger>\n    <TabsTrigger value="source">Source</TabsTrigger>\n  </TabsList>\n  <TabsContent value="preview">Your preview</TabsContent>\n  <TabsContent value="source">Your source</TabsContent>\n</Tabs>',
    props: [
      [
        "defaultValue",
        "string",
        "—",
        "Initial active tab for uncontrolled usage.",
      ],
      ["value", "string", "—", "Active tab for controlled usage."],
      [
        "onValueChange",
        "(value, eventDetails) => void",
        "—",
        "Called when the active tab changes.",
      ],
      [
        "orientation",
        '"horizontal" | "vertical"',
        '"horizontal"',
        "Layout and keyboard navigation direction.",
      ],
      [
        "variant (TabsList)",
        '"default" | "line"',
        '"default"',
        "Appearance of the tab list.",
      ],
      ["disabled (TabsTrigger)", "boolean", "false", "Disables a tab."],
    ],
  },
  button: {
    title: "Button",
    description:
      "A little more character for your next call to action. Five variants, three sizes, and a subtle shine on hover.",
    symbol: "Button",
    usage: '<Button variant="briskPrimary">Get in touch</Button>',
    props: [
      [
        "variant",
        '"primary" | "secondary" | "outline" | "briskPrimary" | "briskSecondary"',
        '"primary"',
        "The appearance of the button.",
      ],
      [
        "size",
        '"sm" | "md" | "lg"',
        '"md"',
        "The height and padding of the button.",
      ],
      ["children", "ReactNode", "—", "The content inside the button."],
      ["className", "string", "—", "Additional classes for your own styling."],
      ["disabled", "boolean", "false", "Disables interaction with the button."],
    ],
  },
  accordion: {
    title: "Accordion",
    description:
      "Give your content room to breathe. A smoothly animated disclosure with two icon styles and flexible placement.",
    symbol: "Accordion",
    usage:
      '<Accordion content="Yes. The source lives in your project.">\n  Can I customize this component?\n</Accordion>',
    props: [
      [
        "children",
        "ReactNode",
        '"Accordion Header"',
        "The heading shown in the trigger.",
      ],
      [
        "content",
        "ReactNode",
        '"Accordion Content goes here."',
        "Content revealed when expanded.",
      ],
      [
        "iconType",
        '"chevron" | "plus-minus"',
        '"chevron"',
        "The icon used to indicate expansion.",
      ],
      [
        "iconPosition",
        '"left" | "right"',
        '"right"',
        "Which side of the heading holds the icon.",
      ],
      ["variant", '"default"', '"default"', "The bordered disclosure style."],
      ["className", "string", "—", "Additional classes on the trigger."],
    ],
  },
  "scramble-text": {
    title: "Scramble Text",
    description:
      "Reveal text through rapidly changing characters. Play it on mount or replay it whenever someone hovers.",
    symbol: "ScrambleText",
    usage: '<ScrambleText text="Hello World" speed={8} playOnHover />',
    props: [
      ["text", "string", "—", "The final text revealed by the animation."],
      [
        "speed",
        "number",
        "8",
        "Characters revealed per second. Higher values are faster.",
      ],
      [
        "chars",
        "string",
        "letters, numbers, symbols",
        "Characters used while scrambling.",
      ],
      [
        "playOnHover",
        "boolean",
        "false",
        "Replay on hover instead of automatically on mount.",
      ],
      ["className", "string", "—", "Additional classes for the text element."],
    ],
  },
  "shimmer-text": {
    title: "Shimmer Text",
    description:
      "A polished moving highlight for headings, labels, and loading states, with reduced-motion support built in.",
    symbol: "ShimmerText",
    usage: '<ShimmerText text="Building thoughtful interfaces" duration={2} />',
    props: [
      ["text", "string", "—", "The text that receives the shimmer effect."],
      ["duration", "number", "2", "Seconds for one shimmer pass."],
      ["repeatDelay", "number", "0.5", "Pause in seconds between passes."],
      [
        "className",
        "string",
        "—",
        "Additional classes for typography and layout.",
      ],
    ],
  },
  "search-bar": {
    title: "Search Bar",
    description:
      "A focused search field with controlled and uncontrolled modes, a clear action, and forwarded input ref.",
    symbol: "SearchBar",
    usage:
      '<SearchBar placeholder="Search components…" onChange={(event) => console.log(event.target.value)} />',
    props: [
      ["value", "string | number", "—", "Controlled input value."],
      [
        "defaultValue",
        "string | number",
        '""',
        "Initial value when uncontrolled.",
      ],
      [
        "onChange",
        "ChangeEventHandler",
        "—",
        "Runs whenever the input value changes.",
      ],
      ["onClear", "() => void", "—", "Runs when the clear button is pressed."],
      [
        "containerClassName",
        "string",
        "—",
        "Classes for the outer search container.",
      ],
      ["placeholder", "string", '"Search…"', "Placeholder shown in the input."],
    ],
  },
  "command-palette": {
    title: "Command Palette",
    description:
      "A searchable keyboard-first command dialog. Open it with Ctrl+K or Command+K and connect each item to your own action.",
    symbol: "CommandPalette",
    usage:
      '<CommandPalette\n  defaultOpen\n  items={[\n    {\n      id: "home",\n      label: "Go home",\n      onSelect: () => navigate("/"),\n    },\n  ]}\n/>',
    props: [
      [
        "items",
        "CommandPaletteItem[]",
        "—",
        "Commands displayed and searched in the palette.",
      ],
      ["open", "boolean", "—", "Controlled open state."],
      ["defaultOpen", "boolean", "false", "Initial state when uncontrolled."],
      [
        "onOpenChange",
        "(open: boolean) => void",
        "—",
        "Runs when open state changes.",
      ],
      [
        "placeholder",
        "string",
        '"Type a command or search…"',
        "Search field placeholder.",
      ],
      [
        "emptyMessage",
        "string",
        '"No commands found."',
        "Message shown for zero matches.",
      ],
    ],
  },
  input: {
    title: "Input",
    description:
      "The shadcn Base UI input for forms and data entry, including file, disabled, required, invalid, and right-to-left states.",
    symbol: "Input",
    usage: '<Input type="email" placeholder="name@example.com" />',
    props: [
      [
        "type",
        "HTMLInputTypeAttribute",
        '"text"',
        "Selects the native input behavior, such as email, password, number, search, or file.",
      ],
      ["value", "string | number", "—", "Controlled input value."],
      [
        "defaultValue",
        "string | number",
        "—",
        "Initial value for an uncontrolled input.",
      ],
      [
        "placeholder",
        "string",
        "—",
        "Short hint displayed while the input is empty.",
      ],
      ["disabled", "boolean", "false", "Disables editing and interaction."],
      ["required", "boolean", "false", "Marks the field as required."],
      [
        "aria-invalid",
        "boolean | grammar | spelling",
        "false",
        "Applies the invalid visual state and exposes validation status.",
      ],
      ["className", "string", "—", "Additional classes for the input."],
    ],
  },
} as const;
const commands: Record<Manager, string> = {
  npm: "npx shadcn@latest",
  pnpm: "pnpm dlx shadcn@latest",
  yarn: "yarn dlx shadcn@latest",
  bun: "bunx --bun shadcn@latest",
};
const registryBase = (
  import.meta.env.VITE_REGISTRY_URL ||
  new URL(`${import.meta.env.BASE_URL}r`, window.location.origin).href
).replace(/\/$/, "");

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [status, setStatus] = useState("");
  const [highlighted, setHighlighted] = useState<{
    code: string;
    tokens: Awaited<ReturnType<typeof highlightCode>>;
  } | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import("./lib/highlight-code")
      .then(({ highlightCode }) => highlightCode(code, label))
      .then((tokens) => {
        if (!cancelled) setHighlighted({ code, tokens });
      })
      .catch(() => {
        // The plain-text code remains readable if highlighting cannot load.
      });
    return () => {
      cancelled = true;
    };
  }, [code, label]);
  const lines =
    highlighted?.code === code
      ? highlighted.tokens
      : code.split("\n").map((content) => [{ content }]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied");
    } catch {
      setStatus("Select the code to copy it manually.");
    }
  }
  return (
    <div className="code-block">
      <div className="code-heading">
        <span>{label}</span>
        <button type="button" onClick={copy} aria-label={`Copy ${label}`}>
          {status === "Copied" ? <Check size={14} /> : <Copy size={14} />}
          <span>{status === "Copied" ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre>
        <code>
          {lines.map((line, index) => (
            <span className="code-line" key={index}>
              <span className="code-line-number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="code-line-content">
                {line.map((token, tokenIndex) => (
                  <span
                    key={tokenIndex}
                    style={
                      "htmlStyle" in token
                        ? (token.htmlStyle as CSSProperties)
                        : undefined
                    }
                  >
                    {token.content}
                  </span>
                ))}
                {index < lines.length - 1 ? "\n" : ""}
              </span>
            </span>
          ))}
        </code>
      </pre>
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}

export default function App() {
  const requested = new URLSearchParams(window.location.search).get(
    "component",
  );
  const name: ComponentName =
    requested && requested in components
      ? (requested as ComponentName)
      : "button";
  const component = components[name];
  const [method, setMethod] = useState<"CLI" | "Manual">("CLI");
  const [manager, setManager] = useState<Manager>("npm");
  const [item, setItem] = useState<RegistryItem | null>(null);
  const [theme, setTheme] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [search, setSearch] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [colorMode, setColorMode] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const registryUrl = `${registryBase}/${name}.json`;
  useEffect(() => {
    const dark = colorMode === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = colorMode;
    localStorage.setItem("kgcraft-theme", colorMode);
    const favicon = document.querySelector<HTMLLinkElement>("#favicon");
    if (favicon)
      favicon.href = dark ? "/favicon-dark.png" : "/favicon-light.png";
  }, [colorMode]);
  useEffect(() => {
    document.title = `${component.title} — KGCraft UI`;
    const controller = new AbortController();
    async function load() {
      try {
        setError("");
        const [source, css] = await Promise.all([
          fetch(registryUrl, { signal: controller.signal }),
          fetch(`${registryBase}/kgcraft-theme.css`, {
            signal: controller.signal,
          }),
        ]);
        if (!source.ok || !css.ok)
          throw new Error(
            "Source files could not be loaded. Check that the registry has been generated and hosted.",
          );
        const payload = (await source.json()) as RegistryItem;
        if (
          !Array.isArray(payload.files) ||
          !Array.isArray(payload.dependencies)
        )
          throw new Error("The registry returned an invalid component.");
        setItem(payload);
        setTheme(await css.text());
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : "Unable to load source files.",
          );
      }
    }
    void load();
    return () => controller.abort();
  }, [component.title, registryUrl, attempt]);
  const local =
    new URL(registryBase).hostname === "localhost" ||
    new URL(registryBase).hostname === "127.0.0.1";
  const dependencyCommand = `${manager === "npm" ? "npm install" : `${manager} add`} ${item?.dependencies.join(" ") ?? ""}`;

  return (
    <div className="docs-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="?component=button">
            <span className="brand-mark" aria-hidden="true">
              <img src="/kgcraft-logo.png" alt="" />
            </span>
            <span className="mt-0.5">
              Craft <span className="muted">UI</span>
            </span>
          </a>
          <div className="header-actions">
            <span className="header-caption">
              Small details. Better interfaces.
            </span>
            <button
              type="button"
              className="theme-toggle"
              onClick={() =>
                setColorMode((mode) => (mode === "light" ? "dark" : "light"))
              }
              aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} theme`}
              title={`Switch to ${colorMode === "light" ? "dark" : "light"} theme`}
            >
              {colorMode === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </header>
      <div className="docs-layout">
        <aside className="sidebar">
          <p className="nav-label">DOCUMENTATION</p>
          <a className="intro-link" href="#installation">
            Getting started <ArrowUpRight size={13} />
          </a>
          <p className="nav-label component-label">
            COMPONENTS{" "}
            <span>
              {String(Object.keys(components).length).padStart(2, "0")}
            </span>
          </p>
          <nav aria-label="Components">
            {(Object.keys(components) as ComponentName[])
              .sort((a, b) =>
                components[a].title.localeCompare(components[b].title),
              )
              .map((key) => (
                <a
                  key={key}
                  href={`?component=${key}`}
                  aria-current={key === name ? "page" : undefined}
                >
                  <span>{components[key].title}</span>
                  {key === name && <span className="active-dot" />}
                </a>
              ))}
          </nav>
        </aside>
        <main className="doc-main">
          <div className="title-line">
            <h1>{component.title}</h1>
            <span className="component-badge">React</span>
          </div>
          <p className="lead">{component.description}</p>
          <Tabs
            defaultValue="preview"
            className="preview-section"
            aria-label="Component preview"
          >
            <div className="section-toolbar">
              <TabsList aria-label="Preview mode" className="preview-tabs">
                <TabsTrigger value="preview">
                  <AppWindow size={16} aria-hidden="true" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="source">
                  <Code size={16} aria-hidden="true" />
                  Code
                </TabsTrigger>
              </TabsList>
              <span className="toolbar-note">
                Built with care, ready to copy.
              </span>
            </div>
            <TabsContent value="preview">
              <div className="preview-canvas">
                {name === "tabs" && (
                  <Tabs defaultValue="account" className="w-full max-w-sm">
                    <TabsList aria-label="Account settings">
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                      <TabsTrigger value="disabled" disabled>
                        Disabled
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className="p-4 text-sm">
                      Manage your account settings.
                    </TabsContent>
                    <TabsContent value="password" className="p-4 text-sm">
                      Update your password.
                    </TabsContent>
                  </Tabs>
                )}
                {name === "button" && (
                  <div className="button-demo">
                    <Button
                      variant="briskPrimary"
                      onClick={() => setClicks(clicks + 1)}
                    >
                      Get in touch <ArrowUpRight size={15} className="ml-2" />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setClicks(clicks + 1)}
                    >
                      Secondary
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setClicks(clicks + 1)}
                    >
                      Outline
                    </Button>
                    <span className="demo-feedback" role="status">
                      {clicks > 0
                        ? `Clicked ${clicks} ${clicks === 1 ? "time" : "times"}`
                        : "Hover or click to try it out"}
                    </span>
                  </div>
                )}
                {name === "accordion" && (
                  <div className="accordion-demo">
                    <Accordion
                      content="Absolutely. Install the source with shadcn, then change anything you need."
                      iconType="plus-minus"
                    >
                      Can I make it my own?
                    </Accordion>
                    <Accordion content="The component, supporting files, dependencies, and theme variables.">
                      What does the CLI install?
                    </Accordion>
                  </div>
                )}
                {name === "scramble-text" && (
                  <div className="text-effect-demo scramble-demo">
                    <ScrambleText
                      text="Geist meets thoughtful motion"
                      speed={8}
                      playOnHover
                    />
                    <span>Hover the text to replay</span>
                  </div>
                )}
                {name === "shimmer-text" && (
                  <div className="text-effect-demo">
                    <ShimmerText
                      text="Building thoughtful interfaces"
                      className="text-2xl font-semibold"
                    />
                    <span>The animation respects reduced-motion settings</span>
                  </div>
                )}
                {name === "search-bar" && (
                  <div className="search-demo">
                    <SearchBar
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      onClear={() => setSearch("")}
                      placeholder="Search components…"
                    />
                    <span role="status">
                      {search
                        ? `Searching for “${search}”`
                        : "Start typing to search"}
                    </span>
                  </div>
                )}
                {name === "command-palette" && (
                  <div className="command-demo">
                    <Button
                      variant="outline"
                      onClick={() => setPaletteOpen(true)}
                    >
                      Open command palette <kbd>Ctrl K</kbd>
                    </Button>
                    <CommandPalette
                      open={paletteOpen}
                      onOpenChange={setPaletteOpen}
                      items={[
                        {
                          id: "home",
                          label: "Go home",
                          description: "Return to the KGCraft overview",
                          icon: <Home size={16} />,
                          shortcut: "G H",
                        },
                        {
                          id: "docs",
                          label: "Open documentation",
                          description: "Read component installation guides",
                          icon: <FileText size={16} />,
                        },
                        {
                          id: "settings",
                          label: "Open settings",
                          description: "Change your workspace preferences",
                          icon: <Settings size={16} />,
                        },
                      ]}
                    />
                  </div>
                )}
                {name === "input" && (
                  <div className="input-demo">
                    <div className="input-demo-field">
                      <label htmlFor="input-demo-email">Email</label>
                      <Input
                        id="input-demo-email"
                        type="email"
                        placeholder="name@example.com"
                        aria-describedby="input-demo-email-description"
                      />
                      <span id="input-demo-email-description">
                        We’ll only use this address for account updates.
                      </span>
                    </div>
                    <div className="input-demo-row">
                      <Input placeholder="Disabled" disabled />
                      <Input
                        defaultValue="Invalid value"
                        aria-invalid="true"
                        aria-label="Invalid example"
                      />
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      aria-label="Upload a profile picture"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="source">
              {item ? (
                <CodeBlock
                  code={item.files[0]?.content ?? ""}
                  label={`${name} source`}
                />
              ) : (
                <p className="loading">Loading source…</p>
              )}
            </TabsContent>
          </Tabs>
          {error && (
            <div className="load-error" role="alert">
              {error}{" "}
              <button type="button" onClick={() => setAttempt(attempt + 1)}>
                Retry
              </button>
            </div>
          )}
          <section id="installation" className="doc-section">
            <div className="section-title">
              <h2>Installation</h2>
            </div>
            <Tabs
              value={method}
              onValueChange={(value) => {
                if (value === "CLI" || value === "Manual") setMethod(value);
              }}
            >
              <TabsList aria-label="Installation method">
                {(["CLI", "Manual"] as const).map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent key={method} value={method}>
                <p className="body-copy">
                  {method === "CLI"
                    ? "Add the component to your project with the shadcn CLI."
                    : "Prefer to do it yourself? Copy the source and keep full control."}
                </p>
                <Tabs
                  value={manager}
                  onValueChange={(value) => {
                    if (typeof value === "string" && value in commands)
                      setManager(value as Manager);
                  }}
                >
                  <TabsList aria-label="Package manager">
                    {(Object.keys(commands) as Manager[]).map((pm) => (
                      <TabsTrigger key={pm} value={pm}>
                        {pm}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsContent key={manager} value={manager}>
                    {method === "CLI" ? (
                      <>
                        <CodeBlock
                          key={manager}
                          code={`${commands[manager]} add ${registryUrl}`}
                          label="Install command"
                        />
                        <p className="install-note">
                          Already using shadcn? You’re ready. Otherwise run{" "}
                          <code>{commands[manager]} init</code> first. Requires
                          Tailwind CSS 4.
                        </p>
                        {local && (
                          <p className="local-notice">
                            Local preview: this URL works on this computer.
                            Deploy the site to share a public install URL.
                          </p>
                        )}
                      </>
                    ) : item ? (
                      <div className="manual-steps">
                        <h3>1. Install dependencies</h3>
                        <CodeBlock
                          key={manager}
                          code={dependencyCommand}
                          label="Dependencies"
                        />
                        <h3>2. Copy the component files</h3>
                        <p className="body-copy">
                          Place all files together in your configured UI
                          directory (usually <code>src/components/ui</code>).
                        </p>
                        {item.files.map((file) => (
                          <div className="manual-disclosure" key={file.path}>
                            <Accordion
                              content={
                                <CodeBlock
                                  code={file.content}
                                  label={file.target.replace("@ui/", "")}
                                />
                              }
                            >
                              {file.target.replace("@ui/", "components/ui/")}
                            </Accordion>
                          </div>
                        ))}
                        <h3>3. Add the theme</h3>
                        <p className="body-copy">
                          Add this once to your global Tailwind stylesheet,
                          after <code>{'@import "tailwindcss";'}</code>. Keep
                          the stylesheet imported by your app.
                        </p>
                        <div className="manual-disclosure">
                          <Accordion
                            content={
                              <CodeBlock code={theme} label="Theme CSS" />
                            }
                          >
                            Global CSS — KGCraft theme
                          </Accordion>
                        </div>
                      </div>
                    ) : (
                      <p className="loading">Loading installation files…</p>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </section>
          <section id="usage" className="doc-section">
            <div className="section-title">
              <h2>Usage</h2>
            </div>
            <CodeBlock
              code={`import { ${component.symbol} } from "@/components/ui/kgcraft-${name}"`}
              label="Import"
            />
            <div className="usage-example">
              <CodeBlock code={component.usage} label="Usage example" />
            </div>
            <p className="install-note">
              The import above uses shadcn’s default UI alias. Your{" "}
              <code>components.json</code> controls the installed directory.
              KGCraft filenames are prefixed to preserve existing components.
            </p>
          </section>
          <section id="props" className="doc-section">
            <div className="section-title">
              <h2>Props</h2>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {component.props.map(
                    ([property, type, fallback, description]) => (
                      <tr key={property}>
                        <td>
                          <code>{property}</code>
                        </td>
                        <td>
                          <code>{type}</code>
                        </td>
                        <td>
                          <code>{fallback}</code>
                        </td>
                        <td>{description}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            <p className="install-note">
              These are source components. After shadcn installs them, read the
              generated file, change a prop, and experiment with the behavior.
            </p>
          </section>
          <footer className="doc-footer">
            <span>Crafted by Koushik. Made to be yours.</span>
            <a href={registryUrl}>
              View registry JSON <ArrowUpRight size={13} />
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
