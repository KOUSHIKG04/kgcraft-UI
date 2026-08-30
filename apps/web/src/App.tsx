import { useEffect, useState } from "react";
import {
  Accordion,
  Button,
  CommandPalette,
  ScrambleText,
  SearchBar,
  ShimmerText,
} from "@repo/ui";
import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Home,
  Settings,
  Terminal,
} from "lucide-react";
import "./App.css";

type ComponentName =
  | "button"
  | "accordion"
  | "scramble-text"
  | "shimmer-text"
  | "search-bar"
  | "command-palette";
type Manager = "npm" | "pnpm" | "yarn" | "bun";
type RegistryItem = {
  dependencies: string[];
  files: { path: string; target: string; content: string }[];
};
const components = {
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
      '<CommandPalette defaultOpen items={[{ id: "home", label: "Go home", onSelect: () => navigate("/") }]} />',
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
        <code>{code}</code>
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
  const [preview, setPreview] = useState<"Preview" | "Source">("Preview");
  const [item, setItem] = useState<RegistryItem | null>(null);
  const [theme, setTheme] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [search, setSearch] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const registryUrl = `${registryBase}/${name}.json`;
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
        <a className="brand" href="?component=button">
          <span className="brand-mark">K</span>
          <span>
            KGCraft <span className="muted">UI</span>
          </span>
        </a>
        <span className="header-caption">
          Small details. Better interfaces.
        </span>
        <a
          className="github-link"
          href="https://github.com/KOUSHIKG04/kgcraft-UI"
          target="_blank"
          rel="noreferrer"
        >
          <Terminal size={17} />
          <span>Source</span>
          <ArrowUpRight size={14} />
        </a>
      </header>
      <div className="docs-layout">
        <aside className="sidebar">
          <p className="nav-label">DOCUMENTATION</p>
          <a className="intro-link" href="#installation">
            Getting started <ArrowUpRight size={13} />
          </a>
          <p className="nav-label component-label">
            COMPONENTS <span>06</span>
          </p>
          <nav aria-label="Components">
            {(Object.keys(components) as ComponentName[]).map((key) => (
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
          <div className="sidebar-note">
            <Terminal size={18} />
            <strong>Your code. Your components.</strong>
            <p>
              Install with shadcn.
              <br />
              Make it your own.
            </p>
          </div>
        </aside>
        <main className="doc-main">
          <div className="breadcrumb">
            Components <span>/</span> <span>{component.title}</span>
          </div>
          <div className="title-line">
            <h1>{component.title}</h1>
            <span className="component-badge">React</span>
          </div>
          <p className="lead">{component.description}</p>
          <section className="preview-section" aria-label="Component preview">
            <div className="section-toolbar">
              <div className="segmented" role="group" aria-label="Preview mode">
                {(["Preview", "Source"] as const).map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    aria-pressed={preview === tab}
                    onClick={() => setPreview(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <span className="toolbar-note">
                Built with care, ready to copy.
              </span>
            </div>
            {preview === "Preview" ? (
              <div className="preview-canvas">
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
                  <div className="text-effect-demo">
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
              </div>
            ) : item ? (
              <CodeBlock
                code={item.files[0]?.content ?? ""}
                label={`${name} source`}
              />
            ) : (
              <p className="loading">Loading source…</p>
            )}
          </section>
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
              <span className="section-number">01</span>
              <h2>Installation</h2>
            </div>
            <div
              className="method-tabs"
              role="group"
              aria-label="Installation method"
            >
              {(["CLI", "Manual"] as const).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  aria-pressed={method === tab}
                  onClick={() => setMethod(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <p className="body-copy">
              {method === "CLI"
                ? "Add the component to your project with the shadcn CLI."
                : "Prefer to do it yourself? Copy the source and keep full control."}
            </p>
            <div
              className="package-tabs"
              role="group"
              aria-label="Package manager"
            >
              {(Object.keys(commands) as Manager[]).map((pm) => (
                <button
                  type="button"
                  key={pm}
                  aria-pressed={manager === pm}
                  onClick={() => setManager(pm)}
                >
                  {pm}
                </button>
              ))}
            </div>
            {method === "CLI" ? (
              <>
                <CodeBlock
                  key={manager}
                  code={`${commands[manager]} add ${registryUrl}`}
                  label="Install command"
                />
                <p className="install-note">
                  Already using shadcn? You’re ready. Otherwise run{" "}
                  <code>{commands[manager]} init</code> first. Requires Tailwind
                  CSS 4.
                </p>
                {local && (
                  <p className="local-notice">
                    Local preview: this URL works on this computer. Deploy the
                    site to share a public install URL.
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
                  Place all files together in your configured UI directory
                  (usually <code>src/components/ui</code>).
                </p>
                {item.files.map((file) => (
                  <details key={file.path}>
                    <summary>
                      {file.target.replace("@ui/", "components/ui/")}
                    </summary>
                    <CodeBlock
                      code={file.content}
                      label={file.target.replace("@ui/", "")}
                    />
                  </details>
                ))}
                <h3>3. Add the theme</h3>
                <p className="body-copy">
                  Add this once to your global Tailwind stylesheet, after{" "}
                  <code>{'@import "tailwindcss";'}</code>. Keep the stylesheet
                  imported by your app.
                </p>
                <details>
                  <summary>Global CSS — KGCraft theme</summary>
                  <CodeBlock code={theme} label="Theme CSS" />
                </details>
              </div>
            ) : (
              <p className="loading">Loading installation files…</p>
            )}
          </section>
          <section id="usage" className="doc-section">
            <div className="section-title">
              <span className="section-number">02</span>
              <h2>Usage</h2>
            </div>
            <p className="body-copy">Import the component:</p>
            <CodeBlock
              code={`import { ${component.symbol} } from "@/components/ui/kgcraft-${name}"`}
              label="Import"
            />
            <p className="body-copy usage-label">Use it in your code:</p>
            <CodeBlock code={component.usage} label="Usage example" />
            <p className="install-note">
              The import above uses shadcn’s default UI alias. Your{" "}
              <code>components.json</code> controls the installed directory.
              KGCraft filenames are prefixed to preserve existing components.
            </p>
          </section>
          <section id="props" className="doc-section">
            <div className="section-title">
              <span className="section-number">03</span>
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
        <aside className="page-nav">
          <p className="nav-label">ON THIS PAGE</p>
          <a href="#installation">Installation</a>
          <a href="#usage">Usage</a>
          <a href="#props">Props</a>
          <div className="compatibility">
            <span className="active-dot" /> shadcn compatible
          </div>
        </aside>
      </div>
    </div>
  );
}
