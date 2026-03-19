export function ServicesPreview() {
  const items = [
    "Essential Care",
    "Signature Detail",
    "Executive Finish",
  ];

  return (
    <section className="container-page py-12">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="card p-6">
            <h3 className="text-xl font-semibold">{item}</h3>
            <p className="mt-2 text-neutral-400">
              Premium detailing service designed to protect, restore, and elevate your vehicle.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

