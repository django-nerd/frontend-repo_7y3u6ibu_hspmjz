import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LyricsBox({ initialLyrics = '', onPreview }) {
  const [lyrics, setLyrics] = useState(initialLyrics)
  const [tempo, setTempo] = useState(96)
  const [keySig, setKeySig] = useState('C')
  const [style, setStyle] = useState('pop')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLyrics(initialLyrics)
  }, [initialLyrics])

  const handlePreview = async () => {
    setError('')
    setLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const res = await fetch(`${baseUrl}/api/generate/melody-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics, tempo, key: keySig, style }),
      })
      if (!res.ok) throw new Error(`Preview failed: ${res.status}`)
      const data = await res.json()
      onPreview?.({ ...data, lyrics, tempo, key: keySig, style })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.08)]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-100 font-medium tracking-tight">Lyrics</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={60}
            max={180}
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value || '96'))}
            className="w-20 bg-slate-800/60 border border-white/10 rounded px-2 py-1 text-slate-200 text-sm"
            title="Tempo"
          />
          <select
            value={keySig}
            onChange={(e) => setKeySig(e.target.value)}
            className="bg-slate-800/60 border border-white/10 rounded px-2 py-1 text-slate-200 text-sm"
            title="Key"
          >
            {['C','D','E','F','G','A','B'].map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="bg-slate-800/60 border border-white/10 rounded px-2 py-1 text-slate-200 text-sm"
            title="Style"
          >
            {['pop','rock','rnb','edm','folk'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <button
            onClick={handlePreview}
            disabled={loading || !lyrics.trim()}
            className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#7c3aed] text-white text-sm font-medium shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_28px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 transition-transform disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 rounded-full bg-white/30 animate-pulse" />
            ) : (
              <span>Preview Melody</span>
            )}
          </button>
        </div>
      </div>
      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder={"Paste or write your lyrics here...\nOne line per phrase for best results."}
        rows={8}
        className="w-full resize-y bg-slate-800/60 border border-white/10 rounded-xl p-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/40"
      />
      {error && (
        <div className="mt-2 text-xs text-red-300">{error}</div>
      )}
    </motion.div>
  )
}
