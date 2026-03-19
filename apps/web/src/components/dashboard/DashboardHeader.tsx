type Props = {
  title: string;
  subtitle?: string;
};

export function DashboardHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle ? <p className="mt-2 text-neutral-400">{subtitle}</p> : null}
    </div>
  );
}

