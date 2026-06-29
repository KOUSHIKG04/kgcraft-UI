import { Sun, Moon } from "lucide-react";
import { Button } from "@repo/ui";
import { useTheme } from "../ThemeContext";
import { cn } from "../lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { toggleTheme } = useTheme();

  return (
    <Button
      className={cn(
        "border-border relative size-9 rounded-xs border shadow-sm shadow-neutral-800/20 dark:shadow-neutral-800",
        className,
      )}
      variant="secondary"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      <Sun className="absolute size-5 scale-100 rotate-0 transition-all duration-300 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-5 scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:rotate-0" />
    </Button>
  );
};
