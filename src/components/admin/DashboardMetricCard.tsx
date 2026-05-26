type Metric = {
  title: string;
  value: number | string;
  description: string;
};

export function DashboardMetricCard({
  metric,
}: {
  metric: Metric;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black text-slate-500">
        {metric.title}
      </p>

      <h2 className="mt-3 text-4xl font-black text-teal-700">
        {metric.value}
      </h2>

      <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
        {metric.description}
      </p>
    </div>
  );
}
