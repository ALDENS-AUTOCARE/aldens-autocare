export function WhyChooseUs() {
  const points = [
    "Professional mobile service",
    "Premium detailing standards",
    "Convenient home and office visits",
    "Fleet-ready systems",
  ];

  return (
    <section className="container-page py-12">
      <div className="card p-8">
        <h2 className="text-2xl font-bold">Why choose Alden&apos;s AutoCare?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {points.map((point) => (
            <div key={point} className="rounded-xl border border-[--border] p-4">
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

