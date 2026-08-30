"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SearchBarProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      containerClassName,
      value,
      defaultValue,
      onChange,
      onClear,
      placeholder = "Search…",
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      String(defaultValue ?? ""),
    );
    const currentValue = value === undefined ? internalValue : String(value);

    function change(event: React.ChangeEvent<HTMLInputElement>) {
      if (value === undefined) setInternalValue(event.target.value);
      onChange?.(event);
    }

    function clear() {
      if (value === undefined) setInternalValue("");
      onClear?.();
    }

    return (
      <div
        className={cn(
          "border-input bg-background focus-within:border-ring/60 focus-within:ring-ring/20 flex h-10 w-full items-center gap-2 rounded-md border px-3 shadow-sm transition-[border-color,box-shadow] focus-within:ring-1",
          containerClassName,
        )}
      >
        <Search className="text-muted-foreground h-4 w-4 shrink-0" />
        <input
          ref={ref}
          type="search"
          value={currentValue}
          onChange={change}
          placeholder={placeholder}
          className={cn(
            "placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden",
            className,
          )}
          {...props}
        />
        {currentValue && !props.disabled ? (
          <button
            type="button"
            onClick={clear}
            className="text-muted-foreground hover:text-foreground rounded-sm"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";
