type BadgeProps = {
  text: string;
};

export function Badge({ text }: BadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-[--border] px-3 py-1 text-xs text-neutral-300">
      {text}
    </span>
  );
}

