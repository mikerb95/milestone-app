import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

/* ------------------------------------------------------------------ */
/* Auth.js                                                             */
/* ------------------------------------------------------------------ */

export const users = sqliteTable("user", {
  id: id(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  /* Null para cuentas que solo entran por Google. */
  passwordHash: text("password_hash"),
  createdAt: createdAt(),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_idx").on(t.userId),
  ],
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* Tokens de un solo uso para "olvidé mi contraseña". */
export const passwordResetTokens = sqliteTable(
  "password_reset_token",
  {
    token: text("token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("prt_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Dominio                                                             */
/* ------------------------------------------------------------------ */

export type GoalType = "numeric" | "percent" | "milestone" | "binary";
export type Timeframe = "week" | "month" | "quarter" | "year" | "long_term";
export type GoalStatus = "active" | "paused" | "completed";
export type Trend = "improving" | "steady" | "behind" | "risk";
export type HabitType = "binary" | "count" | "duration";
export type HabitFrequency = "daily" | "weekly_n" | "specific";
export type Priority = "high" | "med" | "low";

export const categories = sqliteTable(
  "category",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /* Clave estable de las 6 categorías sembradas; null si la creó el usuario. */
    slug: text("slug"),
    name: text("name").notNull(),
    nameEn: text("name_en"),
    emoji: text("emoji").notNull().default("🎯"),
    color: text("color").notNull().default("#6C8CF5"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("category_user_idx").on(t.userId)],
);

export const goals = sqliteTable(
  "goal",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    why: text("why"),
    type: text("type").$type<GoalType>().notNull().default("numeric"),
    timeframe: text("timeframe").$type<Timeframe>().notNull().default("year"),
    status: text("status").$type<GoalStatus>().notNull().default("active"),
    trend: text("trend").$type<Trend>().notNull().default("steady"),
    currentValue: real("current_value").notNull().default(0),
    targetValue: real("target_value").notNull().default(100),
    /* Punto de partida: sirve para calcular el avance del periodo. */
    startValue: real("start_value").notNull().default(0),
    unit: text("unit"),
    targetDate: text("target_date"),
    reminder: integer("reminder", { mode: "boolean" }).notNull().default(false),
    archived: integer("archived", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    lastProgressAt: integer("last_progress_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("goal_user_idx").on(t.userId),
    index("goal_user_tf_idx").on(t.userId, t.timeframe),
  ],
);

export const milestones = sqliteTable(
  "milestone",
  {
    id: id(),
    goalId: text("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    done: integer("done", { mode: "boolean" }).notNull().default(false),
    doneAt: integer("done_at", { mode: "timestamp_ms" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("milestone_goal_idx").on(t.goalId)],
);

export const goalUpdates = sqliteTable(
  "goal_update",
  {
    id: id(),
    goalId: text("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    value: real("value").notNull(),
    note: text("note"),
    /* YYYY-MM-DD en la zona del usuario, para agrupar sin líos de husos. */
    date: text("date").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("goal_update_goal_idx").on(t.goalId, t.date)],
);

export const habits = sqliteTable(
  "habit",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    emoji: text("emoji").notNull().default("🎯"),
    color: text("color").notNull().default("#FF8A5B"),
    type: text("type").$type<HabitType>().notNull().default("binary"),
    /* Veces al día para count, minutos para duration. */
    targetValue: real("target_value").notNull().default(1),
    frequency: text("frequency")
      .$type<HabitFrequency>()
      .notNull()
      .default("daily"),
    /* Cuántos días a la semana cuando frequency = weekly_n. */
    weeklyTarget: integer("weekly_target").notNull().default(7),
    /* JSON con los días activos (0 = lunes) cuando frequency = specific. */
    days: text("days", { mode: "json" }).$type<number[]>(),
    archived: integer("archived", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("habit_user_idx").on(t.userId)],
);

export const habitEntries = sqliteTable(
  "habit_entry",
  {
    id: id(),
    habitId: text("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    value: real("value").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("habit_entry_unique").on(t.habitId, t.date),
    index("habit_entry_date_idx").on(t.date),
  ],
);

export const tasks = sqliteTable(
  "task",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    goalId: text("goal_id").references(() => goals.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    notes: text("notes"),
    priority: text("priority").$type<Priority>().notNull().default("med"),
    dueDate: text("due_date"),
    /* daily | weekly | monthly | null */
    recurrence: text("recurrence"),
    done: integer("done", { mode: "boolean" }).notNull().default(false),
    doneAt: integer("done_at", { mode: "timestamp_ms" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    index("task_user_idx").on(t.userId),
    index("task_user_due_idx").on(t.userId, t.dueDate),
  ],
);

export const subtasks = sqliteTable(
  "subtask",
  {
    id: id(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    done: integer("done", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("subtask_task_idx").on(t.taskId)],
);

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  locale: text("locale").$type<"es" | "en">().notNull().default("es"),
  timezone: text("timezone").notNull().default("America/Bogota"),
  dateFormat: text("date_format").notNull().default("d MMM yyyy"),
  timeFormat: text("time_format").$type<"24h" | "12h">().notNull().default("24h"),
  firstDayOfWeek: integer("first_day_of_week").notNull().default(1),
  currency: text("currency").notNull().default("COP"),
  unitSystem: text("unit_system")
    .$type<"metric" | "imperial">()
    .notNull()
    .default("metric"),

  theme: text("theme").notNull().default("dark"),
  accentColor: text("accent_color").notNull().default("#FF8A3D"),
  textSize: text("text_size")
    .$type<"small" | "medium" | "large">()
    .notNull()
    .default("medium"),
  reduceMotion: integer("reduce_motion", { mode: "boolean" })
    .notNull()
    .default(false),
  reduceTransparency: integer("reduce_transparency", { mode: "boolean" })
    .notNull()
    .default(false),

  notifications: integer("notifications", { mode: "boolean" })
    .notNull()
    .default(true),
  streakAlerts: integer("streak_alerts", { mode: "boolean" })
    .notNull()
    .default(true),
  dailySummary: text("daily_summary").default("07:30"),
  weeklySummary: text("weekly_summary").default("sun 20:00"),
  goalNudges: text("goal_nudges").default("weekly"),
  quietHoursStart: text("quiet_hours_start").default("22:00"),
  quietHoursEnd: text("quiet_hours_end").default("06:30"),

  defaultTimeframe: text("default_timeframe")
    .$type<Timeframe>()
    .notNull()
    .default("month"),
  countToday: integer("count_today", { mode: "boolean" }).notNull().default(true),
  streakFreeze: integer("streak_freeze").notNull().default(2),
  dayCutoffHour: integer("day_cutoff_hour").notNull().default(3),
  hideCompleted: integer("hide_completed", { mode: "boolean" })
    .notNull()
    .default(false),

  sync: integer("sync", { mode: "boolean" }).notNull().default(true),
  biometricLock: integer("biometric_lock", { mode: "boolean" })
    .notNull()
    .default(false),
  analytics: integer("analytics", { mode: "boolean" }).notNull().default(false),

  onboardedAt: integer("onboarded_at", { mode: "timestamp_ms" }),
});

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type GoalUpdate = typeof goalUpdates.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type HabitEntry = typeof habitEntries.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Subtask = typeof subtasks.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
