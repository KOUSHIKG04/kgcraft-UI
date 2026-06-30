import { Button } from "@repo/ui";
import { cn } from "@/lib/utils";

const PatternBgWithButton = () => {
  return (
    <div
      className={cn(
        "transition-border relative rounded-xs border border-neutral-200 bg-neutral-100 px-40 py-40 duration-300 perspective-[1000px] transform-3d dark:border-neutral-800 dark:bg-neutral-800",
        // "mask-t-from-50% mask-t-to-90% mask-r-from-70% mask-r-to-95% mask-b-from-50% mask-b-to-90% mask-l-from-70% mask-l-to-95%",
        "bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[20px_20px] bg-fixed [--pattern-fg:var(--color-neutral-800)]/5 dark:bg-neutral-900 dark:[--pattern-fg:var(--color-neutral-500)]/5",
      )}
    >
      <Button
        variant="briskPrimary"
        className="rounded-xs bg-neutral-600 text-white dark:bg-neutral-500 dark:text-neutral-100"
      >
        Button Component
      </Button>
    </div>
  );
};

export default PatternBgWithButton;
