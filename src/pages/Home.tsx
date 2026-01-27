import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { FileVideo, FolderOpen, Zap } from 'lucide-react'

export function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has configured settings before
    const settings = localStorage.getItem('rapidhls-settings')
    if (!settings) {
      // First time user, redirect to settings
      navigate('/settings')
    }
  }, [navigate])

  return (
    <div className="min-h-full flex items-center justify-center p-8 py-12">
      <div className="w-full max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Fast & Reliable Video Conversion</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            RapidHLS Converter
          </h1>
          <p className="text-lg text-slate-400">Convert your videos to HLS format with ease</p>
        </div>

        {/* Conversion Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Single Convert Card */}
          <button
            onClick={() => navigate('/single-convert')}
            className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Glass Card */}
            <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 group-hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-500">
              {/* Icon Container */}
              <div className="mb-6 inline-flex p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <FileVideo className="w-12 h-12 text-blue-400 group-hover:text-blue-300 transition-colors duration-500" strokeWidth={1.5} />
              </div>
              
              {/* Content */}
              <div className="space-y-3 text-left">
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-white transition-colors duration-300">
                  Single Convert
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">
                  Perfect for converting individual video files quickly and efficiently
                </p>
              </div>
              
              {/* Arrow Indicator */}
              <div className="mt-6 flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all duration-300">
                <span className="text-sm font-medium">Get Started</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Bulk Convert Card */}
          <button
            onClick={() => navigate('/bulk-convert')}
            className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Glass Card */}
            <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 group-hover:border-purple-500/50 rounded-2xl p-8 transition-all duration-500">
              {/* Icon Container */}
              <div className="mb-6 inline-flex p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <FolderOpen className="w-12 h-12 text-purple-400 group-hover:text-purple-300 transition-colors duration-500" strokeWidth={1.5} />
              </div>
              
              {/* Content */}
              <div className="space-y-3 text-left">
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-white transition-colors duration-300">
                  Bulk Convert
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">
                  Process multiple video files at once to save time and effort
                </p>
              </div>
              
              {/* Arrow Indicator */}
              <div className="mt-6 flex items-center gap-2 text-purple-400 group-hover:gap-3 transition-all duration-300">
                <span className="text-sm font-medium">Get Started</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
