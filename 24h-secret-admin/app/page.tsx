import { login } from './admin/actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{
        background: '#1a0a0d',
        border: '1px solid rgba(255,232,220,0.1)',
        borderRadius: 16,
        padding: 32,
        width: 320,
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#FF7A4D' }}>🔐 Admin</h1>
        <p style={{ margin: '0 0 24px', color: '#9a7070', fontSize: 13 }}>24h Secret</p>
        {error && (
          <p style={{ color: '#ff5f5f', fontSize: 13, margin: '0 0 16px' }}>Wrong password.</p>
        )}
        <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            required
            style={{
              padding: '10px 12px',
              background: '#0f0a0b',
              border: '1px solid rgba(255,232,220,0.15)',
              borderRadius: 8,
              color: '#ffe8dc',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              background: '#FF7A4D',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
