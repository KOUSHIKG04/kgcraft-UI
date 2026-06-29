import { Sun, Moon } from "lucide-react";
import { Button } from "@repo/ui";
import { useTheme } from "../ThemeContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className="focus-visible:ring-primary relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xs border border-neutral-50 bg-white p-0 shadow-sm transition-all duration-300 hover:scale-105 focus-visible:ring-2 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900"
      aria-label="Toggle theme"
    >
      <span
        className={`absolute inset-0 flex transform items-center justify-center transition-all duration-500 ${
          theme === "dark"
            ? "scale-0 rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100"
        }`}
      >
        <Sun className="h-5 w-5 transition-colors duration-300" />
      </span>

      <span
        className={`absolute inset-0 flex transform items-center justify-center transition-all duration-500 ${
          theme === "light"
            ? "scale-0 -rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100"
        }`}
      >
        <Moon className="h-5 w-5 transition-colors duration-300" />
      </span>
    </Button>
  );
};
