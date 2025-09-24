// Preload script pour sécuriser les communications entre Electron et React
const { contextBridge } = require('electron');

// Exposer des APIs sécurisées au renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,
  // Ajouter d'autres APIs sécurisées ici si nécessaire
});
