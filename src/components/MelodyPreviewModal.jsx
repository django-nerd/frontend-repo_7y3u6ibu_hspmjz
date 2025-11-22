import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'framer-motion'

// Lazy import Tone only when playing
let ToneRef = null
async function ensureTone() {
  if (!ToneRef) {
    ToneRef = await import('tone')
  }
  return ToneRef
}

function PianoRoll({ notes = [], pixelsPerBeat = 40, beats = 8 }) {
  // notes: [{midi: 60, time: 0, duration: 0.5}]
  const height = 12 * 16
  const width = beats * pixelsPerBeat
  const minMidi = 48
  const maxMidi = 84
  const range = maxMidi - minMidi
  return (
    <svg className="w-full bg-slate-800/60 rounded-lg border border-white/10" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[...Array(beats + 1)].map((_, i) => (
        <line key={i} x1={i * pixelsPerBeat} y1={0} x2={i * pixelsPerBeat} y2={height} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {notes.map((n, idx) => {
        const x = n.time * pixelsPerBeat
        const y = ((maxMidi - n.midi) / range) * (height - 20) + 10
        const w = Math.max(4, n.duration * pixelsPerBeat - 2)
        return (
          <rect key={idx} x={x} y={y} width={w} height={12} rx={3} className="fill-[#06b6d4] opacity-80" />
        )
      })}
    </svg>
  )
}

export default function MelodyPreviewModal({ open, onOpenChange, data }) {
  const [playing, setPlaying] = useState(false)
  const synthRef = useRef(null)

  const notes = useMemo(() => {
    if (!data?.midiJson?.notes) return []
    return data.midiJson.notes
  }, [data])

  const beats = useMemo(() => Math.ceil((notes?.reduce((a, n) => Math.max(a, n.time + n.duration), 0) || 8)), [notes])

  useEffect(() => {
    if (!open && synthRef.current) {
      synthRef.current.dispose?.()
      synthRef.current = null
      setPlaying(false)
    }
  }, [open])

  const handlePlay = async () => {
    if (playing) {
      synthRef.current?.dispose?.()
      synthRef.current = null
      setPlaying(false)
      return
    }
    const Tone = await ensureTone()
    await Tone.start()
    const now = Tone.now()
    const synth = new Tone.Synth({ oscillator: { type: 'sine' } }).toDestination()
    synthRef.current = synth
    notes.forEach(n => {
      synth.triggerAttackRelease(Tone.Frequency(n.midi, 'midi'), n.duration, now + n.time)
    })
    const end = notes.reduce((a, n) => Math.max(a, n.time + n.duration), 0)
    setPlaying(true)
    setTimeout(() => {
      setPlaying(false)
      synth.dispose()
      synthRef.current = null
    }, Math.max(1, end) * 1000 + 100)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-3xl bg-slate-900/80 border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-slate-100 text-lg font-medium">Melody Preview</Dialog.Title>
              <Dialog.Close className="text-slate-300 hover:text-white">✕</Dialog.Close>
            </div>
            <div className="space-y-4">
              <PianoRoll notes={notes} beats={beats} />
              <div className="flex items-center gap-3">
                <button onClick={handlePlay} className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_28px_rgba(124,58,237,0.55)]">
                  {playing ? 'Stop' : 'Play Preview'}
                </button>
                {data?.guideAudioUrl && (
                  <audio controls src={data.guideAudioUrl} className="opacity-80" />
                )}
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
