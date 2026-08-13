import Link from "next/link";
import { demoAction } from "@/actions/auth";
import { getCookieLocale } from "@/lib/preferences";
import { t } from "@/lib/i18n";

export default async function WelcomePage() {
  const locale = await getCookieLocale();
  const d = t(locale);

  return (
    <>
      <div className="flex flex-col items-center gap-2.5 px-0 pt-2 pb-1">
        <div
          className="grid h-[76px] w-[76px] place-items-center rounded-3xl text-[34px]"
          style={{
            background:
              "linear-gradient(150deg,rgba(255,138,61,.9),rgba(124,92,255,.9))",
            boxShadow: "0 0 0 1px var(--gbd), var(--inset)",
          }}
        >
          ◆
        </div>
        <div className="text-3xl font-bold tracking-[-0.02em]">Milestone</div>
        <div className="max-w-[300px] text-center text-[15px] text-[var(--t2)] text-pretty">
          {d.welcomeSub}
        </div>
      </div>

      <div className="card flex flex-col gap-2.5 p-4">
        <Link href="/signup" className="btn-primary grid place-items-center">
          {d.signUp}
        </Link>
        <Link href="/login" className="btn-secondary grid place-items-center">
          {d.signIn}
        </Link>
        <form action={demoAction}>
          <button
            type="submit"
            className="h-12 w-full rounded-2xl text-sm font-medium text-[var(--t2)] transition-colors hover:text-[var(--t1)]"
          >
            {d.explore}
          </button>
        </form>
      </div>
    </>
  );
}
