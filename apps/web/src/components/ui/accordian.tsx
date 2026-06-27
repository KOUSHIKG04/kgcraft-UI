import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { accordianVariants } from "./accordian-variant";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AccordianProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "content">, 
    VariantProps<typeof accordianVariants> {
  iconPosition?: "left" | "right";
  iconType?: "chevron" | "plus-minus";
  content?: React.ReactNode;
}

export const Accordian = React.forwardRef<HTMLDivElement, AccordianProps>(
  (
    {
      className,
      variant,
      iconPosition = "right",
      iconType = "chevron",
      children,
      content,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const renderIcon = () => {
      if (iconType === "plus-minus") {
        return isOpen ? (
          <Minus className="h-4 w-4 transition-transform duration-200" />
        ) : (
          <Plus className="h-4 w-4 transition-transform duration-200" />
        );
      }
      return isOpen ? (
        <ChevronUp className="h-4 w-4 transition-transform duration-200" />
      ) : (
        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
      );
    };
    return (
      <div className="w-full max-w-xl">
        <div
          className={cn(
            accordianVariants({ variant }),
            iconPosition === "left" ? "flex-row-reverse justify-end gap-3" : "",
            className,
          )}
          ref={ref}
          onClick={() => setIsOpen(!isOpen)}
          {...props}
        >
          <span>{children || "Accordion Header"}</span>
          <div className="text-muted-foreground shrink-0">{renderIcon()}</div>
        </div>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="text-muted-foreground pt-2 pb-4 text-sm leading-relaxed">
                {content || "Accordion Content goes here."}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Accordian.displayName = "Accordian";