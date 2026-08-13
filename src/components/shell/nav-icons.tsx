const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
} as const;

export function TodayIcon() {
  return (
    <svg {...base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.2 12.4l2.6 2.6L16 9.6" />
    </svg>
  );
}

export function GoalsIcon() {
  return (
    <svg {...base} strokeLinecap="round">
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.4" />
    </svg>
  );
}

export function HabitsIcon() {
  return (
    <svg {...base}>
      <rect x="4" y="4" width="7" height="7" rx="2.2" />
      <rect x="13" y="4" width="7" height="7" rx="2.2" />
      <rect x="4" y="13" width="7" height="7" rx="2.2" />
      <rect x="13" y="13" width="7" height="7" rx="2.2" />
    </svg>
  );
}

export function TasksIcon() {
  return (
    <svg {...base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10" />
      <path d="M3.6 6.4l1.3 1.3 2.2-2.4M3.6 11.9l1.3 1.3 2.2-2.4M3.6 17.4l1.3 1.3 2.2-2.4" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="6" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="18" cy="12" r="1.7" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg {...base} width={19} height={19} strokeLinecap="round">
      <path d="M18 15.5V11a6 6 0 10-12 0v4.5L4.5 18h15L18 15.5z" />
      <path d="M10 20.5a2.2 2.2 0 004 0" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg {...base} width={19} height={19} strokeLinecap="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg {...base} width={19} height={19}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
      <path d="M3.5 9.5h17M8 4.5v-2M16 4.5v-2" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg {...base} width={19} height={19}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  );
}

export function PencilIcon() {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h4l10-10a2.5 2.5 0 00-3.5-3.5L4.5 16.5 4 20z" />
    </svg>
  );
}
