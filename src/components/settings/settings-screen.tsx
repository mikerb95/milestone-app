"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useApp } from "@/components/app-provider";
import { useToast } from "@/components/ui/toast";
import { updateSettingsAction, type SettingsInput } from "@/actions/settings";
import { signOutAction } from "@/actions/auth";
import { deleteAccountAction } from "@/actions/account";
import { Choice, Group, Row, Switch, Value } from "./setting-rows";
import { HABIT_COLORS } from "@/lib/defaults";
import type { UserSettings } from "@/db/schema";

const COPY = {
  es: {
    account: "CUENTA",
    appearance: "APARIENCIA",
    region: "IDIOMA Y REGIÓN",
    notifications: "NOTIFICACIONES",
    goalsHabits: "METAS Y HÁBITOS",
    data: "DATOS",
    privacy: "PRIVACIDAD Y SEGURIDAD",
    about: "ACERCA DE",
    name: "Nombre",
    email: "Correo",
    changePassword: "Cambiar contraseña",
    signOut: "Cerrar sesión",
    deleteAccount: "Eliminar cuenta",
    deleteConfirm:
      "Esto borra tu cuenta y todos tus datos, sin vuelta atrás. ¿Seguimos?",
    theme: "Tema",
    dark: "Oscuro",
    accent: "Color de acento",
    textSize: "Tamaño de texto",
    small: "Pequeño",
    medium: "Mediano",
    large: "Grande",
    reduceMotion: "Reducir movimiento",
    reduceTransparency: "Reducir transparencia",
    language: "Idioma",
    timeFormat: "Formato de hora",
    firstDay: "Primer día de la semana",
    monday: "Lunes",
    sunday: "Domingo",
    currency: "Moneda",
    units: "Sistema de unidades",
    metric: "Métrico",
    imperial: "Imperial",
    timezone: "Zona horaria",
    notificationsOn: "Notificaciones",
    dailySummary: "Resumen diario",
    weeklySummary: "Resumen semanal",
    streakAlerts: "Alertas de racha en riesgo",
    goalNudges: "Actualización de metas",
    quietHours: "Horario de silencio",
    defaultTimeframe: "Horizonte por defecto",
    countToday: "Contar el día actual en la racha",
    streakFreeze: "Tolerancia de racha",
    dayCutoff: "Hora de corte del día",
    hideCompleted: "Ocultar metas completadas",
    categories: "Categorías",
    export: "Exportar (JSON)",
    sync: "Sincronización",
    syncNote: "Siempre activa en la nube",
    lock: "Bloqueo con biometría o PIN",
    analytics: "Analítica anónima",
    version: "Versión",
    daysMonth: "días al mes",
    weekly: "Semanal",
    monthly: "Mensual",
    never: "Nunca",
  },
  en: {
    account: "ACCOUNT",
    appearance: "APPEARANCE",
    region: "LANGUAGE & REGION",
    notifications: "NOTIFICATIONS",
    goalsHabits: "GOALS & HABITS",
    data: "DATA",
    privacy: "PRIVACY & SECURITY",
    about: "ABOUT",
    name: "Name",
    email: "Email",
    changePassword: "Change password",
    signOut: "Sign out",
    deleteAccount: "Delete account",
    deleteConfirm:
      "This deletes your account and all your data, with no way back. Continue?",
    theme: "Theme",
    dark: "Dark",
    accent: "Accent color",
    textSize: "Text size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    reduceMotion: "Reduce motion",
    reduceTransparency: "Reduce transparency",
    language: "Language",
    timeFormat: "Time format",
    firstDay: "First day of week",
    monday: "Monday",
    sunday: "Sunday",
    currency: "Currency",
    units: "Unit system",
    metric: "Metric",
    imperial: "Imperial",
    timezone: "Time zone",
    notificationsOn: "Notifications",
    dailySummary: "Daily summary",
    weeklySummary: "Weekly summary",
    streakAlerts: "Streak at risk alerts",
    goalNudges: "Goal update nudges",
    quietHours: "Quiet hours",
    defaultTimeframe: "Default timeframe",
    countToday: "Count today in streaks",
    streakFreeze: "Streak freeze",
    dayCutoff: "Day cutoff hour",
    hideCompleted: "Hide completed goals",
    categories: "Categories",
    export: "Export (JSON)",
    sync: "Sync",
    syncNote: "Always on in the cloud",
    lock: "Biometric or PIN lock",
    analytics: "Anonymous analytics",
    version: "Version",
    daysMonth: "days/month",
    weekly: "Weekly",
    monthly: "Monthly",
    never: "Never",
  },
};

const TIMEZONES = [
  "America/Bogota",
  "America/Mexico_City",
  "America/Lima",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/New_York",
  "Europe/Madrid",
  "UTC",
];

export function SettingsScreen({
  settings,
  user,
}: {
  settings: UserSettings;
  user: { name: string; email: string };
}) {
  const router = useRouter();
  const { t, locale } = useApp();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [local, setLocal] = useState(settings);
  const c = COPY[locale];

  /* Guardado optimista: la fila responde ya y el servidor confirma detrás. */
  const save = (patch: SettingsInput) => {
    setLocal((prev) => ({ ...prev, ...patch }) as UserSettings);
    startTransition(async () => {
      const res = await updateSettingsAction(patch);
      if ("error" in res && res.error) {
        setLocal(settings);
        toast(t.errGeneric);
        return;
      }
      router.refresh();
    });
  };

  const timeframeOptions = [
    { value: "week", label: locale === "es" ? "Esta semana" : "This week" },
    { value: "month", label: locale === "es" ? "Este mes" : "This month" },
    { value: "quarter", label: locale === "es" ? "Este trimestre" : "This quarter" },
    { value: "year", label: locale === "es" ? "Este año" : "This year" },
    { value: "long_term", label: locale === "es" ? "Largo plazo" : "Long term" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 pt-3.5">
        <button
          type="button"
          onClick={() => router.push("/more")}
          aria-label={locale === "es" ? "Volver" : "Back"}
          className="icon-btn text-lg"
        >
          ‹
        </button>
        <h1 className="text-[26px] font-bold tracking-[-0.02em]">{t.settings}</h1>
      </div>

      <Group title={c.account}>
        <Row icon="👤" label={c.name} first>
          <Value>{user.name}</Value>
        </Row>
        <Row icon="✉️" label={c.email} first={false}>
          <Value>{user.email}</Value>
        </Row>
        <Row
          icon="🔑"
          label={c.changePassword}
          first={false}
          onClick={() => router.push("/forgot")}
        />
        <Row
          icon="🚪"
          label={c.signOut}
          first={false}
          danger
          onClick={() => startTransition(async () => void (await signOutAction()))}
        />
        <Row
          icon="🗑"
          label={c.deleteAccount}
          first={false}
          danger
          onClick={() => {
            if (!window.confirm(c.deleteConfirm)) return;
            startTransition(async () => void (await deleteAccountAction()));
          }}
        />
      </Group>

      <Group title={c.appearance}>
        <Row icon="🌙" label={c.theme} first>
          <Value>{c.dark}</Value>
        </Row>
        <Row icon="🎨" label={c.accent} first={false}>
          <div className="flex flex-none gap-2">
            {HABIT_COLORS.slice(0, 5).map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                aria-pressed={local.accentColor === color}
                onClick={() => save({ accentColor: color })}
                className="h-5 w-5 rounded-full transition-transform active:scale-90"
                style={{
                  background: color,
                  outline: local.accentColor === color ? "2px solid #fff" : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </Row>
        <Row icon="🔠" label={c.textSize} first={false}>
          <Choice
            label={c.textSize}
            value={local.textSize}
            onChange={(v) => save({ textSize: v as "small" | "medium" | "large" })}
            options={[
              { value: "small", label: c.small },
              { value: "medium", label: c.medium },
              { value: "large", label: c.large },
            ]}
          />
        </Row>
        <Row icon="🌀" label={c.reduceMotion} first={false}>
          <Switch
            label={c.reduceMotion}
            checked={local.reduceMotion}
            onChange={(v) => save({ reduceMotion: v })}
          />
        </Row>
        <Row icon="🫧" label={c.reduceTransparency} first={false}>
          <Switch
            label={c.reduceTransparency}
            checked={local.reduceTransparency}
            onChange={(v) => save({ reduceTransparency: v })}
          />
        </Row>
      </Group>

      <Group title={c.region}>
        <Row icon="🌐" label={c.language} first>
          <Choice
            label={c.language}
            value={local.locale}
            onChange={(v) => save({ locale: v as "es" | "en" })}
            options={[
              { value: "es", label: "Español" },
              { value: "en", label: "English" },
            ]}
          />
        </Row>
        <Row icon="🕑" label={c.timeFormat} first={false}>
          <Choice
            label={c.timeFormat}
            value={local.timeFormat}
            onChange={(v) => save({ timeFormat: v as "24h" | "12h" })}
            options={[
              { value: "24h", label: "24 h" },
              { value: "12h", label: "12 h" },
            ]}
          />
        </Row>
        <Row icon="🗓" label={c.firstDay} first={false}>
          <Choice
            label={c.firstDay}
            value={String(local.firstDayOfWeek)}
            onChange={(v) => save({ firstDayOfWeek: Number(v) })}
            options={[
              { value: "1", label: c.monday },
              { value: "0", label: c.sunday },
            ]}
          />
        </Row>
        <Row icon="💱" label={c.currency} first={false}>
          <Choice
            label={c.currency}
            value={local.currency}
            onChange={(v) => save({ currency: v })}
            options={["COP", "USD", "EUR", "MXN", "ARS", "CLP"].map((v) => ({
              value: v,
              label: v,
            }))}
          />
        </Row>
        <Row icon="📏" label={c.units} first={false}>
          <Choice
            label={c.units}
            value={local.unitSystem}
            onChange={(v) => save({ unitSystem: v as "metric" | "imperial" })}
            options={[
              { value: "metric", label: c.metric },
              { value: "imperial", label: c.imperial },
            ]}
          />
        </Row>
        <Row icon="🌎" label={c.timezone} first={false}>
          <Choice
            label={c.timezone}
            value={local.timezone}
            onChange={(v) => save({ timezone: v })}
            options={TIMEZONES.map((v) => ({ value: v, label: v.split("/").pop()! }))}
          />
        </Row>
      </Group>

      <Group title={c.notifications}>
        <Row icon="🔔" label={c.notificationsOn} first>
          <Switch
            label={c.notificationsOn}
            checked={local.notifications}
            onChange={(v) => save({ notifications: v })}
          />
        </Row>
        <Row icon="🌅" label={c.dailySummary} first={false}>
          <Value>{local.dailySummary ?? "-"}</Value>
        </Row>
        <Row icon="📈" label={c.weeklySummary} first={false}>
          <Value>{local.weeklySummary ?? "-"}</Value>
        </Row>
        <Row icon="🔥" label={c.streakAlerts} first={false}>
          <Switch
            label={c.streakAlerts}
            checked={local.streakAlerts}
            onChange={(v) => save({ streakAlerts: v })}
          />
        </Row>
        <Row icon="🎯" label={c.goalNudges} first={false}>
          <Choice
            label={c.goalNudges}
            value={local.goalNudges ?? "weekly"}
            onChange={(v) => save({ goalNudges: v })}
            options={[
              { value: "weekly", label: c.weekly },
              { value: "monthly", label: c.monthly },
              { value: "never", label: c.never },
            ]}
          />
        </Row>
        <Row icon="🌘" label={c.quietHours} first={false}>
          <Value>
            {local.quietHoursStart} a {local.quietHoursEnd}
          </Value>
        </Row>
      </Group>

      <Group title={c.goalsHabits}>
        <Row icon="🧭" label={c.defaultTimeframe} first>
          <Choice
            label={c.defaultTimeframe}
            value={local.defaultTimeframe}
            onChange={(v) =>
              save({
                defaultTimeframe: v as
                  | "week"
                  | "month"
                  | "quarter"
                  | "year"
                  | "long_term",
              })
            }
            options={timeframeOptions}
          />
        </Row>
        <Row icon="📆" label={c.countToday} first={false}>
          <Switch
            label={c.countToday}
            checked={local.countToday}
            onChange={(v) => save({ countToday: v })}
          />
        </Row>
        <Row icon="❄️" label={c.streakFreeze} first={false}>
          <Choice
            label={c.streakFreeze}
            value={String(local.streakFreeze)}
            onChange={(v) => save({ streakFreeze: Number(v) })}
            options={[0, 1, 2, 3, 5].map((n) => ({
              value: String(n),
              label: `${n} ${c.daysMonth}`,
            }))}
          />
        </Row>
        <Row icon="🌜" label={c.dayCutoff} first={false}>
          <Choice
            label={c.dayCutoff}
            value={String(local.dayCutoffHour)}
            onChange={(v) => save({ dayCutoffHour: Number(v) })}
            options={[0, 1, 2, 3, 4, 5, 6].map((n) => ({
              value: String(n),
              label: `${n}:00`,
            }))}
          />
        </Row>
        <Row icon="👁" label={c.hideCompleted} first={false}>
          <Switch
            label={c.hideCompleted}
            checked={local.hideCompleted}
            onChange={(v) => save({ hideCompleted: v })}
          />
        </Row>
        <Row
          icon="🏷"
          label={c.categories}
          first={false}
          onClick={() => router.push("/more/categories")}
        />
      </Group>

      <Group title={c.data}>
        <Row icon="⬇️" label={c.export} first>
          <Link
            href="/api/export"
            className="text-sm font-semibold text-[#8FA8FF]"
            prefetch={false}
          >
            JSON
          </Link>
        </Row>
        <Row icon="🔄" label={c.sync} first={false}>
          <Value>{c.syncNote}</Value>
        </Row>
      </Group>

      <Group title={c.privacy}>
        <Row icon="🔒" label={c.lock} first>
          <Switch
            label={c.lock}
            checked={local.biometricLock}
            onChange={(v) => save({ biometricLock: v })}
          />
        </Row>
        <Row icon="📉" label={c.analytics} first={false}>
          <Switch
            label={c.analytics}
            checked={local.analytics}
            onChange={(v) => save({ analytics: v })}
          />
        </Row>
      </Group>

      <Group title={c.about}>
        <Row icon="ℹ️" label={c.version} first>
          <Value>1.0.0</Value>
        </Row>
      </Group>
    </div>
  );
}
