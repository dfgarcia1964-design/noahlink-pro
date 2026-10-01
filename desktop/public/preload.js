/**
 * Preload Script - Seguridad Electron
 * Expone APIs seguras al contexto de renderizado
 */

const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura
contextBridge.exposeInMainWorld('api', {
  call: (method, endpoint, data) => {
    return ipcRenderer.invoke('api:call', method, endpoint, data);
  },

  // Métodos específicos para brevedad
  get: (endpoint) => ipcRenderer.invoke('api:call', 'GET', endpoint),
  post: (endpoint, data) => ipcRenderer.invoke('api:call', 'POST', endpoint, data),

  // Version info
  getVersion: () => ipcRenderer.invoke('app:version')
});
