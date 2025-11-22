import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function Player({ src }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setCurrent(el.currentTime)
    const onEnd = () => setPlaying(false)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnd)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('ended', onEnd)
    }
  }, [])

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) { el.play(); setPlaying(true) } else { el.pause(); setPlaying(false) }
  }
  const seek = (e) => {
    const el = audioRef.current
    const v = parseFloat(e.target.value)
    el.currentTime = v
    setCurrent(v)
  }

  return (
    <motion.div className="bg-slate-900/50 border border-white/10 rounded-2xl p-3 backdrop-blur-xl">
      <audio ref={audioRef} src={src} preload="auto" />
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="px-3 py-1.5 rounded-lg bg-[#06b6d4] text-white text-sm font-medium hover:brightness-110">
          {playing ? 'Pause' : 'Play'}
        </button>
        <input type="range" min={0} max={duration || audioRef.current?.duration || 0} step={0.01} value={current} onChange={seek} className="flex-1" onInput={() => setDuration(audioRef.current?.duration || 0)} />
        <div className="text-xs text-slate-300/70 w-24 text-right">
          {current.toFixed(1)} / {(audioRef.current?.duration || 0).toFixed(1)}s
        </div>
      </div>
    </motion.div>
  )
}
