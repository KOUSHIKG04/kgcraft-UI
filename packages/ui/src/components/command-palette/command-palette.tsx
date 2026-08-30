"use client";

import * as React from "react";
import { Command, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  items: CommandPaletteItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function CommandPalette({
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  placeholder = "Type a command or search…",
  emptyMessage = "No commands found.",
  className,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const isOpen = open ?? internalOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
      if (!next) setQuery("");
    },
    [onOpenChange, open],
  );

  React.useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!isOpen);
      }
      if (event.key === "Escape" && isOpen) setOpen(false);
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [isOpen, setOpen]);

  const filtered = items.filter((item) =>
    `${item.label} ${item.description ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  function select(item: CommandPaletteItem | undefined) {
    if (!item) return;
    item.onSelect?.();
    setOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pt-[15vh]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={cn(
          "border-border bg-background w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl",
          className,
        )}
      >
        <div className="border-border flex items-center gap-3 border-b px-4">
          <Search className="text-muted-foreground h-4 w-4" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((index) =>
                  Math.min(index + 1, Math.max(0, filtered.length - 1)),
                );
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                select(filtered[activeIndex]);
              }
            }}
            placeholder={placeholder}
            className="placeholder:text-muted-foreground h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground rounded-sm"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2" role="listbox">
          {filtered.length ? (
            filtered.map((item, index) => (
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                key={item.id}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => select(item)}
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                  index === activeIndex && "bg-accent text-accent-foreground",
                )}
              >
                <span className="text-muted-foreground grid h-5 w-5 place-items-center">
                  {item.icon ?? <Command className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{item.label}</span>
                  {item.description ? (
                    <span className="text-muted-foreground block truncate text-xs">
                      {item.description}
                    </span>
                  ) : null}
                </span>
                {item.shortcut ? (
                  <kbd className="border-border text-muted-foreground rounded border px-1.5 py-0.5 text-[10px]">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </button>
            ))
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {emptyMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
