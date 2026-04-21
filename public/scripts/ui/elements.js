export function getElements() {
  const railButtons = Array.from(document.querySelectorAll(".rail-button[data-section]"));

  return {
    body: document.body,
    shell: document.querySelector(".desktop-shell"),
    panels: {
      rail: document.querySelector(".icon-rail"),
      sidebar: document.querySelector(".sidebar"),
      main: document.querySelector(".main-workspace"),
      detail: document.querySelector(".detail-panel")
    },
    railButtons,
    sectionHeading: document.getElementById("sectionHeading"),
    sidebarViews: {
      notes: document.getElementById("notesSidebar"),
      todos: document.getElementById("tasksSidebar"),
      calendar: document.getElementById("calendarSidebar"),
      notifications: document.getElementById("notificationsSidebar"),
      settings: document.getElementById("settingsSidebar")
    },
    workspaceViews: {
      notes: document.getElementById("notesWorkspace"),
      todos: document.getElementById("todosWorkspace"),
      calendar: document.getElementById("calendarWorkspace"),
      notifications: document.getElementById("notificationsWorkspace"),
      settings: document.getElementById("settingsWorkspace")
    },
    detailViews: {
      notes: document.getElementById("notesDetail"),
      todos: document.getElementById("todosDetail"),
      calendar: document.getElementById("calendarDetail"),
      notifications: document.getElementById("notificationsDetail"),
      settings: document.getElementById("settingsDetail")
    },
    buttons: {
      newNote: document.getElementById("newNoteButton"),
      showRecentNotes: document.getElementById("showRecentNotesButton"),
      showDueWindows: document.getElementById("showDueWindowsButton"),
      addPortfolio: document.getElementById("addPortfolioButton"),
      addMarker: document.getElementById("addMarkerButton"),
      addMarkerToNote: document.getElementById("addMarkerToNoteButton"),
      saveNote: document.getElementById("saveNoteButton"),
      analyze: document.getElementById("analyzeButton"),
      addAllTasks: document.getElementById("addAllTasksButton"),
      clearSuggestions: document.getElementById("clearSuggestionsButton"),
      clearCompletedTasks: document.getElementById("clearCompletedTasksButton"),
      resetWorkspace: document.getElementById("resetWorkspaceButton")
    },
    lists: {
      notes: document.getElementById("notesList"),
      portfolios: document.getElementById("portfolioList"),
      markers: document.getElementById("markerList"),
      taskWindows: document.getElementById("taskWindowList"),
      calendarViews: document.getElementById("calendarViewList"),
      suggestedTasks: document.getElementById("suggestedTasksList"),
      savedTasks: document.getElementById("savedTasksList")
    },
    inputs: {
      noteTitle: document.getElementById("noteTitle"),
      noteBody: document.getElementById("noteBody"),
      portfolioSelect: document.getElementById("portfolioSelect"),
      markerInput: document.getElementById("markerInput")
    },
    labels: {
      notesCounter: document.getElementById("notesCounter"),
      taskInboxCount: document.getElementById("taskInboxCount"),
      statusText: document.getElementById("statusText")
    },
    markersAssigned: document.getElementById("assignedMarkers"),
    boards: {
      taskBoard: document.getElementById("taskBoard"),
      calendarBoard: document.getElementById("calendarBoard"),
      notificationsBoard: document.getElementById("notificationsBoard"),
      taskSnapshot: document.getElementById("taskSnapshot"),
      calendarSummary: document.getElementById("calendarSummary"),
      notificationsSummary: document.getElementById("notificationsSummary"),
      settingsSummary: document.getElementById("settingsSummary")
    }
  };
}
