"use client";

import { useState, useTransition } from "react";
import { FieldHelp, Sheet } from "@/components/ui/sheet";
import { useApp } from "@/components/app-provider";
import { useToast } from "@/components/ui/toast";
import { logProgressAction } from "@/actions/goals";
import { formatNumber } from "@/lib/dates";
import { help } from "@/lib/i18n";

export type LogTarget = {
  goalId: string;
  title: string;
  type: "numeric" | "percent" | "milestone" | "binary";
  currentValue: number;
  targetValue: number;
  unit: string | null;
  color: string;
};

/** Saltos rápidos: ahorran teclear cuando el avance es de una unidad. */
const STEPS = [1, 5, 10];

export function LogSheet({
  open,
  onClose,
  target,
}: {
  open: boolean;
  onClose: () => void;
  target: LogTarget;
}) {
  const { t, locale } = useApp();
  const h = help(locale);
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(String(target.currentValue));
  const [note, setNote] = useState("");

  const numeric = Number(value);
  const percent =
    target.targetValue > 0
      ? Math.max(0, Math.min(100, Math.round((numeric / target.targetValue) * 100)))
      : 0;

  const bump = (delta: number) => {
    const next = Math.max(0, (Number(value) || 0) + delta);
    setValue(String(Math.round(next * 100) / 100));
  };

  const submit = () => {
    if (!Number.isFinite(numeric) || numeric < 0) {
      setError(t.errRequired);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await logProgressAction({
        goalId: target.goalId,
        value: numeric,
        note: note || null,
      });
      if ("error" in res && res.error) {
        setError(t.errGeneric);
        return;
      }
      toast(res.completed ? t.goalCompleted : t.progressLogged);
      onClose();
    });
  };

  return (
    <Sheet open={open} onClose={onClose} title={t.logTitle} helpLabel={h.helpToggle}>
      <div className="flex flex-col gap-3.5">
        <div className="text-[15px] font-semibold text-pretty">{target.title}</div>

        <div className="flex items-end gap-2.5">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            autoFocus
            className="tabular h-16 min-w-0 flex-1 rounded-2xl px-4 text-[30px] font-bold outline-none focus:outline-2 focus:outline-[var(--acc)] focus:outline-offset-2"
            style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
          />
          <div className="pb-3.5 text-base font-semibold text-[var(--t3)]">
            {target.type === "percent"
              ? "%"
              : `/ ${formatNumber(target.targetValue, locale)}${target.unit ? " " + target.unit : ""}`}
          </div>
        </div>
        <FieldHelp>{h.logValue}</FieldHelp>

        <div className="flex gap-2">
          {STEPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => bump(s)}
              className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--g3)]"
              style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
            >
              +{s}
            </button>
          ))}
          <button
            type="button"
            onClick={() => bump(-1)}
            className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--g3)]"
            style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
          >
            -1
          </button>
        </div>

        {/* Previsualización: se ve a dónde queda la meta antes de guardar. */}
        <div
          className="h-2.5 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,.1)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${target.type === "percent" ? Math.min(100, numeric || 0) : percent}%`,
              background: `linear-gradient(90deg,${target.color},${target.color}CC)`,
            }}
          />
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.notePlaceholder}
          className="field"
          maxLength={300}
        />
        <FieldHelp>{h.logNote}</FieldHelp>

        {error ? (
          <p role="alert" className="text-[13px] font-medium text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <button type="button" onClick={submit} disabled={pending} className="btn-primary">
          {pending ? t.saving : t.save}
        </button>
      </div>
    </Sheet>
  );
}
