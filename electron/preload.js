// Preload script to secure communications between Electron and React
const { contextBridge } = require('electron');

// Expose secure APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,
  // Add other secure APIs here if needed
});
