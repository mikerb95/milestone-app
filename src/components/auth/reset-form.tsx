"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetPasswordAction, type AuthState } from "@/actions/auth";
import { t, type Locale } from "@/lib/i18n";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary mt-1" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function ResetForm({ token, locale }: { token: string; locale: Locale }) {
  const d = t(locale);
  const [state, formAction] = useActionState<AuthState, FormData>(
    resetPasswordAction,
    {},
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/login" aria-label="Volver" className="icon-btn text-lg">
          ‹
        </Link>
        <h1 className="text-[22px] font-bold tracking-[-0.02em]">
          {locale === "es" ? "Nueva contraseña" : "New password"}
        </h1>
      </div>

      <form action={formAction} className="card flex flex-col gap-3 p-4">
        <input type="hidden" name="token" value={token} />
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold tracking-[0.09em] text-[var(--t3)]">
            {d.password}
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            className="field"
          />
        </label>

        {state.error ? (
          <p role="alert" className="text-[13px] font-medium text-[var(--danger)]">
            {state.error}
          </p>
        ) : null}

        <SubmitButton label={d.save} pendingLabel={d.saving} />
      </form>
    </>
  );
}
