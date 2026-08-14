import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SubHeader } from "@/components/shell/sub-header";
import { getSettings } from "@/lib/queries";

const COPY = {
  es: {
    title: "Acerca de",
    tagline: "Metas con horizonte, hábitos con racha y un día claro. Sin fricción.",
    version: "Versión",
    stack: "Construida con Next.js, Turso y Drizzle.",
    data: "Tus datos son tuyos: puedes exportarlos en JSON desde Ajustes en cualquier momento.",
  },
  en: {
    title: "About",
    tagline: "Goals with a horizon, habits with a streak, and a clear day. Zero friction.",
    version: "Version",
    stack: "Built with Next.js, Turso and Drizzle.",
    data: "Your data is yours: export it as JSON from Settings whenever you want.",
  },
};

export default async function AboutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/welcome");

  const settings = await getSettings(session.user.id);
  const c = COPY[settings.locale];

  return (
    <>
      <SubHeader title={c.title} />

      <div className="card flex flex-col items-center gap-3 px-5 py-8 text-center">
        <div
          className="grid h-16 w-16 place-items-center rounded-3xl text-[28px]"
          style={{
            background: "linear-gradient(150deg,rgba(255,138,61,.9),rgba(124,92,255,.9))",
          }}
        >
          ◆
        </div>
        <div className="text-2xl font-bold tracking-[-0.02em]">Milestone</div>
        <div className="max-w-[300px] text-pretty text-[15px] text-[var(--t2)]">
          {c.tagline}
        </div>
        <div className="tabular text-[13px] font-medium text-[var(--t3)]">
          {c.version} 1.0.0
        </div>
      </div>

      <div className="card mt-3 flex flex-col gap-2 p-4 text-pretty text-sm text-[var(--t2)]">
        <p>{c.stack}</p>
        <p>{c.data}</p>
      </div>
    </>
  );
}
