"use client";

import { useState, useRef, useEffect } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
}

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  multiple = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (!multiple) {
      const option = options.find((o) => o.value === selectedValues[0]);
      return option?.label || placeholder;
    }
    if (selectedValues.length === 1) {
      const option = options.find((o) => o.value === selectedValues[0]);
      return option?.label || "1 selected";
    }
    return `${selectedValues.length} selected`;
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : "");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
        {label}
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`
          w-full min-w-[160px] flex items-center justify-between gap-2
          px-3 py-2.5 text-sm
          bg-zinc-50 dark:bg-zinc-800/50
          border border-zinc-200 dark:border-zinc-700
          rounded-lg
          text-left
          cursor-pointer
          transition-all duration-200
          hover:border-zinc-300 dark:hover:border-zinc-600
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
          ${isOpen ? "ring-2 ring-blue-500/50 border-blue-500" : ""}
        `}
      >
        <span
          className={`truncate ${
            selectedValues.length === 0
              ? "text-zinc-400 dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {getDisplayText()}
        </span>
        <div className="flex items-center gap-1">
          {selectedValues.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full min-w-[200px] max-h-[280px] overflow-auto
            bg-white dark:bg-zinc-800
            border border-zinc-200 dark:border-zinc-700
            rounded-lg shadow-xl
            animate-dropdown"
        >
          <div className="p-1">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md
                    transition-colors duration-100
                    ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50"
                    }
                  `}
                >
                  {multiple && (
                    <div
                      className={`
                        w-4 h-4 rounded border flex items-center justify-center
                        transition-colors duration-100
                        ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-zinc-300 dark:border-zinc-600"
                        }
                      `}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
