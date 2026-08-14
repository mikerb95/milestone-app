"use client";

import { useSheets } from "@/components/sheets/sheet-provider";

/** Estado vacío con llamada a la acción, en lugar de un hueco mudo. */
export function EmptyGroup({
  copy,
  cta,
  dueDate,
}: {
  copy: string;
  cta: string;
  dueDate: string;
}) {
  const { open } = useSheets();

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-[20px] px-4 py-[22px] text-center"
      style={{ background: "var(--g1)", border: "1px dashed var(--gbd)" }}
    >
      <div
        className="grid h-11 w-11 place-items-center rounded-[14px] text-lg text-[var(--t3)]"
        style={{ background: "var(--g2)" }}
      >
        +
      </div>
      <div className="text-pretty text-sm text-[var(--t2)]">{copy}</div>
      <button
        type="button"
        onClick={() => open({ type: "task", initial: { dueDate } })}
        className="h-[34px] rounded-full px-4 text-[13px] font-semibold transition-colors hover:bg-[var(--g3)]"
        style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
      >
        {cta}
      </button>
    </div>
  );
}
