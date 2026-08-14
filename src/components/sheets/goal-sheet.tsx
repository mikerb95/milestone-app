"use client";

import { useState, useTransition } from "react";
import { FieldHelp, Sheet } from "@/components/ui/sheet";
import { Chip, ChipTile, Eyebrow } from "@/components/ui/chip";
import { useApp } from "@/components/app-provider";
import { useToast } from "@/components/ui/toast";
import { createGoalAction, updateGoalAction } from "@/actions/goals";
import { categoryName } from "@/lib/defaults";
import { goalTypeLabels, help, timeframePlain, tr } from "@/lib/i18n";
import type { CategoryOption } from "./sheet-provider";

export type GoalSheetValues = {
  title: string;
  description: string;
  why: string;
  categoryId: string | null;
  type: "numeric" | "percent" | "milestone" | "binary";
  timeframe: "week" | "month" | "quarter" | "year" | "long_term";
  targetValue: string;
  unit: string;
  targetDate: string;
  reminder: boolean;
  milestones: string[];
};

const TIMEFRAMES = ["week", "month", "quarter", "year", "long_term"] as const;
const TYPES = ["numeric", "percent", "milestone", "binary"] as const;

export function GoalSheet({
  open,
  onClose,
  categories,
  today,
  goalId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  today: string;
  goalId?: string;
  initial?: Partial<GoalSheetValues>;
}) {
  const { t, locale, settings } = useApp();
  const h = help(locale);
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [v, setV] = useState<GoalSheetValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    why: initial?.why ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? null,
    type: initial?.type ?? "numeric",
    timeframe: initial?.timeframe ?? settings.defaultTimeframe,
    targetValue: initial?.targetValue ?? "",
    unit: initial?.unit ?? "",
    targetDate: initial?.targetDate ?? "",
    reminder: initial?.reminder ?? false,
    milestones: initial?.milestones ?? [],
  });

  const set = <K extends keyof GoalSheetValues>(k: K, value: GoalSheetValues[K]) =>
    setV((prev) => ({ ...prev, [k]: value }));

  const [milestoneDraft, setMilestoneDraft] = useState("");

  const addMilestone = () => {
    const title = milestoneDraft.trim();
    if (!title) return;
    set("milestones", [...v.milestones, title]);
    setMilestoneDraft("");
  };

  const submit = () => {
    if (!v.title.trim()) {
      setError(t.errRequired);
      return;
    }
    setError(null);
    startTransition(async () => {
      const payload = {
        title: v.title,
        description: v.description || null,
        why: v.why || null,
        categoryId: v.categoryId,
        type: v.type,
        timeframe: v.timeframe,
        targetValue: v.targetValue ? Number(v.targetValue) : 100,
        unit: v.unit || null,
        targetDate: v.targetDate || null,
        reminder: v.reminder,
        milestones: v.milestones,
      };
      const res = goalId
        ? await updateGoalAction(goalId, payload)
        : await createGoalAction(payload);

      if ("error" in res && res.error) {
        setError(t.errGeneric);
        return;
      }
      toast(t.saved);
      onClose();
    });
  };

  const needsTarget = v.type === "numeric";

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={goalId ? t.editGoal : t.newGoal}
      helpLabel={h.helpToggle}
    >
      <div className="flex flex-col gap-3.5">
        <input
          value={v.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={t.goalTitlePh}
          className="field h-[50px] text-base font-semibold"
          maxLength={160}
        />
        <FieldHelp>{h.goalTitle}</FieldHelp>

        <textarea
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={t.goalDescPh}
          rows={2}
          className="resize-none rounded-2xl px-3.5 py-3 text-[15px] outline-none focus:outline-2 focus:outline-[var(--acc)] focus:outline-offset-2"
          style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
        />
        <FieldHelp>{h.goalDescription}</FieldHelp>

        <textarea
          value={v.why}
          onChange={(e) => set("why", e.target.value)}
          placeholder={t.goalWhyPh}
          rows={2}
          className="resize-none rounded-2xl px-3.5 py-3 text-[15px] outline-none focus:outline-2 focus:outline-[var(--acc)] focus:outline-offset-2"
          style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
        />
        <FieldHelp>{h.goalWhy}</FieldHelp>

        <Eyebrow>{t.category}</Eyebrow>
        <FieldHelp>{h.goalCategory}</FieldHelp>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((c) => (
            <ChipTile
              key={c.id}
              active={v.categoryId === c.id}
              color={c.color}
              emoji={c.emoji}
              label={categoryName(c, locale)}
              onClick={() => set("categoryId", c.id)}
            />
          ))}
        </div>

        <Eyebrow>{t.timeframe}</Eyebrow>
        <FieldHelp>{h.goalTimeframe}</FieldHelp>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map((k) => (
            <Chip
              key={k}
              active={v.timeframe === k}
              onClick={() => set("timeframe", k)}
            >
              {tr(timeframePlain, k, locale)}
            </Chip>
          ))}
        </div>

        <Eyebrow>{t.goalType}</Eyebrow>
        <FieldHelp>{h.goalType}</FieldHelp>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((k) => (
            <Chip key={k} active={v.type === k} onClick={() => set("type", k)}>
              {tr(goalTypeLabels, k, locale)}
            </Chip>
          ))}
        </div>

        {needsTarget ? (
          <>
            <FieldHelp>{h.goalTarget}</FieldHelp>
            <div className="flex gap-2.5">
            <input
              value={v.targetValue}
              onChange={(e) => set("targetValue", e.target.value)}
              placeholder={t.targetValuePh}
              inputMode="decimal"
              className="field tabular flex-1"
            />
            <input
              value={v.unit}
              onChange={(e) => set("unit", e.target.value)}
              placeholder={t.unitPh}
              className="field w-[110px] flex-none"
              maxLength={40}
            />
            </div>
          </>
        ) : null}

        {v.type === "milestone" ? (
          <div className="flex flex-col gap-2">
            <Eyebrow>{t.milestones}</Eyebrow>
            <FieldHelp>{h.goalMilestones}</FieldHelp>
            {v.milestones.map((m, i) => (
              <div
                key={`${m}-${i}`}
                className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
                style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
              >
                <span className="h-[14px] w-[14px] flex-none rounded-full border-[1.5px] border-white/35" />
                <span className="min-w-0 flex-1 text-sm">{m}</span>
                <button
                  type="button"
                  aria-label={t.delete}
                  onClick={() =>
                    set(
                      "milestones",
                      v.milestones.filter((_, j) => j !== i),
                    )
                  }
                  className="text-[var(--t3)] transition-colors hover:text-[var(--danger)]"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={milestoneDraft}
                onChange={(e) => setMilestoneDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMilestone();
                  }
                }}
                placeholder={t.milestonePh}
                className="field flex-1"
              />
              <button
                type="button"
                onClick={addMilestone}
                className="grid h-12 w-12 flex-none place-items-center rounded-2xl text-xl transition-colors hover:bg-[var(--g3)]"
                style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
                aria-label={t.addMilestone}
              >
                +
              </button>
            </div>
          </div>
        ) : null}

        <label className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
          style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}>
          <span className="text-[15px] font-medium">{t.dueDate}</span>
          <input
            type="date"
            value={v.targetDate}
            min={today}
            onChange={(e) => set("targetDate", e.target.value)}
            className="tabular bg-transparent text-[15px] text-[var(--t2)] outline-none"
          />
        </label>
        <FieldHelp>{h.goalTargetDate}</FieldHelp>

        <button
          type="button"
          onClick={() => set("reminder", !v.reminder)}
          className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
          style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
          aria-pressed={v.reminder}
        >
          <span className="text-[15px] font-medium">{t.reminder}</span>
          <span
            className="relative h-7 w-[46px] flex-none rounded-full transition-colors"
            style={{
              background: v.reminder
                ? "rgba(255,138,61,.7)"
                : "rgba(255,255,255,.16)",
            }}
          >
            <span
              className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-[left]"
              style={{ left: v.reminder ? "21px" : "3px" }}
            />
          </span>
        </button>
        <FieldHelp>{h.goalReminder}</FieldHelp>

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
        >
          {pending ? t.saving : t.save}
        </button>
      </div>
    </Sheet>
  );
}
