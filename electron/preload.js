const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("notativeAPI", {
  extractTasks: async (text) => ipcRenderer.invoke("notative:extractTasks", text)
});
