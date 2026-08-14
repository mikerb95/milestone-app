"use client";

import { useRouter } from "next/navigation";

/** Cabecera de las pantallas que cuelgan de Más. */
export function SubHeader({ title, back = "/more" }: { title: string; back?: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 pt-3.5 pb-4">
      <button
        type="button"
        onClick={() => router.push(back)}
        aria-label="Volver"
        className="icon-btn text-lg"
      >
        ‹
      </button>
      <h1 className="text-[26px] font-bold tracking-[-0.02em]">{title}</h1>
    </div>
  );
}
