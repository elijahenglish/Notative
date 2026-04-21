import { DEFAULT_SETTINGS } from "./constants.js";

export function normalizeSettings(candidate = {}) {
  return {
    theme: candidate.theme || DEFAULT_SETTINGS.theme,
    fontScale: candidate.fontScale || DEFAULT_SETTINGS.fontScale,
    layout: {
      showSidebar: candidate.layout?.showSidebar ?? DEFAULT_SETTINGS.layout.showSidebar,
      showDetailPanel: candidate.layout?.showDetailPanel ?? DEFAULT_SETTINGS.layout.showDetailPanel,
      panelOrder: Array.isArray(candidate.layout?.panelOrder) && candidate.layout.panelOrder.length === 4
        ? candidate.layout.panelOrder
        : [...DEFAULT_SETTINGS.layout.panelOrder]
    }
  };
}

export function applyVisualSettings(elements, settings) {
  elements.body.dataset.theme = settings.theme;
  elements.body.dataset.fontScale = settings.fontScale;

  const { shell, panels } = elements;
  shell.classList.toggle("sidebar-hidden", !settings.layout.showSidebar);
  shell.classList.toggle("detail-hidden", !settings.layout.showDetailPanel);

  for (const panelName of settings.layout.panelOrder) {
    const panel = panels[panelName];
    if (panel) {
      shell.appendChild(panel);
    }
  }
}
