export const STORAGE_KEYS = {
  notes: "notative.notes.v2",
  tasks: "notative.tasks.v2",
  portfolios: "notative.portfolios.v1",
  markers: "notative.markers.v1",
  settings: "notative.settings.v1"
};

export const DEFAULT_PORTFOLIOS = [{ id: "portfolio-general", name: "General" }];

export const DEFAULT_SETTINGS = {
  theme: "midnight",
  fontScale: "medium",
  layout: {
    showSidebar: true,
    showDetailPanel: true,
    panelOrder: ["rail", "sidebar", "main", "detail"]
  }
};

export const SECTION_LABELS = {
  notes: "Notes",
  todos: "To Do List",
  calendar: "Calendar",
  notifications: "Notifications",
  settings: "Settings"
};

export const TASK_WINDOWS = [
  { id: "all", label: "All Tasks" },
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Due Today" },
  { id: "tomorrow", label: "Due Tomorrow" },
  { id: "next7", label: "Next 7 Days" }
];

export const CALENDAR_VIEWS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "scheduled", label: "Scheduled Only" },
  { id: "completed", label: "Completed" }
];

export const CALENDAR_BUCKETS = [
  ["overdue", "Overdue"],
  ["today", "Today"],
  ["tomorrow", "Tomorrow"],
  ["next7", "Next 7 Days"],
  ["later", "Later"],
  ["unscheduled", "Unscheduled"]
];
