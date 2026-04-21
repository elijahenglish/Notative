import {
  CALENDAR_BUCKETS,
  CALENDAR_VIEWS,
  SECTION_LABELS,
  TASK_WINDOWS
} from "../core/constants.js";
import { applyVisualSettings } from "../core/settings.js";
import { escapeHtml, toggleView } from "../utils/dom.js";
import { formatDateTime, getTaskDueBucket } from "../utils/date.js";

export function renderAll(store, elements) {
  applyVisualSettings(elements, store.data.settings);
  renderViewVisibility(store, elements);
  renderSidebar(store, elements);
  renderEditor(store, elements);
  renderNotesList(store, elements);
  renderSuggestedTasks(store, elements);
  renderInboxTasks(store, elements);
  renderTaskBoard(store, elements);
  renderTaskSnapshot(store, elements);
  renderCalendarBoard(store, elements);
  renderCalendarSummary(store, elements);
  renderNotifications(store, elements);
  renderSettingsSummary(store, elements);
}

export function setStatus(elements, message) {
  elements.labels.statusText.textContent = message;
}

function renderViewVisibility(store, elements) {
  const activeSection = store.state.activeSection;

  for (const [sectionName, element] of Object.entries(elements.sidebarViews)) {
    element.classList.toggle("hidden", sectionName !== activeSection);
  }

  for (const [sectionName, element] of Object.entries(elements.workspaceViews)) {
    toggleView(element, sectionName === activeSection);
  }

  for (const [sectionName, element] of Object.entries(elements.detailViews)) {
    toggleView(element, sectionName === activeSection);
  }

  for (const button of elements.railButtons) {
    button.classList.toggle("active", button.dataset.section === activeSection);
  }
}

function renderSidebar(store, elements) {
  elements.sectionHeading.textContent = SECTION_LABELS[store.state.activeSection];
  elements.buttons.newNote.classList.toggle("hidden", store.state.activeSection !== "notes");
  elements.buttons.showRecentNotes.classList.toggle(
    "active",
    store.state.activeSection === "notes" && store.state.notesFilter.type === "recent"
  );
  elements.buttons.showDueWindows.classList.toggle("active", store.state.activeSection === "todos");

  renderFilterList(
    elements.lists.portfolios,
    store.data.portfolios.map((portfolio) => ({
      id: portfolio.id,
      label: `${portfolio.name} (${store.data.notes.filter((note) => note.portfolioId === portfolio.id).length})`
    })),
    (item) => store.state.notesFilter.type === "portfolio" && store.state.notesFilter.value === item.id,
    (item) => {
      store.setActiveSection("notes");
      store.setNotesFilter({ type: "portfolio", value: item.id });
      renderAll(store, elements);
    }
  );

  renderFilterList(
    elements.lists.markers,
    store.data.markers.map((marker) => ({
      id: marker,
      label: `${marker} (${store.data.notes.filter((note) => note.markers.includes(marker)).length})`
    })),
    (item) => store.state.notesFilter.type === "marker" && store.state.notesFilter.value === item.id,
    (item) => {
      store.setActiveSection("notes");
      store.setNotesFilter({ type: "marker", value: item.id });
      renderAll(store, elements);
    }
  );

  renderFilterList(
    elements.lists.taskWindows,
    TASK_WINDOWS,
    (item) => store.state.taskWindow === item.id,
    (item) => {
      store.setTaskWindow(item.id);
      renderAll(store, elements);
    }
  );

  renderFilterList(
    elements.lists.calendarViews,
    CALENDAR_VIEWS,
    (item) => store.state.calendarView === item.id,
    (item) => {
      store.setCalendarView(item.id);
      renderAll(store, elements);
    }
  );
}

function renderFilterList(targetEl, items, isActive, onClick) {
  targetEl.innerHTML = "";

  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.textContent = item.label;
    if (isActive(item)) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => onClick(item));

    const li = document.createElement("li");
    li.appendChild(button);
    targetEl.appendChild(li);
  }
}

function renderEditor(store, elements) {
  const note = store.getSelectedNote();
  elements.inputs.noteTitle.value = note?.title || "";
  elements.inputs.noteBody.value = note?.body || "";
  renderPortfolioSelect(store, elements, note);
  renderAssignedMarkers(store, elements, note);
}

function renderPortfolioSelect(store, elements, note) {
  elements.inputs.portfolioSelect.innerHTML = "";
  for (const portfolio of store.data.portfolios) {
    const option = document.createElement("option");
    option.value = portfolio.id;
    option.textContent = portfolio.name;
    elements.inputs.portfolioSelect.appendChild(option);
  }

  elements.inputs.portfolioSelect.value = note?.portfolioId || store.data.portfolios[0].id;
}

function renderAssignedMarkers(store, elements, note) {
  elements.markersAssigned.innerHTML = "";
  const assigned = note?.markers || [];

  if (!assigned.length) {
    const empty = document.createElement("span");
    empty.className = "task-desc";
    empty.textContent = "No markers on this note yet.";
    elements.markersAssigned.appendChild(empty);
    return;
  }

  for (const marker of assigned) {
    const chip = document.createElement("span");
    chip.className = "marker-chip";
    chip.textContent = marker;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "x";
    removeButton.addEventListener("click", () => {
      store.removeMarkerFromSelectedNote(marker);
      renderAll(store, elements);
    });

    chip.appendChild(removeButton);
    elements.markersAssigned.appendChild(chip);
  }
}

function renderNotesList(store, elements) {
  const filteredNotes = store.getFilteredNotes();
  elements.lists.notes.innerHTML = "";
  elements.labels.notesCounter.textContent = String(filteredNotes.length);

  for (const note of filteredNotes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "note-item";
    button.classList.toggle("active", note.id === store.state.selectedNoteId);
    button.innerHTML = `
      <span class="note-item-title">${escapeHtml(note.title || "Untitled note")}</span>
      <span class="note-item-meta">${escapeHtml(store.getPortfolioName(note.portfolioId))} · ${escapeHtml(formatDateTime(note.updatedAt))}</span>
    `;
    button.addEventListener("click", () => {
      store.setSelectedNote(note.id);
      renderAll(store, elements);
      setStatus(elements, `Editing: ${store.getSelectedNote()?.title || "Untitled note"}`);
    });

    const li = document.createElement("li");
    li.appendChild(button);
    elements.lists.notes.appendChild(li);
  }

  if (!filteredNotes.length) {
    const empty = document.createElement("li");
    empty.className = "task-item";
    empty.innerHTML = '<p class="task-desc">No notes match this view yet.</p>';
    elements.lists.notes.appendChild(empty);
  }
}

function renderSuggestedTasks(store, elements) {
  renderSimpleTaskList(elements.lists.suggestedTasks, store.data.suggestedTasks, "No suggested tasks yet.");
}

function renderInboxTasks(store, elements) {
  elements.labels.taskInboxCount.textContent = String(store.data.savedTasks.length);
  renderSimpleTaskList(elements.lists.savedTasks, store.data.savedTasks.slice(0, 8), "No saved tasks yet.");
}

function renderSimpleTaskList(targetEl, tasks, emptyMessage) {
  targetEl.innerHTML = "";
  if (!tasks.length) {
    const empty = document.createElement("li");
    empty.className = "task-item";
    empty.innerHTML = `<p class="task-desc">${escapeHtml(emptyMessage)}</p>`;
    targetEl.appendChild(empty);
    return;
  }

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `
      <div>
        <p class="task-title">${escapeHtml(task.title)}</p>
        <p class="task-desc">${escapeHtml(task.description || task.sourceSnippet || "No extra details")}</p>
      </div>
      <span class="priority-pill ${escapeHtml(task.priority || "low")}">${escapeHtml(task.priority || "low")}</span>
    `;
    targetEl.appendChild(li);
  }
}

function renderTaskBoard(store, elements) {
  elements.boards.taskBoard.innerHTML = "";
  const tasks = store.getVisibleTasksForBoard();

  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "task-card";
    empty.innerHTML = '<p class="task-desc">No tasks match this window yet.</p>';
    elements.boards.taskBoard.appendChild(empty);
    return;
  }

  for (const task of tasks) {
    const card = document.createElement("article");
    card.className = "task-card";
    if (task.completed) {
      card.classList.add("task-completed");
    }

    const mainRow = document.createElement("div");
    mainRow.className = "task-main-row";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "task-check";
    check.checked = task.completed;
    check.addEventListener("change", () => {
      store.updateTaskCompleted(task.id, check.checked);
      renderAll(store, elements);
    });

    const content = document.createElement("div");
    content.className = "task-card-content";

    const titleInput = document.createElement("input");
    titleInput.className = "task-title-input";
    titleInput.value = task.title;
    titleInput.addEventListener("change", () => {
      store.updateTaskTitle(task.id, titleInput.value);
      renderAll(store, elements);
    });

    const desc = document.createElement("p");
    desc.className = "task-desc";
    desc.textContent = task.description || task.sourceSnippet || "No task description.";

    content.appendChild(titleInput);
    content.appendChild(desc);
    mainRow.appendChild(check);
    mainRow.appendChild(content);

    const footer = document.createElement("div");
    footer.className = "task-footer-row";

    const dueInput = document.createElement("input");
    dueInput.type = "date";
    dueInput.className = "task-date-input";
    dueInput.value = task.dueDate || "";
    dueInput.addEventListener("change", () => {
      store.updateTaskDueDate(task.id, dueInput.value);
      renderAll(store, elements);
    });

    const bucket = document.createElement("span");
    bucket.className = `priority-pill ${task.priority}`;
    bucket.textContent = task.priority;

    const dueMeta = document.createElement("span");
    dueMeta.className = "task-mini-meta";
    dueMeta.textContent = `Window: ${getTaskDueBucket(task)}`;

    footer.appendChild(dueInput);
    footer.appendChild(bucket);
    footer.appendChild(dueMeta);

    card.appendChild(mainRow);
    card.appendChild(footer);
    elements.boards.taskBoard.appendChild(card);
  }
}

function renderTaskSnapshot(store, elements) {
  elements.boards.taskSnapshot.innerHTML = "";
  const summaries = [
    ["Overdue", store.data.savedTasks.filter((task) => getTaskDueBucket(task) === "overdue").length],
    ["Due Today", store.data.savedTasks.filter((task) => getTaskDueBucket(task) === "today").length],
    ["Due Tomorrow", store.data.savedTasks.filter((task) => getTaskDueBucket(task) === "tomorrow").length],
    ["Next 7 Days", store.data.savedTasks.filter((task) => getTaskDueBucket(task) === "next7").length]
  ];

  for (const [label, count] of summaries) {
    const card = document.createElement("article");
    card.className = "summary-card";
    card.innerHTML = `<h3>${escapeHtml(label)}</h3><p>${count} task(s)</p>`;
    elements.boards.taskSnapshot.appendChild(card);
  }
}

function renderCalendarBoard(store, elements) {
  elements.boards.calendarBoard.innerHTML = "";
  let tasks = [...store.data.savedTasks];
  if (store.state.calendarView === "scheduled") {
    tasks = tasks.filter((task) => task.dueDate && !task.completed);
  } else if (store.state.calendarView === "completed") {
    tasks = tasks.filter((task) => task.completed);
  } else {
    tasks = tasks.filter((task) => !task.completed);
  }

  for (const [id, label] of CALENDAR_BUCKETS) {
    const items = tasks.filter((task) => getTaskDueBucket(task) === id);
    if (!items.length && store.state.calendarView !== "upcoming") {
      continue;
    }

    const card = document.createElement("article");
    card.className = "calendar-card";
    const title = document.createElement("strong");
    title.textContent = `${label} (${items.length})`;
    card.appendChild(title);

    if (!items.length) {
      const copy = document.createElement("p");
      copy.className = "calendar-copy";
      copy.textContent = "Nothing here right now.";
      card.appendChild(copy);
    } else {
      for (const task of items.slice(0, 5)) {
        const line = document.createElement("p");
        line.className = "calendar-copy";
        line.textContent = `${task.title}${task.dueDate ? ` · ${task.dueDate}` : ""}`;
        card.appendChild(line);
      }
    }

    elements.boards.calendarBoard.appendChild(card);
  }
}

function renderCalendarSummary(store, elements) {
  elements.boards.calendarSummary.innerHTML = elements.boards.taskSnapshot.innerHTML;
}

function renderNotifications(store, elements) {
  const notices = [];
  const overdueCount = store.data.savedTasks.filter((task) => getTaskDueBucket(task) === "overdue").length;
  const todayCount = store.data.savedTasks.filter((task) => getTaskDueBucket(task) === "today").length;
  const recentNote = [...store.data.notes].sort((a, b) => b.updatedAt - a.updatedAt)[0];

  if (overdueCount) {
    notices.push({ title: "Overdue tasks", copy: `${overdueCount} task(s) need attention.` });
  }
  if (todayCount) {
    notices.push({ title: "Due today", copy: `${todayCount} task(s) are due today.` });
  }
  if (recentNote) {
    notices.push({ title: "Latest edit", copy: `${recentNote.title} was updated ${formatDateTime(recentNote.updatedAt)}.` });
  }

  renderNoticeCards(elements.boards.notificationsBoard, notices, "No notifications right now.");
  renderNoticeCards(elements.boards.notificationsSummary, notices.slice(0, 4), "No recent activity yet.");
}

function renderNoticeCards(targetEl, notices, emptyMessage) {
  targetEl.innerHTML = "";
  if (!notices.length) {
    const card = document.createElement("article");
    card.className = "notice-card";
    card.innerHTML = `<h3>All quiet</h3><p class="notice-copy">${escapeHtml(emptyMessage)}</p>`;
    targetEl.appendChild(card);
    return;
  }

  for (const notice of notices) {
    const card = document.createElement("article");
    card.className = "notice-card";
    card.innerHTML = `<h3>${escapeHtml(notice.title)}</h3><p class="notice-copy">${escapeHtml(notice.copy)}</p>`;
    targetEl.appendChild(card);
  }
}

function renderSettingsSummary(store, elements) {
  const cards = [
    { title: "Notes", copy: `${store.data.notes.length} local note(s)` },
    { title: "Tasks", copy: `${store.data.savedTasks.length} task(s) in your board` },
    { title: "Markers", copy: `${store.data.markers.length} custom marker(s)` },
    { title: "Portfolios", copy: `${store.data.portfolios.length} portfolio group(s)` },
    { title: "Theme", copy: `${store.data.settings.theme} theme · ${store.data.settings.fontScale} type scale` }
  ];

  elements.boards.settingsSummary.innerHTML = "";
  for (const item of cards) {
    const card = document.createElement("article");
    card.className = "notice-card";
    card.innerHTML = `<h3>${escapeHtml(item.title)}</h3><p class="notice-copy">${escapeHtml(item.copy)}</p>`;
    elements.boards.settingsSummary.appendChild(card);
  }
}
