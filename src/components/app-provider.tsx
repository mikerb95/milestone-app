"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { t as dictFor, type Dict, type Locale } from "@/lib/i18n";
import type { UserSettings } from "@/db/schema";

export type ClientSettings = Pick<
  UserSettings,
  | "locale"
  | "timezone"
  | "textSize"
  | "reduceMotion"
  | "reduceTransparency"
  | "accentColor"
  | "countToday"
  | "hideCompleted"
  | "firstDayOfWeek"
  | "defaultTimeframe"
>;

export type ClientUser = {
  name: string;
  initial: string;
  image: string | null;
};

type AppContextValue = {
  locale: Locale;
  t: Dict;
  settings: ClientSettings;
  /** "Hoy" ya resuelto en el servidor: evita desajustes de huso al hidratar. */
  today: string;
  user: ClientUser;
  /** Pendientes de hoy: alimenta la insignia de la campana y la de Hoy. */
  reminders: number;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}

/** Atajo para los componentes que solo necesitan textos. */
export function useT(): Dict {
  return useApp().t;
}

export function AppProvider({
  settings,
  today,
  children,
}: {
  settings: ClientSettings;
  today: string;
  children: React.ReactNode;
}) {
  const value = useMemo<AppContextValue>(
    () => ({
      locale: settings.locale,
      t: dictFor(settings.locale),
      settings,
      today,
    }),
    [settings, today],
  );

  /* Los ajustes de accesibilidad viven en <html> para que el CSS los vea. */
  useEffect(() => {
    const root = document.documentElement;
    root.lang = settings.locale;
    root.dataset.motion = settings.reduceMotion ? "reduced" : "normal";
    root.dataset.transparency = settings.reduceTransparency ? "reduced" : "normal";
    root.dataset.textSize = settings.textSize;
  }, [
    settings.locale,
    settings.reduceMotion,
    settings.reduceTransparency,
    settings.textSize,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
