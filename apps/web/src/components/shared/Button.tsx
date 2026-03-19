import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition";
  const styles = {
    primary: "bg-[--gold] text-black hover:opacity-90",
    secondary: "bg-white text-black hover:opacity-90",
    ghost: "border border-[--border] text-white hover:bg-white/5",
  };

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

