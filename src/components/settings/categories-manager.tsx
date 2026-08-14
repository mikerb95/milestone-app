"use client";

import { useState, useTransition } from "react";
import { useApp } from "@/components/app-provider";
import { useToast } from "@/components/ui/toast";
import { SubHeader } from "@/components/shell/sub-header";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/settings";
import { HABIT_COLORS, GOAL_EMOJI_CHOICES } from "@/lib/defaults";

export type CategoryRow = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  goalCount: number;
};

const COPY = {
  es: {
    title: "Categorías",
    add: "Nueva categoría",
    namePh: "Nombre de la categoría",
    save: "Guardar",
    cancel: "Cancelar",
    goals: "metas",
    deleteConfirm:
      "Las metas de esta categoría se quedan sin categoría. ¿La eliminamos?",
    created: "Categoría creada",
    updated: "Categoría actualizada",
    deleted: "Categoría eliminada",
  },
  en: {
    title: "Categories",
    add: "New category",
    namePh: "Category name",
    save: "Save",
    cancel: "Cancel",
    goals: "goals",
    deleteConfirm:
      "Goals in this category will be left without one. Delete it anyway?",
    created: "Category created",
    updated: "Category updated",
    deleted: "Category deleted",
  },
};

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const { locale } = useApp();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const c = COPY[locale];

  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", emoji: "🎯", color: HABIT_COLORS[0] });

  const startCreate = () => {
    setEditing("new");
    setDraft({ name: "", emoji: "🎯", color: HABIT_COLORS[0] });
  };

  const startEdit = (row: CategoryRow) => {
    setEditing(row.id);
    setDraft({ name: row.name, emoji: row.emoji, color: row.color });
  };

  const submit = () => {
    if (!draft.name.trim()) return;
    const payload = { name: draft.name, emoji: draft.emoji, color: draft.color };
    const id = editing;
    setEditing(null);
    startTransition(async () => {
      if (id === "new") {
        await createCategoryAction(payload);
        toast(c.created);
      } else if (id) {
        await updateCategoryAction(id, payload);
        toast(c.updated);
      }
    });
  };

  const remove = (id: string) => {
    if (!window.confirm(c.deleteConfirm)) return;
    startTransition(async () => {
      await deleteCategoryAction(id);
      toast(c.deleted);
    });
  };

  const form = (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex gap-2.5">
        <div className="flex flex-none flex-wrap gap-1.5">
          {GOAL_EMOJI_CHOICES.slice(0, 6).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setDraft((p) => ({ ...p, emoji: e }))}
              className="grid h-9 w-9 place-items-center rounded-xl text-base"
              style={{
                background: draft.emoji === e ? "var(--g3)" : "var(--g2)",
                border: `1px solid ${draft.emoji === e ? "#fff6" : "var(--gbd)"}`,
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <input
        value={draft.name}
        onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
        placeholder={c.namePh}
        className="field"
        maxLength={60}
        autoFocus
      />

      <div className="flex flex-wrap gap-2.5">
        {HABIT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            onClick={() => setDraft((p) => ({ ...p, color }))}
            className="h-8 w-8 rounded-full transition-transform active:scale-95"
            style={{
              background: color,
              outline: draft.color === color ? "2px solid #fff" : "none",
              outlineOffset: "2px",
            }}
          />
        ))}
      </div>

      <div className="flex gap-2.5">
        <button type="button" onClick={submit} className="btn-primary h-11">
          {c.save}
        </button>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="btn-secondary h-11"
        >
          {c.cancel}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <SubHeader title={c.title} />

      <div className="flex flex-col gap-2.5">
        {categories.map((row) =>
          editing === row.id ? (
            <div key={row.id}>{form}</div>
          ) : (
            <div key={row.id} className="card group flex items-center gap-3 px-4 py-3.5">
              <span
                className="grid h-[38px] w-[38px] flex-none place-items-center rounded-xl text-lg"
                style={{
                  background: row.color + "26",
                  border: `1px solid ${row.color}3D`,
                }}
              >
                {row.emoji}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[15px] font-semibold">{row.name}</span>
                <span className="text-[13px] font-medium text-[var(--t3)]">
                  {row.goalCount} {c.goals}
                </span>
              </span>
              <button
                type="button"
                onClick={() => startEdit(row)}
                className="flex-none text-[var(--t3)] transition-colors hover:text-[var(--t1)]"
                aria-label={c.save}
              >
                ⋯
              </button>
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="flex-none text-[var(--t3)] opacity-0 transition-[opacity,color] focus-visible:opacity-100 group-hover:opacity-100 hover:text-[var(--danger)]"
                aria-label="×"
              >
                ×
              </button>
            </div>
          ),
        )}

        {editing === "new" ? (
          form
        ) : (
          <button type="button" onClick={startCreate} className="btn-secondary">
            + {c.add}
          </button>
        )}
      </div>
    </>
  );
}
