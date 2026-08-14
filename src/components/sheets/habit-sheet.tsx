"use client";

import { useState, useTransition } from "react";
import { FieldHelp, Sheet } from "@/components/ui/sheet";
import { Chip, Eyebrow } from "@/components/ui/chip";
import { useApp } from "@/components/app-provider";
import { useToast } from "@/components/ui/toast";
import { createHabitAction, updateHabitAction } from "@/actions/habits";
import { HABIT_COLORS, HABIT_EMOJI_CHOICES } from "@/lib/defaults";
import { dayNames, frequencyLabels, habitTypeLabels, help, tr } from "@/lib/i18n";

export type HabitSheetValues = {
  name: string;
  emoji: string;
  color: string;
  type: "binary" | "count" | "duration";
  targetValue: string;
  frequency: "daily" | "weekly_n" | "specific";
  weeklyTarget: string;
  days: number[];
};

const TYPES = ["binary", "count", "duration"] as const;
const FREQS = ["daily", "weekly_n", "specific"] as const;

export function HabitSheet({
  open,
  onClose,
  habitId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  habitId?: string;
  initial?: Partial<HabitSheetValues>;
}) {
  const { t, locale } = useApp();
  const h = help(locale);
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const [v, setV] = useState<HabitSheetValues>({
    name: initial?.name ?? "",
    emoji: initial?.emoji ?? "🧘",
    color: initial?.color ?? "#FF8A5B",
    type: initial?.type ?? "binary",
    targetValue: initial?.targetValue ?? "1",
    frequency: initial?.frequency ?? "daily",
    weeklyTarget: initial?.weeklyTarget ?? "3",
    days: initial?.days ?? [],
  });

  const set = <K extends keyof HabitSheetValues>(k: K, value: HabitSheetValues[K]) =>
    setV((prev) => ({ ...prev, [k]: value }));

  const names = dayNames(locale);

  const submit = () => {
    if (!v.name.trim()) {
      setError(t.errRequired);
      return;
    }
    setError(null);
    startTransition(async () => {
      const payload = {
        name: v.name,
        emoji: v.emoji,
        color: v.color,
        type: v.type,
        targetValue: v.type === "binary" ? 1 : Number(v.targetValue) || 1,
        frequency: v.frequency,
        weeklyTarget: Number(v.weeklyTarget) || 3,
        days: v.days,
      };
      const res = habitId
        ? await updateHabitAction(habitId, payload)
        : await createHabitAction(payload);

      if ("error" in res && res.error) {
        setError(t.errGeneric);
        return;
      }
      toast(t.saved);
      onClose();
    });
  };

  const targetHint =
    v.type === "count" ? t.timesPerDay : v.type === "duration" ? t.minutesPerDay : "";

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={habitId ? t.editHabit : t.newHabit}
      helpLabel={h.helpToggle}
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setEmojiOpen((o) => !o)}
            className="h-[50px] w-14 flex-none rounded-2xl text-[22px] transition-colors hover:bg-[var(--g3)]"
            style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
            aria-label="Emoji"
          >
            {v.emoji}
          </button>
          <input
            value={v.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t.habitNamePh}
            className="field h-[50px] flex-1 text-base font-semibold"
            maxLength={120}
          />
        </div>
        <FieldHelp>{h.habitName}</FieldHelp>

        {emojiOpen ? (
          <div className="flex flex-wrap gap-2">
            {HABIT_EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  set("emoji", e);
                  setEmojiOpen(false);
                }}
                className="grid h-11 w-11 place-items-center rounded-xl text-xl transition-colors hover:bg-[var(--g3)]"
                style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
              >
                {e}
              </button>
            ))}
          </div>
        ) : null}

        <Eyebrow>{t.color}</Eyebrow>
        <FieldHelp>{h.habitColor}</FieldHelp>
        <div className="flex flex-wrap gap-2.5">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("color", c)}
              aria-label={c}
              aria-pressed={v.color === c}
              className="h-[38px] w-[38px] rounded-full transition-transform active:scale-95"
              style={{
                background: c,
                outline: v.color === c ? "2px solid #fff" : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>

        <Eyebrow>{t.habitType}</Eyebrow>
        <FieldHelp>{h.habitType}</FieldHelp>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((k) => (
            <Chip
              key={k}
              active={v.type === k}
              color="#7C5CFF"
              onClick={() => set("type", k)}
            >
              {tr(habitTypeLabels, k, locale)}
            </Chip>
          ))}
        </div>

        {v.type !== "binary" ? (
          <>
            <FieldHelp>{h.habitTarget}</FieldHelp>
            <label className="flex items-center gap-3">
              <input
                value={v.targetValue}
                onChange={(e) => set("targetValue", e.target.value)}
                inputMode="numeric"
                className="field tabular w-24 flex-none"
              />
              <span className="text-sm text-[var(--t2)]">{targetHint}</span>
            </label>
          </>
        ) : null}

        <Eyebrow>{t.frequency}</Eyebrow>
        <FieldHelp>{h.habitFrequency}</FieldHelp>
        <div className="flex flex-wrap gap-2">
          {FREQS.map((k) => (
            <Chip
              key={k}
              active={v.frequency === k}
              color="#7C5CFF"
              onClick={() => set("frequency", k)}
            >
              {tr(frequencyLabels, k, locale)}
            </Chip>
          ))}
        </div>

        {v.frequency === "weekly_n" ? (
          <>
            <FieldHelp>{h.habitWeeklyTarget}</FieldHelp>
            <label className="flex items-center gap-3">
              <input
                value={v.weeklyTarget}
                onChange={(e) => set("weeklyTarget", e.target.value)}
                inputMode="numeric"
                className="field tabular w-24 flex-none"
              />
              <span className="text-sm text-[var(--t2)]">{t.timesPerWeek}</span>
            </label>
          </>
        ) : null}

        {v.frequency === "specific" ? (
          <>
            <FieldHelp>{h.habitDays}</FieldHelp>
            <div className="flex gap-1.5">
            {names.map((dn, i) => {
              const active = v.days.includes(i);
              return (
                <button
                  key={dn}
                  type="button"
                  onClick={() =>
                    set(
                      "days",
                      active ? v.days.filter((d) => d !== i) : [...v.days, i],
                    )
                  }
                  aria-pressed={active}
                  className="h-10 flex-1 rounded-xl text-xs font-bold transition-colors"
                  style={{
                    background: active ? "rgba(124,92,255,.35)" : "var(--g2)",
                    border: `1px solid ${active ? "rgba(124,92,255,.7)" : "var(--gbd)"}`,
                    color: active ? "#fff" : "var(--t3)",
                  }}
                >
                  {dn}
                </button>
              );
            })}
            </div>
          </>
        ) : null}

        {error ? (
          <p role="alert" className="text-[13px] font-medium text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="btn-primary"
          style={{ background: "#7C5CFF", color: "#fff" }}
        >
          {pending ? t.saving : t.save}
        </button>
      </div>
    </Sheet>
  );
}
