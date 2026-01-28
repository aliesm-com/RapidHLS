import { Minus, X, Info, Settings as SettingsIcon, Home } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function TitleBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const handleMinimize = () => window.electronAPI?.minimizeWindow()
  const handleClose = () => window.electronAPI?.closeWindow()

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 bg-slate-900/30 backdrop-blur-xl shadow-lg select-none"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex items-center gap-3 px-5">
        <span className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          RapidHLS
        </span>
        <div className="flex gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button
            onClick={() => navigate('/')}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-700/50 transition-all duration-200',
              location.pathname === '/' && 'bg-slate-700/70'
            )}
            aria-label="Home"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-700/50 transition-all duration-200',
              location.pathname === '/settings' && 'bg-slate-700/70'
            )}
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/about')}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-700/50 transition-all duration-200',
              location.pathname === '/about' && 'bg-slate-700/70'
            )}
            aria-label="About"
            title="About"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={handleMinimize}
          className={cn(
            'h-12 w-14 flex items-center justify-center hover:bg-slate-700/50 transition-all duration-200'
          )}
          aria-label="Minimize"
        >
          <Minus className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={handleClose}
          className={cn(
            'h-12 w-14 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-200'
          )}
          aria-label="Close"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  )
}
