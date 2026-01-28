import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConversion } from '@/contexts/ConversionContext'
import { ConversionProgress } from '@/components/ConversionProgress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Zap } from 'lucide-react'

export function ConversionInProgress() {
  const navigate = useNavigate()
  const conversion = useConversion()

  useEffect(() => {
    // If no files to convert, redirect back
    if (conversion.files.length === 0) {
      navigate(-1)
      return
    }

    // Setup event listeners
    if (window.electronAPI) {
      window.electronAPI.onConversionLog((message) => {
        conversion.addLog(message)
      })

      window.electronAPI.onConversionProgress((data) => {
        conversion.setCurrentFile(data.file)
        conversion.updateProgress(Math.min(conversion.progress + 5, 95))
      })

      // Start conversion
      performConversion()

      return () => {
        window.electronAPI?.removeConversionListeners()
      }
    }
  }, [])

  const performConversion = async () => {
    if (!window.electronAPI) return

    try {
      if (conversion.isBulk) {
        await performBulkConversion()
      } else {
        await performSingleConversion()
      }
    } catch (err: any) {
      conversion.setConversionError(err.error || 'An unknown error occurred')
    }
  }

  const performSingleConversion = async () => {
    if (!window.electronAPI) return

    const selectedFile = conversion.files[0]

    try {
      // Determine output path based on mode
      let finalOutputPath = ''

      if (conversion.outputMode === 'default') {
        finalOutputPath = conversion.defaultOutputFromSettings || ''
      } else if (conversion.outputMode === 'sameAsInput') {
        const lastSeparator = Math.max(
          selectedFile.lastIndexOf('\\'),
          selectedFile.lastIndexOf('/')
        )
        finalOutputPath = selectedFile.substring(0, lastSeparator)
      } else {
        finalOutputPath = conversion.outputPath
      }

      // Fallback to same as input if still empty
      if (!finalOutputPath) {
        const lastSeparator = Math.max(
          selectedFile.lastIndexOf('\\'),
          selectedFile.lastIndexOf('/')
        )
        finalOutputPath = selectedFile.substring(0, lastSeparator)
      }

      const result = await window.electronAPI.convertToHLS({
        inputFile: selectedFile,
        outputName: conversion.outputName || 'output',
        outputPath: finalOutputPath,
        splitTime: conversion.splitTime,
        quality: conversion.quality,
        audioOnly: conversion.audioOnly,
        ffmpegPath: conversion.ffmpegPath,
      })

      conversion.updateProgress(100)
      conversion.setConversionSuccess(true, result.outputDir)
      conversion.addLog(`\n✓ Conversion completed successfully!`)
      conversion.addLog(`✓ Output saved to: ${result.outputDir}`)
    } catch (err: any) {
      conversion.setConversionError(err.error || 'Conversion failed')
      conversion.addLog(`\n✗ Conversion failed: ${err.error}`)
    }
  }

  const performBulkConversion = async () => {
    if (!window.electronAPI) return

    const totalFiles = conversion.files.length
    let successCount = 0

    for (let i = 0; i < conversion.files.length; i++) {
      const file = conversion.files[i]
      const fileName =
        file
          .split(/[\\\/]/)
          .pop()
          ?.replace(/\.[^.]+$/, '') || `file_${i}`

      conversion.addLog(`\n=== Processing file ${i + 1}/${totalFiles}: ${fileName} ===\n`)
      conversion.setCurrentFile(file)

      // Determine output path based on mode
      let finalOutputPath = ''

      if (conversion.outputMode === 'default') {
        finalOutputPath = conversion.defaultOutputFromSettings || ''
      } else if (conversion.outputMode === 'sameAsInput') {
        const lastSeparator = Math.max(file.lastIndexOf('\\'), file.lastIndexOf('/'))
        finalOutputPath = file.substring(0, lastSeparator)
      } else {
        finalOutputPath = conversion.outputPath
      }

      // Fallback to same as input if still empty
      if (!finalOutputPath) {
        const lastSeparator = Math.max(file.lastIndexOf('\\'), file.lastIndexOf('/'))
        finalOutputPath = file.substring(0, lastSeparator)
      }

      try {
        const result = await window.electronAPI.convertToHLS({
          inputFile: file,
          outputName: fileName,
          outputPath: finalOutputPath,
          splitTime: conversion.splitTime,
          quality: conversion.quality,
          audioOnly: conversion.audioOnly,
          ffmpegPath: conversion.ffmpegPath,
        })

        successCount++
        conversion.setCompletedFiles(successCount)
        conversion.updateProgress(Math.round(((i + 1) / totalFiles) * 100))
        conversion.addLog(`✓ File ${i + 1} completed: ${result.outputDir}\n`)

        // Store the parent output directory
        if (i === conversion.files.length - 1) {
          conversion.setConversionSuccess(true, finalOutputPath)
        }
      } catch (err: any) {
        conversion.addLog(`✗ File ${i + 1} failed: ${err.error}\n`)
        // Continue with next file even if one fails
      }
    }

    conversion.setConversionSuccess(true)
    conversion.addLog(
      `\n✓ Batch conversion completed! ${successCount}/${totalFiles} files processed successfully.`
    )
  }

  const handleBack = () => {
    conversion.resetConversion()
    navigate(-1)
  }

  return (
    <div className="min-h-full flex items-center justify-center p-8 py-12">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">
              {conversion.isBulk ? 'Batch Conversion' : 'Converting to HLS'}
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {conversion.isBulk ? 'Processing Files' : 'Converting'}
          </h1>
          <p className="text-lg text-slate-400">
            {conversion.isBulk
              ? `Converting ${conversion.totalFiles} files to HLS format`
              : 'Please wait while your file is being converted'}
          </p>
        </div>

        {/* Progress Card */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-500/5 to-transparent" />
          <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 space-y-6">
            <ConversionProgress
              isConverting={conversion.isConverting}
              progress={conversion.progress}
              logs={conversion.logs}
              error={conversion.error}
              success={conversion.success}
              outputDir={conversion.outputDir}
              isBulk={conversion.isBulk}
            />

            {/* Back Button */}
            {(conversion.success || conversion.error) && (
              <div className="pt-4">
                <Button
                  onClick={handleBack}
                  className="w-full h-12 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-200 text-slate-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
