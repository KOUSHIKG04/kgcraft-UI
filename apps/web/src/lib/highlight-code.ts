import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const highlighter = createHighlighterCore({
  themes: [
    import("shiki/themes/github-light.mjs"),
    import("shiki/themes/github-dark.mjs"),
  ],
  langs: [
    import("shiki/langs/tsx.mjs"),
    import("shiki/langs/typescript.mjs"),
    import("shiki/langs/css.mjs"),
    import("shiki/langs/bash.mjs"),
  ],
  engine: createJavaScriptRegexEngine(),
});

export async function highlightCode(code: string, label: string) {
  const lang = /command|dependencies/i.test(label)
    ? "bash"
    : /css/i.test(label)
      ? "css"
      : /\.ts$/.test(label)
        ? "typescript"
        : "tsx";
  return (await highlighter).codeToTokens(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
  }).tokens;
}
