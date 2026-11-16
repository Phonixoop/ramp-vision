"use client";

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/shadcn/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/shadcn/popover";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { Badge } from "~/components/shadcn/badge";
// import Button  from "~/ui/buttons";

type MultiSelectContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValues: Set<string>;
  toggleValue: (value: string) => void;
  items: Map<string, ReactNode>;
  onItemAdded: (value: string, label: ReactNode) => void;
};
const MultiSelectContext = createContext<MultiSelectContextType | null>(null);

export function MultiSelect({
  children,
  values,
  defaultValues,
  onValuesChange,
  singleSelect = false,
}: {
  children: ReactNode;
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
  singleSelect?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(
    new Set<string>(values ?? defaultValues),
  );
  const [items, setItems] = useState<Map<string, ReactNode>>(new Map());

  // update selectedValues on values change
  useEffect(() => {
    setSelectedValues(new Set(values ?? defaultValues));
  }, [values, defaultValues]);

  function toggleValue(value: string) {
    if (singleSelect) {
      setSelectedValues(new Set([value]));
      onValuesChange?.([value]);
      return;
    }
    const getNewSet = (prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    };
    setSelectedValues(getNewSet);
    onValuesChange?.([...getNewSet(selectedValues)]);
  }

  const onItemAdded = useCallback((value: string, label: ReactNode) => {
    setItems((prev) => {
      if (prev.get(value) === label) return prev;
      return new Map(prev).set(value, label);
    });
  }, []);

  const selected =
    values != null ? new Set(values) : selectedValues;

  return (
    <MultiSelectContext.Provider
      value={{
        open,
        setOpen,
        selectedValues: selected,
        toggleValue,
        items,
        onItemAdded,
      }}
    >
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  );
}

export function MultiSelectTrigger({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<typeof Button>) {
  const { open } = useMultiSelectContext();

  return (
    <PopoverTrigger asChild>
      <Button
        {...props}
        variant={props.variant ?? "outline"}
        role={props.role ?? "combobox"}
        aria-expanded={props["aria-expanded"] ?? open}
        className={cn(
          "w-full",
          "shadow-xs min-h-9 border-primary/10 focus-visible:ring-primary/50 aria-invalid:border-primary  aria-invalid:ring-primary/20 ",
          "bg-secbuttn data-[placeholder]:text-primary/50 hover:bg-secbuttn/50 aria-invalid:ring-primary/40  ",
          "flex h-auto items-center justify-between gap-2 overflow-hidden whitespace-nowrap [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-primary/50",
          "rounded-xl border  px-3 py-1.5 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] ",
          "disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          className,
        )}
      >
        {children}
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
}

export function MultiSelectValue({
  placeholder,
  clickToRemove = true,
  className,
  overflowBehavior = "wrap-when-open",
  ...props
}: {
  placeholder?: string;
  clickToRemove?: boolean;
  overflowBehavior?: "wrap" | "wrap-when-open" | "cutoff";
} & Omit<ComponentPropsWithoutRef<"div">, "children">) {
  const { selectedValues, toggleValue, items, open } = useMultiSelectContext();
  const [overflowAmount, setOverflowAmount] = useState(0);
  const valueRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  const shouldWrap =
    overflowBehavior === "wrap" ||
    (overflowBehavior === "wrap-when-open" && open);

  const measuringRef = useRef(false);
  const overflowAmountRef = useRef(0);

  const checkOverflowRef = useRef(() => {
    if (valueRef.current == null || measuringRef.current) return;
    if (shouldWrap) {
      if (overflowAmountRef.current !== 0) {
        overflowAmountRef.current = 0;
        setOverflowAmount(0);
      }
      return;
    }

    measuringRef.current = true;
    const containerElement = valueRef.current;
    const overflowElement = overflowRef.current;
    const itemNodes = containerElement.querySelectorAll<HTMLElement>(
      "[data-selected-item]",
    );

    if (overflowElement != null) overflowElement.style.display = "none";
    itemNodes.forEach((child) => child.style.removeProperty("display"));
    let amount = 0;
    for (let i = itemNodes.length - 1; i >= 0; i--) {
      const child = itemNodes[i];
      if (!child) continue;
      if (containerElement.scrollWidth <= containerElement.clientWidth) {
        break;
      }
      amount = itemNodes.length - i;
      child.style.display = "none";
      overflowElement?.style.removeProperty("display");
    }

    if (overflowAmountRef.current !== amount) {
      overflowAmountRef.current = amount;
      setOverflowAmount(amount);
    }
    // Defer unlock so ResizeObserver callbacks from our own style tweaks are ignored.
    requestAnimationFrame(() => {
      measuringRef.current = false;
    });
  });

  useLayoutEffect(() => {
    const rafId = requestAnimationFrame(() => checkOverflowRef.current());
    return () => cancelAnimationFrame(rafId);
  }, [selectedValues, shouldWrap, items]);

  useEffect(() => {
    const node = valueRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (measuringRef.current) return;
      checkOverflowRef.current();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [selectedValues.size, shouldWrap]);

  if (selectedValues.size === 0 && placeholder) {
    return (
      <span className="min-w-0 overflow-hidden font-normal text-primary">
        {placeholder}
      </span>
    );
  }

  return (
    <div
      {...props}
      ref={valueRef}
      className={cn(
        " flex max-h-48 w-full gap-1.5 overflow-hidden overflow-y-auto",
        shouldWrap && "h-full flex-wrap",
        className,
      )}
    >
      {[...selectedValues].map((value) => (
        <Badge
          variant="outline"
          data-selected-item
          className=" group flex items-center gap-1"
          key={value}
          onClick={
            clickToRemove
              ? (e) => {
                  e.stopPropagation();
                  toggleValue(value);
                }
              : undefined
          }
        >
          {items.get(value) ?? value}

          {clickToRemove && (
            <XIcon className="size-2 text-primary/50 group-hover:text-accent" />
          )}
        </Badge>
      ))}
      <Badge
        style={{
          display: overflowAmount > 0 && !shouldWrap ? "block" : "none",
        }}
        variant="outline"
        ref={overflowRef}
      >
        +{overflowAmount}
      </Badge>
    </div>
  );
}

export function MultiSelectContent({
  search = true,
  children,
  ...props
}: {
  search?: boolean | { placeholder?: string; emptyMessage?: string };
  children: ReactNode;
  maxItems?: number;
} & Omit<ComponentPropsWithoutRef<typeof Command>, "children">) {
  const { open } = useMultiSelectContext();
  const canSearch = typeof search === "object" ? true : search;

  // Only mount option nodes while open. Mounting every item (esp. town/branch
  // lists) while the parent filter popover opens caused UI freezes via
  // per-item registration setState storms.
  if (!open) return null;

  return (
    <PopoverContent
      dir="rtl"
      className="min-w-[var(--radix-popover-trigger-width)] p-0"
      onOpenAutoFocus={(event) => event.preventDefault()}
    >
      <Command {...props}>
        {canSearch ? <CommandInput placeholder={"جستجو"} /> : null}

        <CommandList className="max-h-[300px] overflow-y-auto">
          {canSearch && (
            <CommandEmpty>
              {typeof search === "object" ? search.emptyMessage : undefined}
            </CommandEmpty>
          )}
          {children}
        </CommandList>
      </Command>
    </PopoverContent>
  );
}

export function MultiSelectItem({
  value,
  children,
  badgeLabel,
  onSelect,
  ...props
}: {
  badgeLabel?: ReactNode;
  value: string;
} & Omit<ComponentPropsWithoutRef<typeof CommandItem>, "value">) {
  const { toggleValue, selectedValues, onItemAdded } = useMultiSelectContext();
  const isSelected = selectedValues.has(value);

  useEffect(() => {
    onItemAdded(value, badgeLabel ?? children);
  }, [value, onItemAdded]);

  return (
    <CommandItem
      {...props}
      value={value}
      onSelect={(v) => {
        toggleValue(v);
        onSelect?.(v);
      }}
      className="flex items-center justify-start gap-2"
      dir="rtl"
    >
      <CheckIcon
        className={cn("size-4 ", isSelected ? "opacity-100" : "opacity-0")}
      />
      {children}
    </CommandItem>
  );
}

export function MultiSelectGroup(
  props: ComponentPropsWithoutRef<typeof CommandGroup>,
) {
  return <CommandGroup {...props} />;
}

export function MultiSelectSeparator(
  props: ComponentPropsWithoutRef<typeof CommandSeparator>,
) {
  return <CommandSeparator {...props} />;
}

function useMultiSelectContext() {
  const context = useContext(MultiSelectContext);
  if (context == null) {
    throw new Error(
      "useMultiSelectContext must be used within a MultiSelectContext",
    );
  }
  return context;
}
