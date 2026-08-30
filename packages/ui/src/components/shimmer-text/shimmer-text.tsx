"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ShimmerTextProps extends Omit<
  HTMLMotionProps<"span">,
  "children"
> {
  text: string;
  duration?: number;
  repeatDelay?: number;
}

export function ShimmerText({
  text,
  duration = 2,
  repeatDelay = 0.5,
  className,
  ...props
}: ShimmerTextProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={cn(
        "inline-block bg-[linear-gradient(110deg,var(--foreground,#171717)_35%,var(--kgcraft-primary,#eab308)_50%,var(--foreground,#171717)_65%)] bg-[length:250%_100%] bg-clip-text text-transparent",
        className,
      )}
      initial={{ backgroundPosition: "100% center" }}
      animate={{
        backgroundPosition: reduceMotion ? "50% center" : "-100% center",
      }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration, repeat: Infinity, repeatDelay, ease: "linear" }
      }
      {...props}
    >
      {text}
    </motion.span>
  );
}
