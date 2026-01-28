import { createContext, useContext, useState, ReactNode } from 'react'

interface ConversionContextType {
  // Conversion settings
  files: string[]
  outputName: string
  outputPath: string
  outputMode: 'default' | 'sameAsInput' | 'custom'
  splitTime: string
  quality: string
  audioOnly: boolean
  ffmpegPath: string
  defaultOutputFromSettings: string
  isBulk: boolean

  // Conversion state
  isConverting: boolean
  progress: number
  logs: string[]
  error: string | null
  success: boolean
  outputDir?: string
  currentFile?: string
  completedFiles?: number
  totalFiles?: number

  // Actions
  startConversion: (config: ConversionConfig) => void
  updateProgress: (progress: number) => void
  addLog: (log: string) => void
  setConversionError: (error: string | null) => void
  setConversionSuccess: (success: boolean, outputDir?: string) => void
  resetConversion: () => void
  setCurrentFile: (file: string) => void
  setCompletedFiles: (count: number) => void
}

interface ConversionConfig {
  files: string[]
  outputName: string
  outputPath: string
  outputMode: 'default' | 'sameAsInput' | 'custom'
  splitTime: string
  quality: string
  audioOnly: boolean
  ffmpegPath: string
  defaultOutputFromSettings: string
  isBulk: boolean
}

const ConversionContext = createContext<ConversionContextType | undefined>(undefined)

export function ConversionProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<string[]>([])
  const [outputName, setOutputName] = useState('')
  const [outputPath, setOutputPath] = useState('')
  const [outputMode, setOutputMode] = useState<'default' | 'sameAsInput' | 'custom'>('default')
  const [splitTime, setSplitTime] = useState('10')
  const [quality, setQuality] = useState('medium')
  const [audioOnly, setAudioOnly] = useState(false)
  const [ffmpegPath, setFfmpegPath] = useState('')
  const [defaultOutputFromSettings, setDefaultOutputFromSettings] = useState('')
  const [isBulk, setIsBulk] = useState(false)

  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [outputDir, setOutputDir] = useState<string | undefined>(undefined)
  const [currentFile, setCurrentFileState] = useState<string | undefined>(undefined)
  const [completedFiles, setCompletedFilesState] = useState<number | undefined>(undefined)

  const startConversion = (config: ConversionConfig) => {
    setFiles(config.files)
    setOutputName(config.outputName)
    setOutputPath(config.outputPath)
    setOutputMode(config.outputMode)
    setSplitTime(config.splitTime)
    setQuality(config.quality)
    setAudioOnly(config.audioOnly)
    setFfmpegPath(config.ffmpegPath)
    setDefaultOutputFromSettings(config.defaultOutputFromSettings)
    setIsBulk(config.isBulk)

    setIsConverting(true)
    setProgress(0)
    setLogs([])
    setError(null)
    setSuccess(false)
    setOutputDir(undefined)
    setCurrentFileState(undefined)
    setCompletedFilesState(undefined)
  }

  const updateProgress = (newProgress: number) => {
    setProgress(newProgress)
  }

  const addLog = (log: string) => {
    setLogs((prev) => [...prev, log])
  }

  const setConversionError = (newError: string | null) => {
    setError(newError)
    setIsConverting(false)
  }

  const setConversionSuccess = (newSuccess: boolean, newOutputDir?: string) => {
    setSuccess(newSuccess)
    setIsConverting(false)
    if (newOutputDir) {
      setOutputDir(newOutputDir)
    }
  }

  const resetConversion = () => {
    setFiles([])
    setOutputName('')
    setIsConverting(false)
    setProgress(0)
    setLogs([])
    setError(null)
    setSuccess(false)
    setOutputDir(undefined)
    setCurrentFileState(undefined)
    setCompletedFilesState(undefined)
  }

  const setCurrentFile = (file: string) => {
    setCurrentFileState(file)
  }

  const setCompletedFiles = (count: number) => {
    setCompletedFilesState(count)
  }

  const value = {
    files,
    outputName,
    outputPath,
    outputMode,
    splitTime,
    quality,
    audioOnly,
    ffmpegPath,
    defaultOutputFromSettings,
    isBulk,
    isConverting,
    progress,
    logs,
    error,
    success,
    outputDir,
    currentFile,
    completedFiles,
    totalFiles: files.length,
    startConversion,
    updateProgress,
    addLog,
    setConversionError,
    setConversionSuccess,
    resetConversion,
    setCurrentFile,
    setCompletedFiles,
  }

  return <ConversionContext.Provider value={value}>{children}</ConversionContext.Provider>
}

export function useConversion() {
  const context = useContext(ConversionContext)
  if (context === undefined) {
    throw new Error('useConversion must be used within a ConversionProvider')
  }
  return context
}
