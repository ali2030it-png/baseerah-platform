import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

type Decision = {
  priority: string;
  title: string;
  description: string;
  action: string;
};

export function EducationalDecisions({
  decisions,
}: {
  decisions: Decision[];
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black text-teal-700">
          محرك القرار التربوي
        </p>

        <h2 className="mt-2 text-2xl font-black">
          توصيات ذكية مبنية على النتائج
        </h2>
      </div>

      <div className="space-y-4">
        {decisions.map((decision, index) => {
          const critical = decision.priority === "critical";
          const high = decision.priority === "high";

          return (
            <div
              key={index}
              className={[
                "rounded-[1.5rem] border p-5",
                critical
                  ? "border-rose-200 bg-rose-50"
                  : high
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-200 bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div>
                  {critical ? (
                    <ShieldAlert className="text-rose-700" size={22} />
                  ) : high ? (
                    <AlertTriangle
                      className="text-amber-700"
                      size={22}
                    />
                  ) : (
                    <CheckCircle2
                      className="text-emerald-700"
                      size={22}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-black">
                    {decision.title}
                  </h3>

                  <p className="mt-2 text-sm font-bold leading-7 text-slate-600">
                    {decision.description}
                  </p>

                  <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700">
                    {decision.action}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
