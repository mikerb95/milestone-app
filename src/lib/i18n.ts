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
    deleteGoalConfirm:
      "Se borra la meta con sus hitos y su historial de avances. No hay vuelta atrás. ¿La eliminamos?",
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
    editTask: "Editar tarea",

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
    deleteGoalConfirm:
      "This deletes the goal with its milestones and progress history. There is no way back. Delete it?",
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
    editTask: "Edit task",

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

/**
 * Explicaciones que muestra el botón "?" de las hojas. Van aparte del
 * diccionario principal para no mezclarlas con las etiquetas de la interfaz.
 */
export const helpText = {
  es: {
    helpToggle: "Qué significa cada campo",

    goalTitle: "El resultado que buscas, en una frase. Por ejemplo: leer 4 libros este mes.",
    goalDescription: "Una línea de contexto. Es lo que se lee bajo el título en la tarjeta.",
    goalWhy: "Tu motivo de fondo. Aparece en el detalle para los días en que flojee el impulso.",
    goalCategory: "Agrupa la meta y le presta su color e icono en toda la app.",
    goalTimeframe: "El plazo. Ordena las metas en la lista y propone una fecha meta.",
    goalType:
      "Numérica: cuentas unidades hasta un objetivo. Porcentaje: avanzas de 0 a 100. Hitos: pasos que vas marcando. Binaria: hecha o no.",
    goalTarget: "El número al que quieres llegar y cómo se llama lo que cuentas.",
    goalMilestones: "Los pasos concretos. El avance de la meta es cuántos llevas cumplidos.",
    goalTargetDate: "Cuándo quieres tenerla lista. Si la dejas vacía usamos la del horizonte.",
    goalReminder: "Te avisa cuando la meta lleva demasiado tiempo sin movimiento.",

    habitName: "El nombre y el emoji con los que lo reconocerás en la rejilla.",
    habitColor: "Tiñe las celdas de la semana y el mapa de calor anual.",
    habitType:
      "Binario: lo hiciste o no. Contable: cuentas repeticiones. Duración: acumulas minutos.",
    habitTarget: "Cuánto hace falta para dar el día por cumplido.",
    habitFrequency:
      "Qué días cuentan. Los días que no tocan no rompen la racha si los dejas en blanco.",
    habitWeeklyTarget: "Cuántos días de la semana quieres cumplirlo, sin fijar cuáles.",
    habitDays: "Los días concretos en los que toca. El resto ni suma ni resta.",

    taskTitle: "Qué hay que hacer, en una frase corta.",
    taskPriority: "Ordena la lista: lo alto sube al principio de su grupo.",
    taskDueDate: "Decide en qué grupo cae: vencidas, hoy, mañana, esta semana o después.",
    taskGoal: "La conecta con una meta y le pone su etiqueta de color.",
    taskRecurrence: "Al completarla no se cierra: se reprograma sola al siguiente ciclo.",
    taskSubtasks: "Pasos internos de la tarea. No cuentan aparte en el progreso del día.",

    logValue: "El total acumulado hasta hoy, no lo que sumaste en esta sesión.",
    logNote: "Para acordarte de qué pasó cuando revises el historial.",
  },
  en: {
    helpToggle: "What each field means",

    goalTitle: "The outcome you want, in one sentence. For example: read 4 books this month.",
    goalDescription: "One line of context. It shows under the title on the card.",
    goalWhy: "Your underlying reason. It shows in the detail for the days motivation dips.",
    goalCategory: "Groups the goal and lends it its color and icon across the app.",
    goalTimeframe: "The horizon. It sorts goals in the list and suggests a target date.",
    goalType:
      "Numeric: count units toward a target. Percent: move from 0 to 100. Milestones: steps you tick off. Binary: done or not.",
    goalTarget: "The number you want to reach and the name of what you count.",
    goalMilestones: "The concrete steps. Goal progress is how many you have ticked off.",
    goalTargetDate: "When you want it done. Leave it empty and we use the horizon's date.",
    goalReminder: "Nudges you when the goal has gone too long without movement.",

    habitName: "The name and emoji you will recognise in the grid.",
    habitColor: "Tints the week cells and the yearly heatmap.",
    habitType:
      "Binary: you did it or not. Countable: count repetitions. Duration: add up minutes.",
    habitTarget: "How much it takes to call the day done.",
    habitFrequency:
      "Which days count. Days that are not scheduled will not break your streak.",
    habitWeeklyTarget: "How many days a week you want it, without pinning which ones.",
    habitDays: "The specific days it is due. The rest neither add nor subtract.",

    taskTitle: "What needs doing, in a short sentence.",
    taskPriority: "Sorts the list: high priority rises to the top of its group.",
    taskDueDate: "Decides its group: overdue, today, tomorrow, this week or later.",
    taskGoal: "Links it to a goal and gives it that goal's colored tag.",
    taskRecurrence: "Completing it does not close it: it reschedules to the next cycle.",
    taskSubtasks: "Inner steps of the task. They do not count separately in the day's progress.",

    logValue: "The running total as of today, not what you added in this session.",
    logNote: "So you remember what happened when you look back at the history.",
  },
} as const;

export type HelpText = (typeof helpText)["es"];

export function help(locale: Locale): HelpText {
  return helpText[locale] as HelpText;
}

export function dayNames(locale: Locale): string[] {
  return locale === "es"
    ? ["LU", "MA", "MI", "JU", "VI", "SA", "DO"]
    : ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
}

export function intlLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "es-CO";
}
