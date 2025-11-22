import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import LyricsBox from './components/LyricsBox'
import MelodyPreviewModal from './components/MelodyPreviewModal'
import Timeline from './components/Timeline'
import Player from './components/Player'

const demoLyrics = `When the night is young
We chase the neon glow
Hearts are beating as one
Feel the river flow`

export default function App() {
  const [previewData, setPreviewData] = useState(null)
  const [regions, setRegions] = useState([])
  const [guideUrl, setGuideUrl] = useState(null)

  const accent = {
    primary: '#7c3aed',
    secondary: '#06b6d4',
  }

  const handlePreview = (data) => {
    setPreviewData(data)
    setGuideUrl(data.guideAudioUrl || null)
    setRegions(data.timestamps || [])
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_70%_10%,rgba(124,58,237,0.25),transparent),radial-gradient(400px_160px_at_20%_20%,rgba(6,182,212,0.18),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 md:py-8">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Studio</h1>
          <button className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white font-medium shadow-[0_0_18px_rgba(124,58,237,0.45)] hover:shadow-[0_0_26px_rgba(124,58,237,0.65)]">Create</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <LyricsBox initialLyrics={demoLyrics} onPreview={handlePreview} />
            <Timeline audioUrl={guideUrl} regions={regions} onRegionsChange={setRegions} />
            <Player src={guideUrl} />
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <motion.div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
              <h3 className="text-sm font-medium mb-2">Instruments</h3>
              <div className="space-y-2 text-slate-300/80 text-sm">
                <div className="flex items-center justify-between"><span>Drums</span><input type="range" min={0} max={100} defaultValue={80} /></div>
                <div className="flex items-center justify-between"><span>Bass</span><input type="range" min={0} max={100} defaultValue={60} /></div>
                <div className="flex items-center justify-between"><span>Pad</span><input type="range" min={0} max={100} defaultValue={40} /></div>
                <div className="flex items-center justify-between"><span>Lead</span><input type="range" min={0} max={100} defaultValue={70} /></div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      <MelodyPreviewModal open={!!previewData} onOpenChange={(v)=>{ if(!v) setPreviewData(null) }} data={previewData} />
    </div>
  )
}
