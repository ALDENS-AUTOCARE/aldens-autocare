import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm text-neutral-300">{label}</span> : null}
      <textarea
        className={`w-full rounded-xl border border-[--border] bg-[--card] px-4 py-3 text-white outline-none focus:border-[--gold] ${className}`}
        {...props}
      />
    </label>
  );
}

