import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

let WaveSurferLib = null
let RegionsPlugin = null
async function ensureWavesurfer() {
  if (!WaveSurferLib) {
    const mod = await import('wavesurfer.js')
    WaveSurferLib = mod.default || mod
  }
  if (!RegionsPlugin) {
    const mod = await import('wavesurfer.js/dist/plugins/regions.esm.js')
    RegionsPlugin = mod.default || mod
  }
  return { WaveSurferLib, RegionsPlugin }
}

function Lane({ title, audioUrl, showRegions, regions = [], onRegionsChange }) {
  const containerRef = useRef(null)
  const wavesurferRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let ws
    let regionsPlugin
    async function setup() {
      try {
        const { WaveSurferLib, RegionsPlugin } = await ensureWavesurfer()
        ws = WaveSurferLib.create({
          container: containerRef.current,
          waveColor: '#334155',
          progressColor: '#7c3aed',
          backend: 'WebAudio',
          height: 84,
          plugins: [RegionsPlugin.create()],
        })
        regionsPlugin = ws.getActivePlugins().regions
        ws.on('ready', () => setReady(true))
        ws.load(audioUrl)
        wavesurferRef.current = ws

        if (showRegions) {
          regions.forEach(r => {
            regionsPlugin.addRegion({ start: r.start_ms / 1000, end: r.end_ms / 1000, color: 'rgba(124,58,237,0.25)', drag: true, resize: true, data: { lineText: r.lineText } })
          })
          regionsPlugin.on('region-updated', () => {
            const updated = Object.values(regionsPlugin.regions).map(reg => ({
              lineText: reg.data?.lineText || '',
              start_ms: Math.round(reg.start * 1000),
              end_ms: Math.round(reg.end * 1000),
            }))
            onRegionsChange?.(updated)
          })
        }
      } catch (e) {
        console.warn('Wavesurfer failed, will show fallback', e)
      }
    }
    setup()
    return () => {
      try { wavesurferRef.current?.destroy?.() } catch { }
    }
  }, [audioUrl])

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-2">
      <div className="text-xs text-slate-300/80 mb-1">{title}</div>
      <div ref={containerRef} className="w-full rounded-md overflow-hidden bg-slate-900/60 h-[88px]" />
      {!ready && (
        <div className="text-xs text-slate-300/70 mt-2">Loading waveform...</div>
      )}
    </div>
  )
}

export default function Timeline({ audioUrl, tracks = [], regions = [], onRegionsChange }) {
  const allLanes = []
  if (audioUrl) allLanes.push({ title: 'Guide', audioUrl, showRegions: true })
  tracks.forEach((t, i) => allLanes.push({ title: t.name || `Track ${i+1}`, audioUrl: t.audioUrl, showRegions: i === 0 && !audioUrl }))

  return (
    <motion.div className="bg-slate-900/50 border border-white/10 rounded-2xl p-3 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-100 text-sm font-medium">Timeline</h3>
        <div className="flex items-center gap-2 text-xs opacity-70">
          Click regions to adjust timings
        </div>
      </div>
      <div className="space-y-2">
        {allLanes.length === 0 ? (
          <div className="text-sm text-slate-400">No audio loaded yet.</div>
        ) : (
          allLanes.map((lane, idx) => (
            <Lane key={idx} title={lane.title} audioUrl={lane.audioUrl} showRegions={lane.showRegions} regions={regions} onRegionsChange={onRegionsChange} />
          ))
        )}
      </div>
    </motion.div>
  )
}
