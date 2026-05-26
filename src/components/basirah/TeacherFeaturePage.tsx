import Link from "next/link";

type Action = {
  title: string;
  description: string;
  href: string;
};

export function TeacherFeaturePage({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions: Action[];
}) {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black text-teal-700">{eyebrow}</p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          {title}
        </h1>

        <p className="mt-3 max-w-3xl text-sm font-bold leading-8 text-slate-600">
          {description}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href + action.title}
            href={action.href}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:bg-teal-50"
          >
            <h2 className="text-xl font-black text-slate-950">
              {action.title}
            </h2>

            <p className="mt-3 text-sm font-bold leading-7 text-slate-500">
              {action.description}
            </p>

            <div className="mt-5 inline-flex rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white">
              فتح
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
