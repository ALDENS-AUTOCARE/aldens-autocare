import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm text-neutral-300">{label}</span> : null}
      <input
        className={`w-full rounded-xl border border-[--border] bg-[--card] px-4 py-3 text-white outline-none focus:border-[--gold] ${className}`}
        {...props}
      />
    </label>
  );
}

