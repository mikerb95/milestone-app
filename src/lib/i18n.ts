export type Locale = "es" | "en";

export const LOCALES: Locale[] = ["es", "en"];

export const dict = {
  es: {
    /* Navegación y cabeceras */
    today: "Hoy",
    goals: "Metas",
    habits: "Hábitos",
    tasks: "Tareas",
    more: "Más",
    settings: "Ajustes",

    /* Hoy */
    greeting: "Hola",
    todayHabits: "HÁBITOS DE HOY",
    todayTasks: "TAREAS DE HOY",
    goalsToUpdate: "METAS POR ACTUALIZAR",
    allDone: "¡Día cerrado!",
    allDoneSub:
      "Terminaste todo lo de hoy. Disfruta el resto de la tarde sin culpa.",
    nothingToday: "Nada pendiente para hoy todavía.",
    thingsLeft: (n: number) => `Te quedan ${n} cosas por hoy`,
    oneThingLeft: "Te queda 1 cosa por hoy",
    allDoneToday: "Todo hecho por hoy.",
    staleNote: (d: number) =>
      d === 1 ? "Sin actualizar hace 1 día" : `Sin actualizar hace ${d} días`,
    neverUpdated: "Sin actualizar todavía",

    /* Metas */
    update: "Actualizar",
    why: "POR QUÉ IMPORTA",
    updates: "ACTUALIZACIONES RECIENTES",
    status: "ESTADO",
    milestones: "HITOS",
    next: "SIGUIENTE",
    complete: "Completar",
    pause: "Pausar",
    resume: "Reanudar",
    reopen: "Reabrir",
    logProgress: "Registrar avance",
    updateMs: "Actualizar hitos",
    targetDate: "Fecha meta:",
    statusActive: "ACTIVA",
    statusPaused: "EN PAUSA",
    statusDone: "COMPLETADA",
    improving: "Mejorando",
    steady: "Estable",
    behind: "Atrasado",
    risk: "En riesgo",
    noGoals: "Todavía no tienes metas. Crea la primera con el botón +.",
    addMilestone: "Añadir hito",
    milestonePh: "¿Cuál es el siguiente paso?",
    deleteGoal: "Eliminar meta",
    editGoal: "Editar meta",

    /* Hábitos */
    todayPill: "Hoy",
    weekView: "Vista semana",
    yearView: "Vista año",
    noHabits: "Todavía no tienes hábitos. Crea el primero con el botón +.",
    deleteHabit: "Eliminar hábito",
    editHabit: "Editar hábito",
    daysUnit: "días",
    min: "min",
    typeBinary: "Binario",
    typeCount: "Contable",
    typeDuration: "Duración",

    /* Tareas */
    overdue: "VENCIDAS",
    tomorrow: "MAÑANA",
    thisWeek: "ESTA SEMANA",
    later: "DESPUÉS",
    nodate: "SIN FECHA",
    completed: "COMPLETADAS",
    subtasks: (n: number) => `${n} subtareas`,
    oneSubtask: "1 subtarea",
    emptyTasks: "Nada por acá todavía. Suma algo que quieras sacar del camino.",
    addTask: "Añadir tarea",
    addSubtask: "Añadir subtarea",
    deleteTask: "Eliminar tarea",

    /* Formularios */
    newGoal: "Nueva meta",
    newHabit: "Nuevo hábito",
    newTask: "Nueva tarea",
    logTitle: "Registrar avance",
    category: "CATEGORÍA",
    timeframe: "HORIZONTE",
    goalType: "TIPO DE META",
    color: "COLOR",
    habitType: "TIPO",
    frequency: "FRECUENCIA",
    priority: "PRIORIDAD",
    goalTitlePh: "Título de la meta",
    goalDescPh: "Descripción corta",
    goalWhyPh: "¿Por qué importa?",
    targetValuePh: "Valor objetivo",
    unitPh: "Unidad",
    habitNamePh: "Nombre del hábito",
    taskTitlePh: "¿Qué hay que hacer?",
    notePlaceholder: "Nota opcional",
    reminder: "Recordatorio",
    dueDate: "Fecha de vencimiento",
    linkGoal: "Vincular a una meta",
    none: "Ninguna",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    undo: "Deshacer",
    saving: "Guardando…",
    timesPerWeek: "veces por semana",
    minutesPerDay: "minutos al día",
    timesPerDay: "veces al día",

    /* Auth */
    welcomeSub:
      "Metas con horizonte, hábitos con racha y un día claro. Sin fricción.",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    explore: "Explorar la demo",
    email: "CORREO",
    password: "CONTRASEÑA",
    nameLabel: "NOMBRE",
    forgot: "¿Olvidaste tu contraseña?",
    forgotTitle: "Recuperar contraseña",
    google: "Continuar con Google",
    forgotHelp:
      "Te enviamos un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.",
    resetCta: "Enviar enlace",
    signOut: "Cerrar sesión",
    continueLabel: "Continuar",
    enterApp: "Entrar a Milestone",
    step: "PASO",

    /* Errores */
    errInvalidCredentials: "Correo o contraseña incorrectos.",
    errEmailTaken: "Ya existe una cuenta con ese correo.",
    errGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errRequired: "Este campo es obligatorio.",
    errShortPassword: "La contraseña debe tener al menos 8 caracteres.",
    errInvalidEmail: "Escribe un correo válido.",

    /* Toasts */
    saved: "Guardado",
    progressLogged: "Avance registrado",
    taskCompleted: "Tarea completada",
    taskDeleted: "Tarea eliminada",
    goalCompleted: "Meta marcada como completada",
    goalPaused: "Meta en pausa",
    goalResumed: "Meta reactivada",
    goalDeleted: "Meta eliminada",
    habitDeleted: "Hábito eliminado",
    logged: "registrado",
    remindersPending: (n: number) => `${n} recordatorios pendientes hoy`,
    comingSoon: "pantalla en camino",
    sensitiveAction: "Acción sensible: pediríamos confirmación",
  },

  en: {
    today: "Today",
    goals: "Goals",
    habits: "Habits",
    tasks: "Tasks",
    more: "More",
    settings: "Settings",

    greeting: "Hi",
    todayHabits: "TODAY'S HABITS",
    todayTasks: "TASKS DUE TODAY",
    goalsToUpdate: "GOALS TO UPDATE",
    allDone: "Day closed!",
    allDoneSub: "You finished everything for today. Enjoy the rest of it, guilt free.",
    nothingToday: "Nothing due today yet.",
    thingsLeft: (n: number) => `${n} things left for today`,
    oneThingLeft: "1 thing left for today",
    allDoneToday: "All done for today.",
    staleNote: (d: number) =>
      d === 1 ? "Not updated in 1 day" : `Not updated in ${d} days`,
    neverUpdated: "Never updated",

    update: "Update",
    why: "WHY IT MATTERS",
    updates: "RECENT UPDATES",
    status: "STATUS",
    milestones: "MILESTONES",
    next: "NEXT",
    complete: "Complete",
    pause: "Pause",
    resume: "Resume",
    reopen: "Reopen",
    logProgress: "Log progress",
    updateMs: "Update milestones",
    targetDate: "Target date:",
    statusActive: "ACTIVE",
    statusPaused: "PAUSED",
    statusDone: "COMPLETED",
    improving: "Improving",
    steady: "Steady",
    behind: "Behind",
    risk: "At risk",
    noGoals: "No goals yet. Create your first one with the + button.",
    addMilestone: "Add milestone",
    milestonePh: "What's the next step?",
    deleteGoal: "Delete goal",
    editGoal: "Edit goal",

    todayPill: "Today",
    weekView: "Week view",
    yearView: "Year view",
    noHabits: "No habits yet. Create your first one with the + button.",
    deleteHabit: "Delete habit",
    editHabit: "Edit habit",
    daysUnit: "days",
    min: "min",
    typeBinary: "Binary",
    typeCount: "Countable",
    typeDuration: "Duration",

    overdue: "OVERDUE",
    tomorrow: "TOMORROW",
    thisWeek: "THIS WEEK",
    later: "LATER",
    nodate: "NO DATE",
    completed: "COMPLETED",
    subtasks: (n: number) => `${n} subtasks`,
    oneSubtask: "1 subtask",
    emptyTasks: "Nothing here yet. Add something you want off your plate.",
    addTask: "Add task",
    addSubtask: "Add subtask",
    deleteTask: "Delete task",

    newGoal: "New goal",
    newHabit: "New habit",
    newTask: "New task",
    logTitle: "Log progress",
    category: "CATEGORY",
    timeframe: "TIMEFRAME",
    goalType: "GOAL TYPE",
    color: "COLOR",
    habitType: "TYPE",
    frequency: "FREQUENCY",
    priority: "PRIORITY",
    goalTitlePh: "Goal title",
    goalDescPh: "Short description",
    goalWhyPh: "Why does it matter?",
    targetValuePh: "Target value",
    unitPh: "Unit",
    habitNamePh: "Habit name",
    taskTitlePh: "What needs doing?",
    notePlaceholder: "Optional note",
    reminder: "Reminder",
    dueDate: "Due date",
    linkGoal: "Link to a goal",
    none: "None",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    undo: "Undo",
    saving: "Saving…",
    timesPerWeek: "times a week",
    minutesPerDay: "minutes a day",
    timesPerDay: "times a day",

    welcomeSub:
      "Goals with a horizon, habits with a streak, and a clear day. Zero friction.",
    signIn: "Sign in",
    signUp: "Create account",
    explore: "Explore the demo",
    email: "EMAIL",
    password: "PASSWORD",
    nameLabel: "NAME",
    forgot: "Forgot your password?",
    forgotTitle: "Reset password",
    google: "Continue with Google",
    forgotHelp:
      "We'll send you a link to set a new password. Check your spam folder too.",
    resetCta: "Send link",
    signOut: "Sign out",
    continueLabel: "Continue",
    enterApp: "Enter Milestone",
    step: "STEP",

    errInvalidCredentials: "Wrong email or password.",
    errEmailTaken: "An account with that email already exists.",
    errGeneric: "Something went wrong. Try again.",
    errRequired: "This field is required.",
    errShortPassword: "Password must be at least 8 characters.",
    errInvalidEmail: "Enter a valid email.",

    saved: "Saved",
    progressLogged: "Progress logged",
    taskCompleted: "Task completed",
    taskDeleted: "Task deleted",
    goalCompleted: "Goal marked completed",
    goalPaused: "Goal paused",
    goalResumed: "Goal resumed",
    goalDeleted: "Goal deleted",
    habitDeleted: "Habit deleted",
    logged: "logged",
    remindersPending: (n: number) => `${n} reminders pending today`,
    comingSoon: "screen coming up",
    sensitiveAction: "Sensitive action: we would ask to confirm",
  },
} as const;

export type Dict = (typeof dict)["es"];

export function t(locale: Locale): Dict {
  return dict[locale] as Dict;
}

/* Etiquetas compartidas que dependen del idioma pero viven fuera del dict plano. */

export const timeframeLabels: Record<string, Record<Locale, string>> = {
  week: { es: "ESTA SEMANA", en: "THIS WEEK" },
  month: { es: "ESTE MES", en: "THIS MONTH" },
  quarter: { es: "ESTE TRIMESTRE", en: "THIS QUARTER" },
  year: { es: "ESTE AÑO", en: "THIS YEAR" },
  long_term: { es: "LARGO PLAZO", en: "LONG TERM" },
};

export const timeframePlain: Record<string, Record<Locale, string>> = {
  week: { es: "Esta semana", en: "This week" },
  month: { es: "Este mes", en: "This month" },
  quarter: { es: "Este trimestre", en: "This quarter" },
  year: { es: "Este año", en: "This year" },
  long_term: { es: "Largo plazo", en: "Long term" },
};

export const taskGroupLabels: Record<string, Record<Locale, string>> = {
  overdue: { es: "VENCIDAS", en: "OVERDUE" },
  today: { es: "HOY", en: "TODAY" },
  tomorrow: { es: "MAÑANA", en: "TOMORROW" },
  week: { es: "ESTA SEMANA", en: "THIS WEEK" },
  later: { es: "DESPUÉS", en: "LATER" },
  nodate: { es: "SIN FECHA", en: "NO DATE" },
  done: { es: "COMPLETADAS", en: "COMPLETED" },
};

export const priorityLabels: Record<string, Record<Locale, string>> = {
  high: { es: "Alta", en: "High" },
  med: { es: "Media", en: "Medium" },
  low: { es: "Baja", en: "Low" },
};

export const goalTypeLabels: Record<string, Record<Locale, string>> = {
  numeric: { es: "Numérica", en: "Numeric" },
  percent: { es: "Porcentaje", en: "Percent" },
  milestone: { es: "Hitos", en: "Milestones" },
  binary: { es: "Binaria", en: "Binary" },
};

export const habitTypeLabels: Record<string, Record<Locale, string>> = {
  binary: { es: "Binario", en: "Binary" },
  count: { es: "Contable", en: "Countable" },
  duration: { es: "Duración", en: "Duration" },
};

export const frequencyLabels: Record<string, Record<Locale, string>> = {
  daily: { es: "Diaria", en: "Daily" },
  weekly_n: { es: "X veces por semana", en: "X times a week" },
  specific: { es: "Días específicos", en: "Specific days" },
};

export const recurrenceLabels: Record<string, Record<Locale, string>> = {
  daily: { es: "cada día", en: "daily" },
  weekly: { es: "cada semana", en: "weekly" },
  monthly: { es: "cada mes", en: "monthly" },
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: "#FF453A",
  med: "#F2C94C",
  low: "#6C8CF5",
};

export function tr(
  map: Record<string, Record<Locale, string>>,
  key: string | null | undefined,
  locale: Locale,
): string {
  if (!key) return "";
  return map[key]?.[locale] ?? key;
}

export function dayNames(locale: Locale): string[] {
  return locale === "es"
    ? ["LU", "MA", "MI", "JU", "VI", "SA", "DO"]
    : ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
}

export function intlLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "es-CO";
}
