import Image from "next/image";
import Link from "next/link";

const steps = [
  { title: "Find a place", description: "Search by restaurant, location, or the dish you’re craving. Find somewhere that fits your next meal." },
  { title: "Get the full picture", description: "Explore menus, prices, photos, and customer ratings before deciding where to go." },
  { title: "Share your experience", description: "Leave a thoughtful review, rate what matters, and join the conversation after your visit." },
];

const values = [
  { title: "More than a star rating", description: "Food quality, service, value, cleanliness, ambience, and variety give each dining experience more context." },
  { title: "Room for conversation", description: "Customers and restaurant owners can respond to reviews, helping turn feedback into a useful conversation." },
  { title: "Thoughtful moderation", description: "Reviews and comments are checked before publication to keep the conversation constructive." },
];

const questions = [
  { title: "Do I need an account to browse?", answer: "You can explore restaurants, menus, photos, and published reviews without signing in. Create an account when you’re ready to share your own experience or add a comment." },
  { title: "When will my review or comment appear?", answer: "Reviews and comments are submitted for moderation before they appear publicly. This also applies to responses from restaurant owners." },
  { title: "Can I review a particular dish?", answer: "Yes. You can share feedback on menu items as well as your overall restaurant experience." },
];

export function AboutContent() {
  return <>
    <section className="overflow-hidden bg-brand-soft px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">About DineRate</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-panel-text sm:text-5xl lg:text-6xl">Good food.<br />Better choices.<br /><span className="text-brand">Shared experiences.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-panel-muted">A great meal starts with knowing where to go. DineRate brings restaurants, menus, and customer experiences together so you can choose with more confidence.</p>
          <Link href="/restaurants" className="workspace-button workspace-button-primary mt-7 rounded-full px-6 py-3.5">Find your next restaurant <span aria-hidden="true">→</span></Link>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="workspace-card p-7 shadow-lg shadow-stone-200/40 sm:p-9">
            <div className="flex items-center gap-4"><Image src="/dinerate-logo.png" alt="" width={72} height={72} className="size-18 object-contain" /><div><p className="text-2xl font-bold text-panel-text">Dine<span className="text-brand">Rate</span></p><p className="mt-1 text-sm text-panel-muted">Every dining experience matters.</p></div></div>
            <div className="mt-7 border-t border-panel-border pt-6"><p className="text-sm font-semibold text-panel-text">What makes a memorable meal?</p><div className="mt-4 grid grid-cols-2 gap-3">{["Food quality", "Customer service", "Value for money", "Cleanliness", "Ambience", "Variety"].map(label => <span key={label} className="rounded-xl bg-brand-soft px-3 py-3 text-sm text-panel-text"><span aria-hidden="true" className="mr-2 text-brand">✦</span>{label}</span>)}</div></div>
            <p className="mt-6 text-sm leading-6 text-panel-muted">Look beyond the menu. Discover the details that make a place right for you.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-panel-surface px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">Made for your next meal</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-panel-text">From curiosity to a table worth trying.</h2><p className="mt-4 leading-7 text-panel-muted">Whether you’re looking for a familiar favourite or somewhere new, a little context makes choosing easier.</p></div>
        <div className="mt-7 grid gap-5 md:grid-cols-3">{steps.map((step, index) => <article key={step.title} className="workspace-card bg-brand-soft p-6"><span className="flex size-10 items-center justify-center rounded-full bg-brand-action text-sm font-semibold text-white">0{index + 1}</span><h3 className="mt-5 text-lg font-bold text-panel-text">{step.title}</h3><p className="mt-3 text-sm leading-7 text-panel-muted">{step.description}</p></article>)}</div>
      </div>
    </section>

    <section className="bg-stone-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">The details make the difference</p><h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight">Helpful feedback. A better conversation.</h2>
        <div className="mt-7 grid gap-6 md:grid-cols-3">{values.map(value => <article key={value.title} className="rounded-2xl border border-white/10 bg-white/5 p-6"><h3 className="text-lg font-semibold">{value.title}</h3><p className="mt-3 text-sm leading-7 text-zinc-200">{value.description}</p></article>)}</div>
      </div>
    </section>

    <section className="bg-brand-soft px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.4fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink">A few things to know</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-panel-text">Before you pull up a chair.</h2></div>
        <div className="space-y-3">{questions.map(question => <details key={question.title} className="workspace-card p-5"><summary className="font-semibold text-panel-text">{question.title}</summary><p className="mt-3 text-sm leading-7 text-panel-muted">{question.answer}</p></details>)}</div>
      </div>
    </section>

    <section className="bg-panel-surface px-4 py-12 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl rounded-3xl border border-panel-border bg-brand-soft p-7 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-10"><div><h2 className="text-2xl font-bold tracking-tight text-panel-text sm:text-3xl">Your next favourite is waiting.</h2><p className="mt-3 text-panel-muted">Explore a new place, try a new dish, and share your story.</p></div><div className="mt-6 flex flex-wrap gap-3 sm:mt-0 sm:shrink-0"><Link href="/restaurants" className="workspace-button workspace-button-primary rounded-full">Explore restaurants</Link><Link href="/register" className="workspace-button rounded-full">Create an account</Link></div></div></section>
  </>;
}
