"use client";

import { useState, useTransition } from "react";
import { completeOnboardingAction } from "@/actions/onboarding";
import { Chip } from "@/components/ui/chip";
import { DEFAULT_CATEGORIES } from "@/lib/defaults";
import { ONBOARDING_TEMPLATES } from "@/lib/sample-data";
import { t, type Locale } from "@/lib/i18n";

const TIMEZONES = [
  { key: "America/Bogota", label: "Bogotá (GMT-5)" },
  { key: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { key: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { key: "Europe/Madrid", label: "Madrid (GMT+2)" },
];

const COPY = {
  es: [
    {
      title: "Idioma y zona horaria",
      sub: "Ajustamos fechas, números y semanas a tu contexto.",
    },
    {
      title: "¿Qué quieres mover este año?",
      sub: "Elige las categorías que te importan. Puedes cambiarlas después.",
    },
    {
      title: "Arranca con algo concreto",
      sub: "Escoge una plantilla y la dejamos lista para que la llenes.",
    },
  ],
  en: [
    {
      title: "Language and time zone",
      sub: "We tune dates, numbers and weeks to your context.",
    },
    {
      title: "What do you want to move this year?",
      sub: "Pick the categories that matter. You can change them later.",
    },
    {
      title: "Start with something concrete",
      sub: "Pick a template and we set it up for you to fill in.",
    },
  ],
};

export function OnboardingFlow({ initialLocale }: { initialLocale: Locale }) {
  const [step, setStep] = useState(1);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [timezone, setTimezone] = useState("America/Bogota");
  const [cats, setCats] = useState<string[]>(["growth", "health"]);
  const [templates, setTemplates] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const d = t(locale);
  const copy = COPY[locale][step - 1];

  const toggle = (list: string[], key: string) =>
    list.includes(key) ? list.filter((k) => k !== key) : [...list, key];

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    startTransition(async () => {
      await completeOnboardingAction({
        locale,
        timezone,
        categories: cats,
        templates,
      });
    });
  };

  return (
    <>
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-250"
            style={{
              background: i <= step ? "#FF8A3D" : "rgba(255,255,255,.16)",
            }}
          />
        ))}
      </div>

      <div className="card flex flex-col gap-4 px-4 py-5">
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] font-semibold tracking-[0.09em] text-[var(--t3)]">
            {d.step} {step} / 3
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-pretty">
            {copy.title}
          </h1>
          <p className="text-[15px] text-[var(--t2)] text-pretty">{copy.sub}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {step === 1 ? (
            <>
              <Chip active={locale === "es"} onClick={() => setLocale("es")}>
                Español (Colombia)
              </Chip>
              <Chip active={locale === "en"} onClick={() => setLocale("en")}>
                English (US)
              </Chip>
              {TIMEZONES.map((tz) => (
                <Chip
                  key={tz.key}
                  active={timezone === tz.key}
                  onClick={() => setTimezone(tz.key)}
                >
                  {tz.label}
                </Chip>
              ))}
            </>
          ) : null}

          {step === 2
            ? DEFAULT_CATEGORIES.map((c) => (
                <Chip
                  key={c.slug}
                  active={cats.includes(c.slug)}
                  color={c.color}
                  onClick={() => setCats(toggle(cats, c.slug))}
                >
                  {c.emoji}&nbsp;&nbsp;{locale === "en" ? c.en : c.es}
                </Chip>
              ))
            : null}

          {step === 3
            ? ONBOARDING_TEMPLATES.map((tpl) => (
                <Chip
                  key={tpl.key}
                  active={templates.includes(tpl.key)}
                  onClick={() => setTemplates(toggle(templates, tpl.key))}
                >
                  {tpl.label[locale]}
                </Chip>
              ))
            : null}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={pending}
          className="btn-primary"
        >
          {pending ? d.saving : step < 3 ? d.continueLabel : d.enterApp}
        </button>
      </div>
    </>
  );
}
