import {
  CALENDAR_VIEWS,
  DEFAULT_PORTFOLIOS,
  SECTION_LABELS,
  STORAGE_KEYS,
  TASK_WINDOWS
} from "./constants.js";
import { normalizeSettings } from "./settings.js";
import { getTaskDueBucket } from "../utils/date.js";

function loadArray(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function loadObject(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function normalizeNotes(items) {
  return (Array.isArray(items) ? items : []).map((note) => ({
    id: note.id || crypto.randomUUID(),
    title: note.title || "Untitled note",
    body: note.body || "",
    updatedAt: note.updatedAt || Date.now(),
    portfolioId: note.portfolioId || null,
    markers: Array.isArray(note.markers) ? note.markers : []
  }));
}

function normalizeTasks(items) {
  return (Array.isArray(items) ? items : []).map((task) => ({
    id: task.id || crypto.randomUUID(),
    title: task.title || "Untitled task",
    description: task.description || "",
    priority: ["low", "medium", "high"].includes(task.priority) ? task.priority : "low",
    sourceSnippet: task.sourceSnippet || "",
    dueDate: task.dueDate || "",
    completed: Boolean(task.completed),
    createdAt: task.createdAt || Date.now()
  }));
}

function createNoteRecord(portfolioId) {
  return {
    id: crypto.randomUUID(),
    title: "Untitled note",
    body: "",
    updatedAt: Date.now(),
    portfolioId,
    markers: []
  };
}

export function createAppStore() {
  const data = {
    portfolios: loadArray(STORAGE_KEYS.portfolios, DEFAULT_PORTFOLIOS),
    markers: loadArray(STORAGE_KEYS.markers, []),
    notes: normalizeNotes(loadArray(STORAGE_KEYS.notes, [])),
    savedTasks: normalizeTasks(loadArray(STORAGE_KEYS.tasks, [])),
    suggestedTasks: [],
    settings: normalizeSettings(loadObject(STORAGE_KEYS.settings, {}))
  };

  const state = {
    activeSection: "notes",
    notesFilter: { type: "recent" },
    taskWindow: TASK_WINDOWS[0].id,
    calendarView: CALENDAR_VIEWS[0].id,
    selectedNoteId: data.notes[0]?.id || null
  };

  const store = {
    data,
    state,
    ensureDefaults,
    persistAll,
    getSelectedNote,
    getPortfolioName,
    getSectionLabel: () => SECTION_LABELS[state.activeSection],
    getFilteredNotes,
    getVisibleTasksForBoard,
    sortNotes,
    setActiveSection,
    setNotesFilter,
    setTaskWindow,
    setCalendarView,
    setSelectedNote,
    createNewNote,
    saveSelectedNote,
    addPortfolio,
    addMarker,
    assignMarkerToSelectedNote,
    removeMarkerFromSelectedNote,
    setSuggestedTasks,
    clearSuggestions,
    addSuggestedTasksToInbox,
    updateTaskCompleted,
    updateTaskTitle,
    updateTaskDueDate,
    clearCompletedTasks,
    updateSettings,
    resetWorkspace
  };

  ensureDefaults();
  return store;

  function ensureDefaults() {
    if (!Array.isArray(data.portfolios) || !data.portfolios.length) {
      data.portfolios = [...DEFAULT_PORTFOLIOS];
    }

    data.portfolios = data.portfolios.map((portfolio, index) => ({
      id: portfolio.id || `portfolio-${index}-${Date.now()}`,
      name: portfolio.name || `Portfolio ${index + 1}`
    }));

    const defaultPortfolioId = data.portfolios[0].id;
    data.notes = data.notes.map((note) => ({
      ...note,
      portfolioId: note.portfolioId || defaultPortfolioId,
      markers: Array.isArray(note.markers) ? note.markers : []
    }));

    if (!data.notes.length) {
      data.notes = [createNoteRecord(defaultPortfolioId)];
    }

    if (!state.selectedNoteId || !data.notes.some((note) => note.id === state.selectedNoteId)) {
      state.selectedNoteId = data.notes[0].id;
    }

    persistAll();
  }

  function persistAll() {
    localStorage.setItem(STORAGE_KEYS.portfolios, JSON.stringify(data.portfolios));
    localStorage.setItem(STORAGE_KEYS.markers, JSON.stringify(data.markers));
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(data.notes));
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(data.savedTasks));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings));
  }

  function sortNotes() {
    data.notes.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function getSelectedNote() {
    return data.notes.find((note) => note.id === state.selectedNoteId) || null;
  }

  function getPortfolioName(portfolioId) {
    return data.portfolios.find((portfolio) => portfolio.id === portfolioId)?.name || "General";
  }

  function getFilteredNotes() {
    sortNotes();

    if (state.notesFilter.type === "portfolio") {
      return data.notes.filter((note) => note.portfolioId === state.notesFilter.value);
    }

    if (state.notesFilter.type === "marker") {
      return data.notes.filter((note) => note.markers.includes(state.notesFilter.value));
    }

    return [...data.notes];
  }

  function getVisibleTasksForBoard() {
    if (state.taskWindow === "all") {
      return data.savedTasks;
    }

    return data.savedTasks.filter((task) => getTaskDueBucket(task) === state.taskWindow);
  }

  function setActiveSection(sectionName) {
    state.activeSection = sectionName;
  }

  function setNotesFilter(filter) {
    state.notesFilter = filter;
  }

  function setTaskWindow(windowName) {
    state.taskWindow = windowName;
  }

  function setCalendarView(viewName) {
    state.calendarView = viewName;
  }

  function setSelectedNote(noteId) {
    state.selectedNoteId = noteId;
  }

  function createNewNote(portfolioId = null) {
    const resolvedPortfolioId = portfolioId || data.portfolios[0].id;
    const note = createNoteRecord(resolvedPortfolioId);
    data.notes.unshift(note);
    state.selectedNoteId = note.id;
    persistAll();
    return note;
  }

  function saveSelectedNote({ title, body, portfolioId }) {
    let note = getSelectedNote();
    if (!note) {
      note = createNewNote(portfolioId);
    }

    note.title = title.trim() || "Untitled note";
    note.body = body;
    note.portfolioId = portfolioId || data.portfolios[0].id;
    note.updatedAt = Date.now();
    sortNotes();
    persistAll();
    return note;
  }

  function addPortfolio(name) {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }

    const portfolio = { id: crypto.randomUUID(), name: trimmed };
    data.portfolios.push(portfolio);
    persistAll();
    return portfolio;
  }

  function addMarker(name) {
    const trimmed = name.trim();
    if (!trimmed || data.markers.includes(trimmed)) {
      return null;
    }

    data.markers.push(trimmed);
    data.markers.sort((left, right) => left.localeCompare(right));
    persistAll();
    return trimmed;
  }

  function assignMarkerToSelectedNote(marker) {
    const note = getSelectedNote();
    if (!note || !marker) {
      return false;
    }

    if (!data.markers.includes(marker)) {
      addMarker(marker);
    }

    if (!note.markers.includes(marker)) {
      note.markers.push(marker);
      note.updatedAt = Date.now();
      persistAll();
    }

    return true;
  }

  function removeMarkerFromSelectedNote(marker) {
    const note = getSelectedNote();
    if (!note) {
      return;
    }

    note.markers = note.markers.filter((item) => item !== marker);
    note.updatedAt = Date.now();
    persistAll();
  }

  function setSuggestedTasks(tasks) {
    data.suggestedTasks = tasks;
  }

  function clearSuggestions() {
    data.suggestedTasks = [];
  }

  function addSuggestedTasksToInbox() {
    const existing = new Set(
      data.savedTasks.map((task) => `${task.title}|${task.description}`.toLowerCase())
    );
    let addedCount = 0;

    for (const task of data.suggestedTasks) {
      const key = `${task.title}|${task.description}`.toLowerCase();
      if (existing.has(key)) {
        continue;
      }

      existing.add(key);
      data.savedTasks.unshift({ ...task, id: crypto.randomUUID(), createdAt: Date.now() });
      addedCount += 1;
    }

    persistAll();
    return addedCount;
  }

  function updateTaskCompleted(taskId, completed) {
    const task = data.savedTasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    task.completed = completed;
    persistAll();
  }

  function updateTaskTitle(taskId, title) {
    const task = data.savedTasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    task.title = title.trim() || "Untitled task";
    persistAll();
  }

  function updateTaskDueDate(taskId, dueDate) {
    const task = data.savedTasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    task.dueDate = dueDate;
    persistAll();
  }

  function clearCompletedTasks() {
    data.savedTasks = data.savedTasks.filter((task) => !task.completed);
    persistAll();
  }

  function updateSettings(partialSettings) {
    data.settings = normalizeSettings({
      ...data.settings,
      ...partialSettings,
      layout: {
        ...data.settings.layout,
        ...partialSettings.layout
      }
    });
    persistAll();
  }

  function resetWorkspace() {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key);
    }

    data.portfolios = [...DEFAULT_PORTFOLIOS];
    data.markers = [];
    data.notes = [createNoteRecord(DEFAULT_PORTFOLIOS[0].id)];
    data.savedTasks = [];
    data.suggestedTasks = [];
    data.settings = normalizeSettings({});
    state.activeSection = "notes";
    state.notesFilter = { type: "recent" };
    state.taskWindow = TASK_WINDOWS[0].id;
    state.calendarView = CALENDAR_VIEWS[0].id;
    state.selectedNoteId = data.notes[0].id;
    persistAll();
  }
}
