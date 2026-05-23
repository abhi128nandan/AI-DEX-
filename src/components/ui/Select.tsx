"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════
   Premium Dark-Themed Select — Radix Primitives
   Inspired by shadcn/ui + Vercel design system
   ═══════════════════════════════════════════ */

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    icon?: React.ReactNode;
  }
>(({ className, children, icon, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between gap-2 rounded-xl",
      "bg-white/[0.04] border border-white/[0.08]",
      "px-4 py-2.5 text-[13px] font-medium text-slate-200",
      "shadow-sm shadow-black/20",
      "transition-all duration-200 ease-out",
      "hover:bg-white/[0.07] hover:border-white/[0.14]",
      "focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[placeholder]:text-slate-500",
      "[&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    <span className="flex items-center gap-2 truncate">
      {icon && <span className="text-slate-500 shrink-0">{icon}</span>}
      {children}
    </span>
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4 text-slate-500" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4 text-slate-500" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-[200] max-h-[320px] min-w-[8rem] overflow-hidden",
        "rounded-xl border border-white/[0.08]",
        "bg-[#0e0e18]/95 backdrop-blur-xl",
        "shadow-2xl shadow-black/50",
        "text-slate-200",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      style={{
        animation: 'selectFadeIn 0.15s ease-out',
      }}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1.5",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    icon?: React.ReactNode;
    count?: number;
  }
>(({ className, children, icon, count, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center",
      "rounded-lg py-2.5 pl-3 pr-8",
      "text-[13px] font-medium text-slate-300",
      "outline-none transition-all duration-150",
      "hover:bg-white/[0.06] hover:text-white",
      "focus:bg-white/[0.06] focus:text-white",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
      "data-[state=checked]:bg-purple-500/10 data-[state=checked]:text-purple-300",
      className
    )}
    {...props}
  >
    <span className="flex items-center gap-2.5 flex-1 truncate">
      {icon && <span className="text-slate-500 shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span>}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      {count !== undefined && (
        <span className="ml-auto text-[10px] font-mono tabular-nums text-slate-600 shrink-0">
          {count}
        </span>
      )}
    </span>
    <span className="absolute right-2.5 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-purple-400" />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("mx-1 my-1 h-px bg-white/[0.06]", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
