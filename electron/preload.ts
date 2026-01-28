import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openMultipleFilesDialog: () => ipcRenderer.invoke('open-multiple-files-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openDirectory: (dirPath: string) => ipcRenderer.invoke('open-directory', dirPath),
  playHLS: (m3u8Path: string) => ipcRenderer.invoke('play-hls', m3u8Path),
  convertToHLS: (options: {
    inputFile: string
    outputName: string
    outputPath: string
    splitTime: string
    quality: string
    audioOnly: boolean
    ffmpegPath: string
  }) => ipcRenderer.invoke('convert-to-hls', options),
  onConversionLog: (callback: (message: string) => void) => {
    ipcRenderer.on('conversion-log', (_, message) => callback(message))
  },
  onConversionProgress: (callback: (data: { file: string; time: string }) => void) => {
    ipcRenderer.on('conversion-progress', (_, data) => callback(data))
  },
  removeConversionListeners: () => {
    ipcRenderer.removeAllListeners('conversion-log')
    ipcRenderer.removeAllListeners('conversion-progress')
  },
})
