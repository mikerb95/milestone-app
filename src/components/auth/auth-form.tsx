"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  forgotAction,
  googleSignInAction,
  signInAction,
  signUpAction,
  type AuthState,
} from "@/actions/auth";
import { t, type Locale } from "@/lib/i18n";

type Mode = "login" | "signup" | "forgot";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary mt-1" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AuthForm({
  mode,
  locale,
  googleEnabled,
  notice,
}: {
  mode: Mode;
  locale: Locale;
  googleEnabled: boolean;
  notice?: string;
}) {
  const d = t(locale);
  const action =
    mode === "login" ? signInAction : mode === "signup" ? signUpAction : forgotAction;

  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  const title =
    mode === "login" ? d.signIn : mode === "signup" ? d.signUp : d.forgotTitle;
  const cta =
    mode === "login" ? d.signIn : mode === "signup" ? d.signUp : d.resetCta;

  return (
    <>
      <div className="flex items-center gap-3">
        <Link
          href="/welcome"
          aria-label="Volver"
          className="icon-btn text-lg"
        >
          ‹
        </Link>
        <h1 className="text-[22px] font-bold tracking-[-0.02em]">{title}</h1>
      </div>

      <form action={formAction} className="card flex flex-col gap-3 p-4">
        {mode === "signup" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.09em] text-[var(--t3)]">
              {d.nameLabel}
            </span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Daniela Restrepo"
              className="field"
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold tracking-[0.09em] text-[var(--t3)]">
            {d.email}
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="daniela@correo.com"
            className="field"
          />
        </label>

        {mode !== "forgot" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.09em] text-[var(--t3)]">
              {d.password}
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="••••••••"
              className="field"
            />
          </label>
        ) : null}

        {mode === "forgot" ? (
          <p className="text-[13px] text-[var(--t3)] text-pretty">{d.forgotHelp}</p>
        ) : null}

        {notice ? (
          <p className="text-[13px] font-medium text-[var(--success)]">{notice}</p>
        ) : null}

        {state.error ? (
          <p role="alert" className="text-[13px] font-medium text-[var(--danger)]">
            {state.error}
          </p>
        ) : null}

        {state.ok && mode === "forgot" ? (
          <p className="text-[13px] font-medium text-[var(--success)]">
            {locale === "es"
              ? "Si existe una cuenta con ese correo, el enlace ya va en camino."
              : "If an account exists for that email, the link is on its way."}
          </p>
        ) : null}

        {state.resetUrl ? (
          <Link
            href={state.resetUrl}
            className="break-all text-[12px] font-medium"
          >
            {locale === "es"
              ? "Sin correo configurado en desarrollo: abre el enlace aquí."
              : "No mailer configured in development: open the link here."}
          </Link>
        ) : null}

        <SubmitButton label={cta} pendingLabel={d.saving} />

        {mode === "login" ? (
          <div className="flex flex-col gap-2.5">
            {googleEnabled ? (
              <button
                type="button"
                onClick={() => googleSignInAction()}
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl text-[15px] font-semibold transition-colors hover:bg-[var(--g3)]"
                style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[13px] font-extrabold text-[#1A1A1A]">
                  G
                </span>
                {d.google}
              </button>
            ) : null}
            <Link
              href="/forgot"
              className="self-center text-[13px] text-[var(--t2)] hover:text-[var(--t1)]"
            >
              {d.forgot}
            </Link>
          </div>
        ) : null}

        {mode === "signup" && googleEnabled ? (
          <button
            type="button"
            onClick={() => googleSignInAction()}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl text-[15px] font-semibold transition-colors hover:bg-[var(--g3)]"
            style={{ background: "var(--g2)", border: "1px solid var(--gbd)" }}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[13px] font-extrabold text-[#1A1A1A]">
              G
            </span>
            {d.google}
          </button>
        ) : null}
      </form>
    </>
  );
}
