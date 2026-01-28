import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import { spawn } from 'child_process'
import fs from 'fs'

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#09090b',
    show: false,
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  ipcMain.on('minimize-window', () => mainWindow.minimize())
  ipcMain.on('close-window', () => mainWindow.close())
  ipcMain.on('open-external', (_, url: string) => {
    shell.openExternal(url)
  })
  ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        {
          name: 'All Media Files',
          extensions: [
            'mp4',
            'mkv',
            'avi',
            'mov',
            'wmv',
            'flv',
            'webm',
            'm4v',
            'mpg',
            'mpeg',
            '3gp',
            'mp3',
            'wav',
            'flac',
            'aac',
            'm4a',
            'ogg',
            'wma',
            'opus',
          ],
        },
        {
          name: 'Video Files',
          extensions: [
            'mp4',
            'mkv',
            'avi',
            'mov',
            'wmv',
            'flv',
            'webm',
            'm4v',
            'mpg',
            'mpeg',
            '3gp',
          ],
        },
        {
          name: 'Audio Files',
          extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma', 'opus'],
        },
        { name: 'All Files', extensions: ['*'] },
      ],
      title: 'Select Media File',
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('open-multiple-files-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'All Media Files',
          extensions: [
            'mp4',
            'mkv',
            'avi',
            'mov',
            'wmv',
            'flv',
            'webm',
            'm4v',
            'mpg',
            'mpeg',
            '3gp',
            'mp3',
            'wav',
            'flac',
            'aac',
            'm4a',
            'ogg',
            'wma',
            'opus',
          ],
        },
        {
          name: 'Video Files',
          extensions: [
            'mp4',
            'mkv',
            'avi',
            'mov',
            'wmv',
            'flv',
            'webm',
            'm4v',
            'mpg',
            'mpeg',
            '3gp',
          ],
        },
        {
          name: 'Audio Files',
          extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma', 'opus'],
        },
        { name: 'All Files', extensions: ['*'] },
      ],
      title: 'Select Media Files',
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Folder',
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Open directory in file explorer
  ipcMain.handle('open-directory', async (_, dirPath: string) => {
    try {
      await shell.openPath(dirPath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Play HLS file in default browser
  ipcMain.handle('play-hls', async (_, m3u8Path: string) => {
    try {
      await shell.openPath(m3u8Path)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Convert media file to HLS
  ipcMain.handle(
    'convert-to-hls',
    async (
      _,
      options: {
        inputFile: string
        outputName: string
        outputPath: string
        splitTime: string
        quality: string
        audioOnly: boolean
        ffmpegPath: string
      }
    ) => {
      return new Promise((resolve, reject) => {
        const { inputFile, outputName, outputPath, splitTime, quality, audioOnly, ffmpegPath } =
          options

        // Create output directory with auto-increment if exists
        let outputDir = path.join(outputPath, outputName)
        let counter = 1

        // Check if directory exists and find available name
        while (fs.existsSync(outputDir)) {
          outputDir = path.join(outputPath, `${outputName}-${counter}`)
          counter++
        }

        // Create the directory
        fs.mkdirSync(outputDir, { recursive: true })

        // Determine FFMPEG executable path
        let ffmpegCommand = 'ffmpeg'
        if (ffmpegPath) {
          // User provided custom FFMPEG path
          if (process.platform === 'win32') {
            ffmpegCommand = path.join(ffmpegPath, 'ffmpeg.exe')
          } else {
            ffmpegCommand = path.join(ffmpegPath, 'ffmpeg')
          }

          // Check if file exists
          if (!fs.existsSync(ffmpegCommand)) {
            // Try without .exe extension or vice versa
            const altCommand =
              process.platform === 'win32'
                ? path.join(ffmpegPath, 'ffmpeg')
                : path.join(ffmpegPath, 'ffmpeg.exe')

            if (fs.existsSync(altCommand)) {
              ffmpegCommand = altCommand
            } else {
              // Fallback to system PATH
              ffmpegCommand = 'ffmpeg'
            }
          }
        }

        let ffmpegArgs: string[]
        const m3u8Path = path.join(outputDir, 'playlist.m3u8')
        const segmentPath = path.join(outputDir, 'segment%03d.ts')

        if (audioOnly) {
          // Audio only quality presets
          const audioQualityPresets: Record<string, string> = {
            low: '64k',
            medium: '128k',
            high: '320k',
          }

          const audioBitrate = audioQualityPresets[quality] || '128k'

          // FFMPEG command for audio only
          ffmpegArgs = [
            '-i',
            inputFile,
            '-vn', // No video
            '-c:a',
            'aac', // Audio codec
            '-b:a',
            audioBitrate,
            '-start_number',
            '0',
            '-hls_time',
            splitTime,
            '-hls_list_size',
            '0',
            '-f',
            'hls',
            '-hls_segment_filename',
            segmentPath,
            m3u8Path,
          ]
        } else {
          // Video quality presets
          const videoQualityPresets: Record<string, string> = {
            low: '500k',
            medium: '1500k',
            high: '3000k',
          }

          const videoBitrate = videoQualityPresets[quality] || '1500k'

          // FFMPEG command for video with audio
          ffmpegArgs = [
            '-i',
            inputFile,
            '-profile:v',
            'baseline',
            '-level',
            '3.0',
            '-start_number',
            '0',
            '-hls_time',
            splitTime,
            '-hls_list_size',
            '0',
            '-b:v',
            videoBitrate,
            '-f',
            'hls',
            '-hls_segment_filename',
            segmentPath,
            m3u8Path,
          ]
        }

        const ffmpeg = spawn(ffmpegCommand, ffmpegArgs)
        let errorOutput = ''

        ffmpeg.stderr.on('data', (data) => {
          const message = data.toString()
          errorOutput += message
          mainWindow.webContents.send('conversion-log', message)

          // Parse progress
          const timeMatch = message.match(/time=(\d{2}):(\d{2}):(\d{2})/)
          if (timeMatch) {
            mainWindow.webContents.send('conversion-progress', {
              file: inputFile,
              time: `${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]}`,
            })
          }
        })

        ffmpeg.on('close', (code) => {
          if (code === 0) {
            resolve({ success: true, outputDir })
          } else {
            reject({ success: false, error: errorOutput })
          }
        })

        ffmpeg.on('error', (err) => {
          reject({ success: false, error: err.message })
        })
      })
    }
  )
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
