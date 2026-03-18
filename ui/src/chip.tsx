import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import React from "react";
import { cva } from "class-variance-authority";

import { cn } from "./utils";

const chipVariants = cva(
  "flex items-center justify-center gap-1 rounded-sm p-2 text-sm font-medium leading-3",
  {
    variants: {
      variant: {
        available: "bg-available text-available-foreground",
        processing: "bg-processing text-processing-foreground",
        finished: "bg-finished text-finished-foreground",
        awaiting_analysis: "bg-analysis text-analysis-foreground",
        disabled: "bg-gray-200 text-zinc-500",
        selected: "bg-selected text-selected-foreground",
        notSelected: "bg-notSelected text-notSelected-foreground",
        substituted: "bg-substituted text-substituted-foreground",
      },
    },
  },
);

interface ChipProps
  extends ComponentProps<"div">,
    VariantProps<typeof chipVariants> {}

export const Chip: React.FC<ChipProps> = ({ className, variant, ...props }) => {
  return (
    <div className={cn(chipVariants({ variant, className }))} {...props} />
  );
};
