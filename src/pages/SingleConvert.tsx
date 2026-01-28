import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConversion } from '@/contexts/ConversionContext'
import { Button } from '@/components/ui/button'
import {
  FileVideo,
  ArrowLeft,
  Upload,
  Folder,
  ChevronDown,
  ChevronUp,
  Settings,
  Play,
} from 'lucide-react'

export function SingleConvert() {
  const navigate = useNavigate()
  const conversion = useConversion()
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [outputName, setOutputName] = useState('')
  const [outputPath, setOutputPath] = useState('')
  const [outputMode, setOutputMode] = useState<'default' | 'sameAsInput' | 'custom'>('default')
  const [splitTime, setSplitTime] = useState('10')
  const [quality, setQuality] = useState('medium')
  const [audioOnly, setAudioOnly] = useState(false)
  const [defaultOutputFromSettings, setDefaultOutputFromSettings] = useState('')
  const [ffmpegPath, setFfmpegPath] = useState('')

  // Setup event listeners
  useEffect(() => {
    // Load settings from localStorage
    const settings = localStorage.getItem('rapidhls-settings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        if (parsed.defaultOutputPath) setDefaultOutputFromSettings(parsed.defaultOutputPath)
        if (parsed.ffmpegPath) setFfmpegPath(parsed.ffmpegPath)
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }, [])

  const handleSelectFile = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.openFileDialog()
      if (path) {
        setSelectedFile(path)
        // Auto-generate output name from input file
        const fileName =
          path
            .split(/[\\\/]/)
            .pop()
            ?.replace(/\.[^.]+$/, '') || ''
        setOutputName(fileName)
      }
    }
  }

  const handleSelectOutput = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.openFolderDialog()
      if (path) {
        setOutputPath(path)
      }
    }
  }

  const handleConvert = () => {
    if (!selectedFile) return

    // Start conversion and navigate to conversion page
    conversion.startConversion({
      files: [selectedFile],
      outputName: outputName || 'output',
      outputPath,
      outputMode,
      splitTime,
      quality,
      audioOnly,
      ffmpegPath,
      defaultOutputFromSettings,
      isBulk: false,
    })

    navigate('/conversion')
  }

  return (
    <div className="min-h-full flex items-center justify-center p-8 py-12">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
            <FileVideo className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Single File Conversion</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Single Convert
          </h1>
          <p className="text-lg text-slate-400">Convert individual video files to HLS format</p>
        </div>

        {/* Main Card */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-500/5 to-transparent" />
          <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 space-y-6">
            {/* File Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                Select Video File
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={selectedFile}
                  readOnly
                  placeholder="No file selected"
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500"
                />
                <button
                  onClick={handleSelectFile}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg shadow-blue-500/25 transition-all duration-200 text-white font-semibold flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Browse
                </button>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-slate-200">Advanced Settings</span>
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
              )}
            </button>

            {/* Advanced Settings Panel */}
            {showAdvanced && (
              <div className="space-y-4 p-6 rounded-xl bg-slate-800/20 border border-slate-700/30">
                {/* Output Name */}
                <div className="space-y-2">
                  <label htmlFor="outputName" className="text-sm font-medium text-slate-300">
                    Output Name
                  </label>
                  <input
                    id="outputName"
                    type="text"
                    value={outputName}
                    onChange={(e) => setOutputName(e.target.value)}
                    placeholder="output"
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                </div>

                {/* Output Path Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Output Location</label>
                  <select
                    value={outputMode}
                    onChange={(e) => setOutputMode(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  >
                    <option value="default">Use Default Output Path</option>
                    <option value="sameAsInput">Same As Input File</option>
                    <option value="custom">Custom Path</option>
                  </select>
                </div>

                {/* Output Path - Only show if custom mode */}
                {outputMode === 'custom' && (
                  <div className="space-y-2">
                    <label htmlFor="outputPath" className="text-sm font-medium text-slate-300">
                      Custom Output Directory
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="outputPath"
                        type="text"
                        value={outputPath}
                        onChange={(e) => setOutputPath(e.target.value)}
                        placeholder="Select custom output directory"
                        className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                      />
                      <button
                        onClick={handleSelectOutput}
                        className="px-4 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50 transition-all duration-200"
                      >
                        <Folder className="w-4 h-4 text-slate-300" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Split Time */}
                <div className="space-y-2">
                  <label htmlFor="splitTime" className="text-sm font-medium text-slate-300">
                    Segment Duration (seconds)
                  </label>
                  <input
                    id="splitTime"
                    type="number"
                    value={splitTime}
                    onChange={(e) => setSplitTime(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  />
                </div>

                {/* Audio Only Option */}
                <div className="flex items-center gap-3">
                  <input
                    id="audioOnly"
                    type="checkbox"
                    checked={audioOnly}
                    onChange={(e) => {
                      setAudioOnly(e.target.checked)
                      // Reset quality to medium when switching modes
                      setQuality('medium')
                    }}
                    className="w-4 h-4 rounded bg-slate-800/50 border-slate-700/50 text-purple-600 focus:ring-2 focus:ring-purple-500/50"
                  />
                  <label htmlFor="audioOnly" className="text-sm text-slate-300">
                    Extract audio only (no video)
                  </label>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <label htmlFor="quality" className="text-sm font-medium text-slate-300">
                    {audioOnly ? 'Audio Quality' : 'Video Quality'}
                  </label>
                  <select
                    id="quality"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  >
                    {audioOnly ? (
                      <>
                        <option value="low">64 kbps</option>
                        <option value="medium">128 kbps</option>
                        <option value="high">320 kbps</option>
                      </>
                    ) : (
                      <>
                        <option value="low">Low (Fast)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Best Quality)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 h-12 rounded-xl bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleConvert}
                disabled={!selectedFile}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed border-0 shadow-lg shadow-blue-500/25 transition-all duration-200 text-white font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                Convert to HLS
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
