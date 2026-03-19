type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="card p-6 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-2 text-neutral-400">{description}</p> : null}
    </div>
  );
}

