import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import { spawn } from 'child_process'
import fs from 'fs'
import ffmpegStatic from 'ffmpeg-static'

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
        // Priority: 1. User custom path, 2. Bundled ffmpeg-static, 3. System PATH
        const isWin = process.platform === 'win32'
        const normalizeCustomFfmpegPath = (customPath: string) => {
          const trimmed = customPath.trim()
          if (!trimmed) return ''

          const baseName = path.basename(trimmed).toLowerCase()
          const isFilePath = baseName === 'ffmpeg' || baseName === 'ffmpeg.exe'
          const primaryCandidate = isFilePath
            ? trimmed
            : path.join(trimmed, isWin ? 'ffmpeg.exe' : 'ffmpeg')

          if (fs.existsSync(primaryCandidate)) {
            return primaryCandidate
          }

          if (!isFilePath) {
            const altCandidate = path.join(trimmed, isWin ? 'ffmpeg' : 'ffmpeg.exe')
            if (fs.existsSync(altCandidate)) {
              return altCandidate
            }
          }

          return ''
        }

        const resolveBundledFfmpeg = (candidate: string) => {
          if (!candidate) return ''

          const exists = (value: string) => (value && fs.existsSync(value) ? value : '')
          const unpacked = candidate.includes('app.asar')
            ? candidate.replace('app.asar', 'app.asar.unpacked')
            : ''
          const subPath = candidate.split(`${path.sep}app.asar${path.sep}`)[1] || ''
          const resourcesUnpacked =
            subPath && process.resourcesPath
              ? path.join(process.resourcesPath, 'app.asar.unpacked', subPath)
              : ''

          return exists(unpacked) || exists(resourcesUnpacked) || exists(candidate)
        }

        const customCommand = ffmpegPath ? normalizeCustomFfmpegPath(ffmpegPath) : ''
        const bundledCommand = resolveBundledFfmpeg(ffmpegStatic || '')
        const ffmpegCommand = customCommand || bundledCommand || 'ffmpeg'
        console.log('[ffmpeg] resolved path:', {
          ffmpegStatic,
          bundledCommand,
          customCommand,
          ffmpegCommand,
        })

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

        ffmpeg.on('close', (code, signal) => {
          if (code === 0) {
            resolve({ success: true, outputDir })
            return
          }

          const message = errorOutput || `FFMPEG exited with code ${code ?? 'unknown'}`
          console.error('[ffmpeg] process closed with error', {
            code,
            signal,
            ffmpegCommand,
            ffmpegArgs,
            message,
          })
          mainWindow.webContents.send('conversion-log', `\n[ffmpeg] ${message}\n`)
          reject({ success: false, error: message })
        })

        ffmpeg.on('error', (err) => {
          console.error('[ffmpeg] spawn error', {
            ffmpegCommand,
            ffmpegArgs,
            message: err.message,
          })
          mainWindow.webContents.send('conversion-log', `\n[ffmpeg] spawn error: ${err.message}\n`)
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
