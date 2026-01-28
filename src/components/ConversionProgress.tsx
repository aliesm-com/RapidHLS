import { useEffect, useRef } from 'react'
import { Terminal, Loader2, CheckCircle2, XCircle, FolderOpen, Play } from 'lucide-react'
import { Button } from './ui/button'

interface ConversionProgressProps {
  isConverting: boolean
  progress: number
  logs: string[]
  error: string | null
  success: boolean
  outputDir?: string
  isBulk?: boolean
}

export function ConversionProgress({
  isConverting,
  progress,
  logs,
  error,
  success,
  outputDir,
  isBulk = false,
}: ConversionProgressProps) {
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleOpenDirectory = async () => {
    if (outputDir && window.electronAPI) {
      await window.electronAPI.openDirectory(outputDir)
    }
  }

  const handlePlayHLS = async () => {
    if (outputDir && window.electronAPI) {
      const m3u8Path = `${outputDir}/playlist.m3u8`
      await window.electronAPI.playHLS(m3u8Path)
    }
  }

  if (!isConverting && !success && !error) {
    return null
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Status Header */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
        {isConverting && (
          <>
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-sm font-medium text-slate-200">Converting...</span>
          </>
        )}
        {success && (
          <>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              Conversion Completed Successfully!
            </span>
          </>
        )}
        {error && (
          <>
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-400">Conversion Failed</span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {success && outputDir && (
        <div className="flex gap-3">
          <Button
            onClick={handleOpenDirectory}
            className="flex-1 h-11 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-200 text-slate-200"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Open Output Directory
          </Button>
          {!isBulk && (
            <Button
              onClick={handlePlayHLS}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-0 shadow-lg shadow-green-500/25 transition-all duration-200 text-white font-semibold"
            >
              <Play className="w-4 h-4 mr-2" />
              Play HLS
            </Button>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {isConverting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Progress</span>
            <span className="text-slate-300 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Logs Terminal */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Conversion Logs</span>
        </div>
        <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic">Waiting for conversion to start...</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-slate-300 whitespace-pre-wrap break-all">
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-400 font-medium mb-2">Error Details:</p>
          <p className="text-sm text-red-300 font-mono whitespace-pre-wrap">{error}</p>
        </div>
      )}
    </div>
  )
}
