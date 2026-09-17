const steps = [
  {
    number: "01",
    title: "Discover",
    description: "Search restaurants and menus by the food or location that interests you.",
  },
  {
    number: "02",
    title: "Compare",
    description: "Review restaurant details, menu prices, ratings, and customer experiences.",
  },
  {
    number: "03",
    title: "Share",
    description: "Create an account and contribute an honest, moderated dining review.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="bg-zinc-950 px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            About DineRate
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            A clearer way to choose your next dining experience
          </h2>
          <p className="mt-5 text-lg leading-8 text-zinc-300">
            DineRate connects diners with restaurants through searchable menus,
            structured ratings, honest reviews, and moderated conversations.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
              <span className="text-sm font-bold text-orange-400">{step.number}</span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 leading-7 text-zinc-400">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
