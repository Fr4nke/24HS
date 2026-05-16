'use client'

import { useEffect, useRef } from 'react'

interface Props {
  onClose: () => void
}

export default function AboutModal({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">Om 24h Secret</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition-colors text-lg leading-none"
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm text-zinc-400 max-h-[70vh] overflow-y-auto">
          <p className="text-zinc-200">
            Del noe du aldri har turt å si høyt. Anonymt. Ingen spor. Borte etter 24 timer.
          </p>

          <Section title="Slik fungerer det">
            <Item>Skriv en hemmelighet — ingen konto nødvendig</Item>
            <Item>Velg et mood som passer det du føler</Item>
            <Item>Den forsvinner automatisk etter 24 timer</Item>
          </Section>

          <Section title="Reaksjoner">
            <Item>🙋 <strong className="text-zinc-300">Meg også</strong> — du kjenner deg igjen</Item>
            <Item>🤯 <strong className="text-zinc-300">Vill</strong> — du er overrasket</Item>
            <Item>🤨 <strong className="text-zinc-300">Tvilsom</strong> — du tror ikke helt på det</Item>
            <Item>Du kan trekke tilbake en reaksjon ved å trykke igjen</Item>
          </Section>

          <Section title="Kommentarer">
            <Item>Svar på hemmeligheter — også anonymt</Item>
            <Item>Du kan svare direkte på en kommentar i tråder</Item>
            <Item>Kommentarer forsvinner når hemmeligheten utløper</Item>
          </Section>

          <Section title="Whispers">
            <Item>Logg inn for å sende private meldinger til eieren av en hemmelighet</Item>
            <Item>Kun synlig for deg og mottakeren</Item>
            <Item>Finn dem i innboksen din</Item>
          </Section>

          <Section title="Personvern">
            <Item>Ingen hemmeligheter knyttes til navn eller e-post uten innlogging</Item>
            <Item>Innloggede brukere vises kun som et anonymt ID (#abc123)</Item>
            <Item>Vi lagrer ikke IP-adresser</Item>
          </Section>

          <p className="text-zinc-600 text-xs pt-1">
            24h Secret · Alt forsvinner. Ingenting varer.
          </p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</p>
      <ul className="space-y-1">{children}</ul>
    </div>
  )
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-zinc-400">
      <span className="text-zinc-700 mt-0.5 flex-shrink-0">–</span>
      <span>{children}</span>
    </li>
  )
}
