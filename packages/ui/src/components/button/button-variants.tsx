import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "focus-visible:ring-ring hover:-translate-x-0.1 inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition transition-colors duration-150 text-shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-98 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-secondary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground border",
        briskPrimary:
          "text-secondary-foreground after=[''] bg-primary relative overflow-hidden after:absolute after:-top-5 after:-left-3 after:h-[100px] after:w-[40px] after:-translate-x-20 after:rotate-10 after:bg-neutral-50/22 after:[mask-image:linear-gradient(to_right,transparent,black_40%,black_60%,transparent)] after:backdrop-blur-[0.15px] after:transition-all after:duration-750 hover:after:translate-x-[350%]",
        briskSecondary:
          "border-input text-secondary-foreground after=[''] bg-secondary relative overflow-hidden after:absolute after:-top-5 after:-left-3 after:h-[100px] after:w-[40px] after:-translate-x-20 after:rotate-10 after:bg-neutral-400/22 after:[mask-image:linear-gradient(to_right,transparent,black_40%,black_60%,transparent)] after:transition-all after:duration-1050 hover:after:translate-x-[350%]",
      },
      size: {
        sm: "h-8 rounded-md px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
