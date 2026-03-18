import type { ReactNode } from "react";
import React, { forwardRef } from "react";
import * as AccordionComp from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";

import { cn } from "./utils";

interface AccordionItemProps
  extends Omit<React.ComponentProps<typeof AccordionComp.Item>, "ref"> {
  children: React.ReactNode;
}

interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
}
const Accordion = ({ children, className }: AccordionProps) => (
  <AccordionComp.Root
    className={cn(
      "bg-mauve6 rounded-md shadow-[0_2px_10px] shadow-black/5",
      className,
    )}
    collapsible
    defaultValue="item-1"
    type="single"
  >
    {children}
  </AccordionComp.Root>
);

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <AccordionComp.Item
      className={cn(
        "focus-within:shadow-mauve12 mt-px overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]",
        className,
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </AccordionComp.Item>
  ),
);

AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, icon, ...props }, forwardedRef) => (
    <AccordionComp.Header className="flex">
      <AccordionComp.Trigger
        className={cn(
          "text-violet11 shadow-mauve6 hover:bg-mauve2 group flex h-[45px] flex-1 cursor-default  items-center justify-between bg-white px-5 text-[15px] leading-none shadow-[0_1px_0] outline-none",
          className,
        )}
        {...props}
        ref={forwardedRef}
      >
        {children}
        {icon ? (
          icon
        ) : (
          <ChevronDownIcon
            aria-hidden="true"
            className="text-violet10 ease-[cubic-bezier(0.87, 0, 0.13, 1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
          />
        )}
      </AccordionComp.Trigger>
    </AccordionComp.Header>
  ),
);

AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <AccordionComp.Content
      className={cn(
        "text-mauve11 bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-[15px]",
        className,
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="px-5 py-[15px]">{children}</div>
    </AccordionComp.Content>
  ),
);

AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionTrigger, AccordionItem, AccordionContent };
