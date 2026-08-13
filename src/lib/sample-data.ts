import type { Locale } from "./i18n";

/**
 * Los datos de ejemplo del diseño. Se usan para la cuenta de demostración y
 * para las plantillas que ofrece el onboarding.
 */

type L = Record<Locale, string>;

export type SampleGoal = {
  key: string;
  category: string;
  type: "numeric" | "percent" | "milestone";
  timeframe: "month" | "quarter" | "year";
  status: "active" | "paused";
  trend: "improving" | "steady" | "behind";
  current: number;
  target: number;
  unit: L;
  title: L;
  desc: L;
  why: L;
  /** Días desde hoy hasta la fecha meta. */
  targetInDays: number;
  milestones?: { done: boolean; t: L }[];
  updates?: { v: number; daysAgo: number; note: L }[];
};

export const SAMPLE_GOALS: SampleGoal[] = [
  {
    key: "g1",
    category: "growth",
    type: "numeric",
    timeframe: "month",
    status: "active",
    trend: "improving",
    current: 3,
    target: 4,
    unit: { es: "libros", en: "books" },
    title: { es: "Leer 4 libros este mes", en: "Read 4 books this month" },
    desc: {
      es: "Un libro por semana para volver al hábito de leer",
      en: "A book a week to rebuild the reading habit",
    },
    why: {
      es: "Leer me saca del piloto automático y me trae ideas nuevas para el trabajo y para mí.",
      en: "Reading pulls me out of autopilot and brings fresh ideas to my work and my life.",
    },
    targetInDays: 18,
    updates: [
      {
        v: 3,
        daysAgo: 3,
        note: {
          es: 'Terminé "Momentum" en dos sentadas',
          en: 'Finished "Momentum" in two sittings',
        },
      },
      {
        v: 2,
        daysAgo: 9,
        note: { es: "Voy al día con el plan del mes", en: "On track with the month plan" },
      },
      { v: 1, daysAgo: 15, note: { es: "Arranqué la primera semana", en: "Started week one" } },
    ],
  },
  {
    key: "g2",
    category: "growth",
    type: "percent",
    timeframe: "quarter",
    status: "active",
    trend: "steady",
    current: 65,
    target: 100,
    unit: { es: "%", en: "%" },
    title: { es: "Terminar curso básico de inglés", en: "Finish beginner English course" },
    desc: {
      es: "Módulo 7 de 10, con práctica de conversación",
      en: "Module 7 of 10, with speaking practice",
    },
    why: {
      es: "Quiero moverme sin fricción en reuniones con el equipo de Londres.",
      en: "I want zero friction in meetings with the London team.",
    },
    targetInDays: 79,
    updates: [
      { v: 65, daysAgo: 5, note: { es: "Módulo 7 completo", en: "Module 7 done" } },
      { v: 50, daysAgo: 24, note: { es: "Mitad del curso", en: "Halfway there" } },
    ],
  },
  {
    key: "g3",
    category: "financial",
    type: "numeric",
    timeframe: "year",
    status: "active",
    trend: "improving",
    current: 18000,
    target: 25000,
    unit: { es: "USD", en: "USD" },
    title: { es: "Ahorrar 25.000 USD este año", en: "Save 25,000 USD this year" },
    desc: {
      es: "Fondo de emergencia y cuota inicial del apartamento",
      en: "Emergency fund and apartment down payment",
    },
    why: {
      es: "Un año de gastos cubiertos es la libertad de decidir sin miedo en qué trabajar.",
      en: "A year of expenses covered means choosing work without fear.",
    },
    targetInDays: 140,
    updates: [
      { v: 18000, daysAgo: 14, note: { es: "Voy al día con el año", en: "On track for the year" } },
      {
        v: 15500,
        daysAgo: 44,
        note: { es: "Bono semestral completo al ahorro", en: "Full mid-year bonus to savings" },
      },
      { v: 12000, daysAgo: 133, note: { es: "Ahorro del Q2", en: "Q2 savings" } },
      { v: 7500, daysAgo: 193, note: { es: "Arranque del año", en: "Start of the year" } },
    ],
  },
  {
    key: "g4",
    category: "health",
    type: "milestone",
    timeframe: "year",
    status: "active",
    trend: "improving",
    current: 3,
    target: 5,
    unit: { es: "hitos", en: "milestones" },
    title: { es: "Correr una media maratón", en: "Run a half marathon" },
    desc: { es: "Media de Bogotá, plan de 16 semanas", en: "Bogotá half, 16-week plan" },
    why: {
      es: "Correr largo me enseña que la constancia rinde más que la motivación.",
      en: "Long runs teach me consistency beats motivation.",
    },
    targetInDays: 94,
    milestones: [
      { done: false, t: { es: "Completar entrenamiento de 18 km", en: "Complete the 18 km long run" } },
      { done: false, t: { es: "Bajar el ritmo a 5:10 min/km", en: "Get pace down to 5:10 min/km" } },
      { done: true, t: { es: "Correr 10 km sin parar", en: "Run 10 km without stopping" } },
      { done: true, t: { es: "Terminar 4 semanas de base", en: "Finish 4 base weeks" } },
      { done: true, t: { es: "Comprar zapatillas de carrera", en: "Buy racing shoes" } },
    ],
  },
  {
    key: "g5",
    category: "career",
    type: "milestone",
    timeframe: "year",
    status: "active",
    trend: "steady",
    current: 3,
    target: 6,
    unit: { es: "hitos", en: "milestones" },
    title: { es: "Ascender a Ingeniero Senior", en: "Get promoted to Senior Engineer" },
    desc: {
      es: "Carpeta de evidencias lista para el comité de diciembre",
      en: "Evidence packet ready for the December committee",
    },
    why: {
      es: "Quiero que mi trabajo se mida por el impacto que dejo en el equipo, no por las horas.",
      en: "I want my work measured by team impact, not hours.",
    },
    targetInDays: 177,
    milestones: [
      { done: false, t: { es: "Completar formación en liderazgo", en: "Complete leadership training" } },
      { done: false, t: { es: "Recibir retroalimentación 360 positiva", en: "Get positive 360 feedback" } },
      { done: false, t: { es: "Conversar el ascenso con el jefe", en: "Discuss the promotion with my manager" } },
      { done: true, t: { es: "Liderar un proyecto de punta a punta", en: "Lead a project end to end" } },
      { done: true, t: { es: "Mentorear a 2 desarrolladores junior", en: "Mentor 2 junior developers" } },
      { done: true, t: { es: "Exponer en la charla técnica del equipo", en: "Speak at the team tech talk" } },
    ],
  },
  {
    key: "g6",
    category: "creative",
    type: "percent",
    timeframe: "year",
    status: "paused",
    trend: "behind",
    current: 40,
    target: 100,
    unit: { es: "%", en: "%" },
    title: { es: "Renovar mi portafolio", en: "Rebuild my portfolio" },
    desc: {
      es: "Seis casos de estudio escritos y maquetados",
      en: "Six case studies written and laid out",
    },
    why: {
      es: "Contar bien lo que hago es la mitad del trabajo.",
      en: "Telling the story well is half the work.",
    },
    targetInDays: 129,
    updates: [
      {
        v: 40,
        daysAgo: 60,
        note: {
          es: "Dos casos listos, en pausa por el curso",
          en: "Two cases done, paused for the course",
        },
      },
    ],
  },
];

export type SampleHabit = {
  key: string;
  emoji: string;
  color: string;
  type: "binary" | "count" | "duration";
  target: number;
  frequency: "daily" | "specific";
  days?: number[];
  name: L;
  /** Valores de la semana en curso, de lunes a domingo. */
  week: number[];
  /** Probabilidad de cumplimiento al generar el histórico del heatmap. */
  rate: number;
};

export const SAMPLE_HABITS: SampleHabit[] = [
  {
    key: "h1",
    emoji: "🏋️",
    color: "#FF8A5B",
    type: "count",
    target: 3,
    frequency: "daily",
    name: { es: "Entrenamiento matutino", en: "Morning workout" },
    week: [3, 2, 3, 1, 3, 0, 0],
    rate: 0.72,
  },
  {
    key: "h2",
    emoji: "📖",
    color: "#6C8CF5",
    type: "binary",
    target: 1,
    frequency: "daily",
    name: { es: "Leer 20 páginas", en: "Read 20 pages" },
    week: [1, 1, 1, 0, 1, 1, 0],
    rate: 0.78,
  },
  {
    key: "h3",
    emoji: "💧",
    color: "#22D3EE",
    type: "count",
    target: 8,
    frequency: "daily",
    name: { es: "Tomar 8 vasos de agua", en: "Drink 8 glasses of water" },
    week: [8, 6, 8, 8, 5, 3, 0],
    rate: 0.8,
  },
  {
    key: "h4",
    emoji: "👟",
    color: "#34D399",
    type: "binary",
    target: 1,
    frequency: "daily",
    name: { es: "10 mil pasos", en: "10k steps" },
    week: [1, 1, 0, 1, 1, 1, 0],
    rate: 0.66,
  },
  {
    key: "h5",
    emoji: "🧘",
    color: "#A78BFA",
    type: "duration",
    target: 15,
    frequency: "daily",
    name: { es: "Meditación", en: "Meditation" },
    week: [44, 15, 0, 32, 15, 0, 0],
    rate: 0.6,
  },
  {
    key: "h6",
    emoji: "🎯",
    color: "#818CF8",
    type: "duration",
    target: 90,
    frequency: "daily",
    name: { es: "Trabajo profundo", en: "Deep work" },
    week: [117, 131, 0, 95, 141, 0, 0],
    rate: 0.55,
  },
  {
    key: "h7",
    emoji: "🍲",
    color: "#F2C94C",
    type: "binary",
    target: 1,
    frequency: "specific",
    days: [5, 6],
    name: { es: "Preparar comidas del fin de semana", en: "Weekend meal prep" },
    week: [0, 0, 0, 0, 0, 1, 0],
    rate: 0.7,
  },
];

export type SampleTask = {
  key: string;
  priority: "high" | "med" | "low";
  goal?: string;
  /** Días desde hoy; null significa sin fecha. */
  dueInDays: number | null;
  recurrence?: "weekly";
  title: L;
  subs?: { t: L; done: boolean }[];
};

export const SAMPLE_TASKS: SampleTask[] = [
  {
    key: "t1",
    priority: "high",
    goal: "g5",
    dueInDays: -2,
    title: { es: "Enviar la solicitud de retroalimentación 360", en: "Send the 360 feedback request" },
  },
  {
    key: "t2",
    priority: "high",
    goal: "g3",
    dueInDays: 0,
    title: { es: "Transferir el ahorro de agosto", en: "Transfer August savings" },
    subs: [
      { t: { es: "Revisar gastos de la quincena", en: "Review fortnight spending" }, done: true },
      { t: { es: "Programar transferencia automática", en: "Schedule auto transfer" }, done: false },
    ],
  },
  {
    key: "t3",
    priority: "med",
    goal: "g1",
    dueInDays: 0,
    title: { es: 'Leer el capítulo 4 de "Momentum"', en: 'Read chapter 4 of "Momentum"' },
  },
  {
    key: "t4",
    priority: "low",
    dueInDays: 0,
    recurrence: "weekly",
    title: { es: "Planear el menú de la semana", en: "Plan the weekly menu" },
  },
  {
    key: "t5",
    priority: "med",
    goal: "g4",
    dueInDays: 1,
    title: { es: "Salida larga de 18 km", en: "18 km long run" },
  },
  {
    key: "t6",
    priority: "low",
    dueInDays: 1,
    title: { es: "Reservar cita con el fisioterapeuta", en: "Book the physio appointment" },
  },
  {
    key: "t7",
    priority: "high",
    goal: "g5",
    dueInDays: 4,
    title: { es: "Preparar la conversación de ascenso", en: "Prepare the promotion conversation" },
    subs: [
      { t: { es: "Listar logros del semestre", en: "List the half-year wins" }, done: false },
      { t: { es: "Pedir ejemplos a dos compañeros", en: "Ask two peers for examples" }, done: false },
    ],
  },
  {
    key: "t8",
    priority: "med",
    goal: "g2",
    dueInDays: 6,
    title: { es: "Terminar el módulo 8 del curso", en: "Finish module 8 of the course" },
  },
  {
    key: "t9",
    priority: "low",
    dueInDays: 20,
    title: { es: "Renovar la inscripción de la media maratón", en: "Renew the half marathon entry" },
  },
  {
    key: "t10",
    priority: "low",
    goal: "g6",
    dueInDays: null,
    title: { es: "Bocetar la portada del portafolio", en: "Sketch the portfolio cover" },
  },
];

/** Plantillas del tercer paso del onboarding. */
export const ONBOARDING_TEMPLATES = [
  { key: "p1", goal: "g1", label: { es: "📚 Leer 4 libros", en: "📚 Read 4 books" } },
  { key: "p2", goal: "g3", label: { es: "💰 Ahorrar 25.000 USD", en: "💰 Save 25,000 USD" } },
  { key: "p3", goal: "g4", label: { es: "🏃 Media maratón", en: "🏃 Half marathon" } },
  { key: "p4", habit: "h5", label: { es: "🧘 Meditar a diario", en: "🧘 Meditate daily" } },
] as const;
