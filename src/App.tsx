import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { SplashScreen } from './components/SplashScreen'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { About } from './pages/About'
import { SingleConvert } from './pages/SingleConvert'
import { BulkConvert } from './pages/BulkConvert'
import { InstallGuide } from './pages/InstallGuide'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  return (
    <HashRouter>
      <Toaster 
        position="top-center" 
        expand={false}
        richColors 
        closeButton
        toastOptions={{
          style: {
            background: 'rgb(15 23 42 / 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgb(71 85 105 / 0.5)',
            color: 'rgb(226 232 240)',
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/install-guide" element={<InstallGuide />} />
          <Route path="/about" element={<About />} />
          <Route path="/single-convert" element={<SingleConvert />} />
          <Route path="/bulk-convert" element={<BulkConvert />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
