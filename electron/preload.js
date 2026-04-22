const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("notativeAPI", {
  extractTasks: async (text) => ipcRenderer.invoke("notative:extractTasks", text),
  minimizeWindow: () => ipcRenderer.send("notative:windowMinimize"),
  toggleWindowMaximize: () => ipcRenderer.send("notative:windowToggleMaximize"),
  closeWindow: () => ipcRenderer.send("notative:windowClose")
});
