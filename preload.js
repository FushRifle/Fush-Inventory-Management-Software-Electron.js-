const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  getProducts: () => ipcRenderer.invoke('get-products')
});
