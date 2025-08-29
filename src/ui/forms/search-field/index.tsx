"use client";

import { SearchIcon } from "lucide-react";

interface SearchFieldProps {
  value?: string;
  title?: string;
  onChange?: (value: string) => void;
}

export default function SearchField({
  value = "",
  title = "",
  onChange = (value) => {},
}: SearchFieldProps) {
  return (
    <div dir="rtl" className="flex w-full rounded-xl bg-gray-50/80">
      <div className="caret-atysa-secondry flex w-full flex-row-reverse items-center justify-end  gap-3 rounded-2xl px-4  py-3 md:flex-grow ">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-right placeholder-gray-400 outline-none"
          placeholder={title}
        />
        <span className="h-4 w-[1px] bg-gray-400"></span>
        <SearchIcon className="h-4 w-4 fill-gray-400" />
      </div>
    </div>
  );
}
