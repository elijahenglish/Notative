import { createAppStore } from "./core/store.js";
import { getElements } from "./ui/elements.js";
import { renderAll, setStatus } from "./ui/renderers.js";
import { inferDueDateFromText } from "./utils/date.js";

const desktopApi = window.notativeAPI;
const store = createAppStore();
const elements = getElements();

function getNoteDraft() {
  return {
    title: elements.inputs.noteTitle.value,
    body: elements.inputs.noteBody.value,
    portfolioId: elements.inputs.portfolioSelect.value || store.data.portfolios[0].id
  };
}

function saveCurrentNote() {
  const note = store.saveSelectedNote(getNoteDraft());
  renderAll(store, elements);
  setStatus(elements, `Saved at ${new Date().toLocaleTimeString()}`);
  return note;
}

async function analyzeCurrentNote() {
  const current = saveCurrentNote();
  if (!current || !current.body.trim()) {
    setStatus(elements, "Add some note content first, then analyze.");
    return;
  }

  elements.buttons.analyze.disabled = true;
  setStatus(elements, "Analyzing note for tasks...");

  try {
    if (!desktopApi?.extractTasks) {
      throw new Error("Desktop API unavailable.");
    }

    const payload = `${current.title}\n${current.body}`;
    const data = await desktopApi.extractTasks(payload);

    if (data.error) {
      throw new Error(data.details ? `${data.error} ${data.details}` : data.error);
    }

    const tasks = Array.isArray(data.tasks)
      ? data.tasks.map((task) => ({
          title: task.title,
          description: task.description,
          priority: task.priority || "low",
          sourceSnippet: task.sourceSnippet || "",
          dueDate: inferDueDateFromText(task.description || task.sourceSnippet || task.title),
          completed: false
        }))
      : [];

    store.setSuggestedTasks(tasks);
    renderAll(store, elements);

    const sourceLabel = data.source === "openai" ? "AI model" : "heuristic fallback";
    setStatus(
      elements,
      data.warning ? `${sourceLabel}: ${data.warning}` : `${sourceLabel}: found ${tasks.length} task(s).`
    );
  } catch (error) {
    setStatus(elements, error.message || "Analysis failed.");
  } finally {
    elements.buttons.analyze.disabled = false;
  }
}

function createNewNote() {
  const portfolioId = store.state.notesFilter.type === "portfolio"
    ? store.state.notesFilter.value
    : store.data.portfolios[0].id;

  store.createNewNote(portfolioId);
  store.setActiveSection("notes");
  renderAll(store, elements);
  setStatus(elements, `Editing: ${store.getSelectedNote()?.title || "Untitled note"}`);
}

function connectEvents() {
  if (desktopApi?.minimizeWindow && desktopApi?.toggleWindowMaximize && desktopApi?.closeWindow) {
    elements.buttons.windowMinimize?.addEventListener("click", () => desktopApi.minimizeWindow());
    elements.buttons.windowMaximize?.addEventListener("click", () => desktopApi.toggleWindowMaximize());
    elements.buttons.windowClose?.addEventListener("click", () => desktopApi.closeWindow());
  }

  const syncDetailToggleState = () => {
    const isExpanded = !elements.shell.classList.contains("detail-hidden");
    const toggleButton = elements.buttons.toggleDetailPanel;
    if (!toggleButton) {
      return;
    }

    const icon = toggleButton.querySelector(".panel-toggle-icon");
    if (icon) {
      icon.textContent = isExpanded ? ">" : "<";
    }

    toggleButton.setAttribute("aria-expanded", String(isExpanded));
    toggleButton.setAttribute("aria-label", isExpanded ? "Hide right panel" : "Show right panel");
    toggleButton.title = isExpanded ? "Hide right panel" : "Show right panel";
  };

  elements.buttons.toggleDetailPanel?.addEventListener("click", () => {
    elements.shell.classList.toggle("detail-hidden");
    syncDetailToggleState();
  });

  syncDetailToggleState();

  for (const button of elements.railButtons) {
    button.addEventListener("click", () => {
      store.setActiveSection(button.dataset.section);
      renderAll(store, elements);
    });
  }

  elements.buttons.showRecentNotes.addEventListener("click", () => {
    store.setActiveSection("notes");
    store.setNotesFilter({ type: "recent" });
    renderAll(store, elements);
  });

  elements.buttons.showDueWindows.addEventListener("click", () => {
    store.setActiveSection("todos");
    store.setTaskWindow("all");
    renderAll(store, elements);
  });

  elements.buttons.newNote.addEventListener("click", createNewNote);
  elements.buttons.saveNote.addEventListener("click", saveCurrentNote);
  elements.buttons.analyze.addEventListener("click", analyzeCurrentNote);
  elements.buttons.addAllTasks.addEventListener("click", () => {
    const addedCount = store.addSuggestedTasksToInbox();
    renderAll(store, elements);
    setStatus(elements, `Added ${addedCount} task(s) to your inbox.`);
  });

  elements.buttons.addPortfolio.addEventListener("click", () => {
    const name = window.prompt("New portfolio name:");
    if (!name || !name.trim()) {
      return;
    }

    store.addPortfolio(name);
    renderAll(store, elements);
  });

  elements.buttons.addMarker.addEventListener("click", () => {
    const name = window.prompt("New marker name:");
    if (!name || !name.trim()) {
      return;
    }

    store.addMarker(name);
    renderAll(store, elements);
  });

  elements.buttons.addMarkerToNote.addEventListener("click", () => {
    const marker = elements.inputs.markerInput.value.trim();
    if (!marker) {
      return;
    }

    store.assignMarkerToSelectedNote(marker);
    elements.inputs.markerInput.value = "";
    renderAll(store, elements);
  });

  elements.inputs.portfolioSelect.addEventListener("change", saveCurrentNote);

  elements.buttons.clearSuggestions.addEventListener("click", () => {
    store.clearSuggestions();
    renderAll(store, elements);
  });

  elements.buttons.clearCompletedTasks.addEventListener("click", () => {
    store.clearCompletedTasks();
    renderAll(store, elements);
  });

  elements.buttons.resetWorkspace.addEventListener("click", () => {
    const confirmed = window.confirm("Reset all local notes, tasks, portfolios, markers, and settings?");
    if (!confirmed) {
      return;
    }

    store.resetWorkspace();
    renderAll(store, elements);
    setStatus(elements, "Workspace reset.");
  });
}

connectEvents();
renderAll(store, elements);
setStatus(elements, `Editing: ${store.getSelectedNote()?.title || "Untitled note"}`);
