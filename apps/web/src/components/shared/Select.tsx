import React from "react";

type Option = {
  value: string;
  label: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export function Select({ label, options, className = "", ...props }: SelectProps) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm text-neutral-300">{label}</span> : null}
      <select
        className={`w-full rounded-xl border border-[--border] bg-[--card] px-4 py-3 text-white outline-none focus:border-[--gold] ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-black text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

