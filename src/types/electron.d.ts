export interface ElectronAPI {
  minimizeWindow: () => void
  closeWindow: () => void
  openExternal: (url: string) => void
  openFileDialog: () => Promise<string | null>
  openMultipleFilesDialog: () => Promise<string[]>
  openFolderDialog: () => Promise<string | null>
  openDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>
  playHLS: (m3u8Path: string) => Promise<{ success: boolean; error?: string }>
  convertToHLS: (options: {
    inputFile: string
    outputName: string
    outputPath: string
    splitTime: string
    quality: string
    audioOnly: boolean
    ffmpegPath: string
  }) => Promise<{ success: boolean; outputDir?: string; error?: string }>
  onConversionLog: (callback: (message: string) => void) => void
  onConversionProgress: (callback: (data: { file: string; time: string }) => void) => void
  removeConversionListeners: () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
