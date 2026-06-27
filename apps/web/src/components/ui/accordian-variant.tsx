import { cva } from "class-variance-authority";

export const accordianVariants = cva(
  "flex cursor-pointer items-center justify-between py-3 font-medium transition-all select-none hover:underline",
  {
    variants: {
      variant: {
        default: "border-border border-b",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);