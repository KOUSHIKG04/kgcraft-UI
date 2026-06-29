import { Button } from "@repo/ui";
import { ThemeToggle } from "./components/ThemeToggle";
import { cn } from "./lib/utils";

const App = () => {
  return (
    <div className="bg-background text-foreground relative flex h-screen w-screen items-center justify-center transition-colors duration-300">
      <div className="absolute top-40 right-80">
        <ThemeToggle />
      </div>

      <div
        className={cn(
          "transition-border relative rounded-xs border border-neutral-200 bg-neutral-100 px-40 py-40 duration-300 perspective-[1000px] transform-3d dark:border-neutral-800",
          "bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[20px_20px] bg-fixed [--pattern-fg:var(--color-neutral-800)]/5 dark:bg-neutral-800 dark:[--pattern-fg:var(--color-white)]/10",
        )}
      >
        <Button
          variant="briskPrimary"
          className="rounded-xs bg-neutral-600 text-white dark:bg-neutral-500 dark:text-neutral-100"
        >
          Button Component
        </Button>
      </div>
    </div>
  );
};

export default App;
