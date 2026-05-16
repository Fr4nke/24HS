'use client'

interface Props {
  sort: 'recent' | 'top'
  onChange: (sort: 'recent' | 'top') => void
}

export default function FeedToggle({ sort, onChange }: Props) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange('recent')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          sort === 'recent'
            ? 'bg-zinc-700 text-white'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Latest
      </button>
      <button
        onClick={() => onChange('top')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          sort === 'top'
            ? 'bg-zinc-700 text-white'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Top 24h ✦
      </button>
    </div>
  )
}
