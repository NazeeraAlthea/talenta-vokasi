// components/ui/StatusSelect.tsx

"use client";

import * as React from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

type ApplicationStatus = 'APPLIED' | 'VIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: "APPLIED", label: "Terkirim" },
  { value: "VIEWED", label: "Dilihat" },
  { value: "INTERVIEW", label: "Wawancara" },
  { value: "ACCEPTED", label: "Diterima" },
  { value: "REJECTED", label: "Ditolak" },
];

interface StatusSelectProps {
  currentStatus: ApplicationStatus;
  onStatusChange: (newStatus: ApplicationStatus) => void;
  isLoading: boolean;
}

export default function StatusSelect({ currentStatus, onStatusChange, isLoading }: StatusSelectProps) {
  return (
    <Select.Root
      value={currentStatus}
      onValueChange={onStatusChange}
      disabled={isLoading}
    >
      <Select.Trigger
        // --- PERBAIKAN DI BARIS INI: Menambahkan 'text-gray-900' ---
        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 gap-2 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
        aria-label="Ubah Status"
      >
        <Select.Value />
        <Select.Icon className="text-gray-500">
          <ChevronDown className="h-4 w-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={5}
          className="z-50 w-48 overflow-hidden rounded-md border bg-white text-gray-900 shadow-md"
        >
          <Select.Viewport className="p-1">
            {statusOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-indigo-100 data-[state=checked]:font-semibold data-[state=checked]:bg-indigo-100 data-[state=checked]:text-indigo-700"
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </span>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}