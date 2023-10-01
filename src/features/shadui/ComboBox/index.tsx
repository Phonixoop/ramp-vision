"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

type Input = {
  label: string;
  value: string;
};
export function ComboBox({
  value = "",
  values = [],
  onChange = (value) => {},
  placeHolder = "",
  rest,
}: {
  value: string;
  values?: Input[];
  onChange?: (value) => unknown;
  placeHolder?: string;
  rest?: any;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between bg-secondary text-primary hover:bg-primbuttn hover:text-secbuttn"
        >
          {value
            ? values.find((item) => item.value === value)?.label
            : placeHolder}
          <ChevronsUpDown className="mr-0 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] bg-secondary p-0 text-primary">
        <Command>
          <CommandInput className="mr-2" placeholder={placeHolder} />
          <CommandEmpty>پیدا نشد</CommandEmpty>
          <CommandGroup>
            {values.map((item) => (
              <CommandItem
                className="bg-secondary text-primary aria-selected:bg-primbuttn aria-selected:text-secbuttn hover:bg-primbuttn hover:text-secbuttn"
                key={item.value}
                onSelect={(currentValue) => {
                  const v = values.find(
                    (item) => item.label === currentValue
                  ).value;
                  onChange(v);

                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "ml-2 h-4 w-4 stroke-accent text-primbuttn",
                    value === item.value ? " opacity-100" : "opacity-0"
                  )}
                />
                {value === item.value + "s"}
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
