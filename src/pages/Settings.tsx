import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Folder, HelpCircle, Settings as SettingsIcon, Zap } from 'lucide-react'

export function Settings() {
  const navigate = useNavigate()
  const [ffmpegPath, setFfmpegPath] = useState('')
  const [splitTime, setSplitTime] = useState('10')
  const [defaultOutputPath, setDefaultOutputPath] = useState('')
  const [quality, setQuality] = useState('medium')
  const [isFirstTime, setIsFirstTime] = useState(false)

  useEffect(() => {
    // Check if user has ever visited settings before
    const hasVisitedSettings = localStorage.getItem('rapidhls-settings-visited')
    if (!hasVisitedSettings) {
      setIsFirstTime(true)
      localStorage.setItem('rapidhls-settings-visited', 'true')
    }

    // Load existing settings
    const settings = localStorage.getItem('rapidhls-settings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        if (parsed.ffmpegPath) setFfmpegPath(parsed.ffmpegPath)
        if (parsed.splitTime) setSplitTime(parsed.splitTime)
        if (parsed.defaultOutputPath) setDefaultOutputPath(parsed.defaultOutputPath)
        if (parsed.quality) setQuality(parsed.quality)
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }, [])

  const handleBrowse = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.openFolderDialog()
      if (path) {
        // Check if we're setting FFMPEG path or output path based on focus
        // For now, we'll use this for output path
        setDefaultOutputPath(path)
      }
    }
  }

  const handleBrowseFFMPEG = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.openFolderDialog()
      if (path) {
        setFfmpegPath(path)
      }
    }
  }

  const handleFFMPEGHelp = () => {
    navigate('/install-guide')
  }

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem(
      'rapidhls-settings',
      JSON.stringify({
        ffmpegPath,
        splitTime,
        defaultOutputPath,
        quality,
        configured: true,
      })
    )

    toast.success('Settings saved successfully!', {
      description: 'Your preferences have been saved to local storage.',
    })

    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  const handleLater = () => {
    // Mark as seen but not configured
    localStorage.setItem(
      'rapidhls-settings',
      JSON.stringify({
        ffmpegPath: '',
        splitTime: '10',
        defaultOutputPath: '',
        quality: 'medium',
        configured: false,
      })
    )

    toast.info('Settings skipped', {
      description: 'You can configure settings anytime from the settings menu.',
    })

    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  return (
    <div className="min-h-full flex items-center justify-center p-8 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
            <SettingsIcon className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">
              {isFirstTime ? 'Initial Setup' : 'Application Settings'}
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {isFirstTime ? 'Welcome to RapidHLS' : 'Settings'}
          </h1>
          <p className="text-lg text-slate-400">
            {isFirstTime
              ? 'Please configure the following settings to get started'
              : 'Configure your HLS converter settings'}
          </p>
        </div>

        {/* Settings Card */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-500/5 to-transparent" />
          <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 space-y-6">
            {/* FFMPEG Path */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ffmpeg"
                  className="text-sm font-semibold text-slate-200 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-blue-400" />
                  FFMPEG Installation Path
                </label>
                <button
                  onClick={handleFFMPEGHelp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200"
                  title="How to install FFMPEG"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Installation Guide</span>
                </button>
              </div>
              <div className="flex gap-3">
                <input
                  id="ffmpeg"
                  type="text"
                  value={ffmpegPath}
                  onChange={(e) => setFfmpegPath(e.target.value)}
                  placeholder="C:\Program Files\ffmpeg\bin"
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
                <button
                  onClick={handleBrowseFFMPEG}
                  className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all duration-200 group"
                  title="Browse for FFMPEG directory"
                >
                  <Folder className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </button>
              </div>
            </div>

            {/* Split Time */}
            <div className="space-y-3">
              <label
                htmlFor="split"
                className="text-sm font-semibold text-slate-200 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                Default Split Time (seconds)
              </label>
              <input
                id="split"
                type="number"
                value={splitTime}
                onChange={(e) => setSplitTime(e.target.value)}
                placeholder="10"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              />
            </div>

            {/* Default Output Path */}
            <div className="space-y-3">
              <label
                htmlFor="outputPath"
                className="text-sm font-semibold text-slate-200 flex items-center gap-2"
              >
                <Folder className="w-4 h-4 text-blue-400" />
                Default Output Directory
              </label>
              <div className="flex gap-3">
                <input
                  id="outputPath"
                  type="text"
                  value={defaultOutputPath}
                  onChange={(e) => setDefaultOutputPath(e.target.value)}
                  placeholder="Same as input file"
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
                <button
                  onClick={handleBrowse}
                  className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all duration-200 group"
                  title="Browse for output directory"
                >
                  <Folder className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </button>
              </div>
            </div>

            {/* Quality Preset */}
            <div className="space-y-3">
              <label
                htmlFor="quality"
                className="text-sm font-semibold text-slate-200 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-pink-400" />
                Default Quality Preset
              </label>
              <select
                id="quality"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200"
              >
                <option value="low">Low (Fast)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Best Quality)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200"
                onClick={handleLater}
              >
                Later
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg shadow-blue-500/25 transition-all duration-200 text-white font-semibold"
                onClick={handleSave}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
