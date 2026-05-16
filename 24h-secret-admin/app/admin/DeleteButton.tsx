'use client'

type Action = (formData: FormData) => Promise<void>

export default function DeleteButton({ id, action }: { id: string; action: Action }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => { if (!confirm('Delete permanently?')) e.preventDefault() }}
        style={{
          padding: '3px 10px',
          background: 'rgba(255,80,80,0.12)',
          border: '1px solid rgba(255,80,80,0.35)',
          borderRadius: 6,
          color: '#ff7070',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
    </form>
  )
}
