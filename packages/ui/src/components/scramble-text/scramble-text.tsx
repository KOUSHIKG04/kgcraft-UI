"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export interface ScrambleTextProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  text: string;
  speed?: number;
  chars?: string;
  playOnHover?: boolean;
}

export function ScrambleText({
  text,
  speed = 8,
  chars = DEFAULT_CHARS,
  playOnHover = false,
  className,
  onMouseEnter,
  ...props
}: ScrambleTextProps) {
  const [output, setOutput] = React.useState(text);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const play = React.useCallback(() => {
    stop();
    if (
      !chars.length ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setOutput(text);
      return;
    }

    const characters = text.split("");
    let activeIndex = 0;
    let scrambleFrame = 0;

    setOutput(
      characters
        .map((character) => (character === " " ? " " : "\u00a0"))
        .join(""),
    );

    function tick() {
      while (characters[activeIndex] === " ") activeIndex += 1;
      if (activeIndex >= characters.length) {
        setOutput(text);
        stop();
        return;
      }

      setOutput(
        characters
          .map((character, index) => {
            if (character === " " || index < activeIndex) return character;
            if (index === activeIndex)
              return chars[Math.floor(Math.random() * chars.length)];
            return "\u00a0";
          })
          .join(""),
      );

      scrambleFrame += 1;
      if (scrambleFrame >= 3) {
        activeIndex += 1;
        scrambleFrame = 0;
      }
      const frameDelay = Math.max(
        10,
        Math.round(1000 / (Math.max(1, speed) * 3)),
      );
      timeoutRef.current = setTimeout(tick, frameDelay);
    }

    tick();
  }, [chars, speed, stop, text]);

  React.useEffect(() => {
    if (!playOnHover) play();
    return stop;
  }, [play, playOnHover, stop]);

  return (
    <span
      className={cn(
        "relative inline-block font-[Geist,Geist_Sans,ui-sans-serif,system-ui,sans-serif] tracking-tight whitespace-pre",
        className,
      )}
      {...props}
      aria-label={props["aria-label"] ?? text}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (playOnHover) play();
      }}
    >
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0" aria-hidden="true">
        {output}
      </span>
    </span>
  );
}
