import Link from "next/link";
import { Sparkles } from "lucide-react";

export function BasirahTopbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-700 text-white">
            <Sparkles size={20} />
          </div>

          <div>
            <h1 className="text-lg font-black">
              بصيرة
            </h1>

            <p className="text-xs font-bold text-slate-500">
              منصة تحليل تعلم وتشخيص تربوي
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
          </div>
        </div>
      </div>
    </header>
  );
}
