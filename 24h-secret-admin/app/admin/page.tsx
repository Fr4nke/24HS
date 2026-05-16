import { getAdminClient } from '@/lib/supabase-admin'
import { logout, deleteSecret, deleteWhisper } from './actions'
import DeleteButton from './DeleteButton'

type Tab = 'stats' | 'secrets' | 'whispers'

const now = new Date()
const ago = (days: number) => new Date(now.getTime() - days * 86400000).toISOString()

async function fetchStats(db: ReturnType<typeof getAdminClient>) {
  const [
    { count: secretsTotal },
    { count: secretsMonth },
    { count: secretsWeek },
    { count: secretsDay },
    { count: whispersTotal },
    { count: whispersMonth },
    { count: whispersWeek },
    { count: whispersDay },
    { data: reactionData },
  ] = await Promise.all([
    db.from('secrets').select('*', { count: 'exact', head: true }),
    db.from('secrets').select('*', { count: 'exact', head: true }).gte('created_at', ago(30)),
    db.from('secrets').select('*', { count: 'exact', head: true }).gte('created_at', ago(7)),
    db.from('secrets').select('*', { count: 'exact', head: true }).gte('created_at', ago(1)),
    db.from('whispers').select('*', { count: 'exact', head: true }),
    db.from('whispers').select('*', { count: 'exact', head: true }).gte('created_at', ago(30)),
    db.from('whispers').select('*', { count: 'exact', head: true }).gte('created_at', ago(7)),
    db.from('whispers').select('*', { count: 'exact', head: true }).gte('created_at', ago(1)),
    db.from('secrets').select('total_reactions'),
  ])

  const totalReactions = (reactionData ?? []).reduce((s: number, r: { total_reactions: number }) => s + (r.total_reactions ?? 0), 0)

  // Fetch user counts via auth admin API
  const { data: usersData } = await db.auth.admin.listUsers({ perPage: 1 })
  const usersTotal = usersData?.total ?? 0

  // Users by created_at — need to page through all users to filter by date
  // We approximate with a secondary query for recent users
  const { data: allUsers } = await db.auth.admin.listUsers({ perPage: 1000 })
  const users = allUsers?.users ?? []
  const usersMonth = users.filter(u => u.created_at >= ago(30)).length
  const usersWeek = users.filter(u => u.created_at >= ago(7)).length
  const usersDay = users.filter(u => u.created_at >= ago(1)).length

  return {
    secrets: { total: secretsTotal ?? 0, month: secretsMonth ?? 0, week: secretsWeek ?? 0, day: secretsDay ?? 0 },
    whispers: { total: whispersTotal ?? 0, month: whispersMonth ?? 0, week: whispersWeek ?? 0, day: whispersDay ?? 0 },
    users: { total: usersTotal, month: usersMonth, week: usersWeek, day: usersDay },
    totalReactions,
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'stats' } = await searchParams as { tab?: Tab }
  const db = getAdminClient()

  const [stats, secretsResult, whispersResult] = await Promise.all([
    tab === 'stats' ? fetchStats(db) : null,
    tab === 'secrets'
      ? db.from('secrets')
          .select('id,text,mood,expires_at,reaction_me_too,reaction_wild,reaction_doubtful,total_reactions,user_id,created_at')
          .order('created_at', { ascending: false })
          .limit(200)
      : { data: [] },
    tab === 'whispers'
      ? db.from('whispers')
          .select('id,secret_id,sender_id,receiver_id,text,created_at,read_at')
          .order('created_at', { ascending: false })
          .limit(200)
      : { data: [] },
  ])

  const secrets = (secretsResult as { data: unknown[] }).data ?? []
  const whispers = (whispersResult as { data: unknown[] }).data ?? []
  const nowIso = now.toISOString()

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255,232,220,0.08)',
        background: '#1a0a0d',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <h1 style={{ margin: 0, fontSize: 17, color: '#FF7A4D', fontWeight: 600 }}>
          🔐 24h Secret Admin
        </h1>
        <form action={logout}>
          <button type="submit" style={{
            background: 'none',
            border: '1px solid rgba(255,232,220,0.15)',
            color: '#9a7070',
            borderRadius: 6,
            padding: '5px 12px',
            cursor: 'pointer',
            fontSize: 12,
          }}>
            Logout
          </button>
        </form>
      </header>

      {/* Tabs */}
      <nav style={{ display: 'flex', gap: 6, padding: '12px 24px', borderBottom: '1px solid rgba(255,232,220,0.08)' }}>
        {(['stats', 'secrets', 'whispers'] as Tab[]).map(t => (
          <a key={t} href={`/admin?tab=${t}`} style={{
            padding: '5px 14px',
            borderRadius: 100,
            fontSize: 13,
            textDecoration: 'none',
            color: tab === t ? 'white' : '#9a7070',
            background: tab === t ? '#FF7A4D' : 'transparent',
            border: tab === t ? 'none' : '1px solid rgba(255,232,220,0.1)',
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </a>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: 24 }}>

        {/* ── Stats ── */}
        {tab === 'stats' && stats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <StatGroup label="Users" rows={[
              ['Total', stats.users.total],
              ['Last 30 days', stats.users.month],
              ['Last 7 days', stats.users.week],
              ['Last 24h', stats.users.day],
            ]} icon="👤" />
            <StatGroup label="Secrets" rows={[
              ['Total', stats.secrets.total],
              ['Last 30 days', stats.secrets.month],
              ['Last 7 days', stats.secrets.week],
              ['Last 24h', stats.secrets.day],
            ]} icon="🤫" />
            <StatGroup label="Whispers" rows={[
              ['Total', stats.whispers.total],
              ['Last 30 days', stats.whispers.month],
              ['Last 7 days', stats.whispers.week],
              ['Last 24h', stats.whispers.day],
            ]} icon="💬" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              <StatCard label="Total Reactions" value={stats.totalReactions} icon="⚡" />
            </div>
            <p style={{ color: '#9a7070', fontSize: 12, margin: 0 }}>
              ℹ️ Premium users og shares er ikke implementert ennå — kan legges til i databasen.
            </p>
          </div>
        )}

        {/* ── Secrets ── */}
        {tab === 'secrets' && (
          <>
            <p style={{ color: '#9a7070', margin: '0 0 16px', fontSize: 13 }}>
              Showing {secrets.length} secrets (newest first)
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['ID', 'Text', 'Mood', 'Posted', 'Expires', 'User', '🙋🤯🤨', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#9a7070', fontWeight: 500, borderBottom: '1px solid rgba(255,232,220,0.08)', whiteSpace: 'nowrap', fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(secrets as Record<string, unknown>[]).map(s => {
                    const expired = (s.expires_at as string) < nowIso
                    return (
                      <tr key={s.id as string} style={{ borderBottom: '1px solid rgba(255,232,220,0.04)', opacity: expired ? 0.5 : 1 }}>
                        <td style={{ padding: '7px 12px', color: '#9a7070', fontFamily: 'monospace', fontSize: 11 }}>{(s.id as string).slice(0, 8)}</td>
                        <td style={{ padding: '7px 12px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.text as string}>{s.text as string}</td>
                        <td style={{ padding: '7px 12px', color: '#9a7070' }}>{s.mood as string}</td>
                        <td style={{ padding: '7px 12px', color: '#9a7070', whiteSpace: 'nowrap', fontSize: 11 }}>{new Date(s.created_at as string).toLocaleDateString('no')}</td>
                        <td style={{ padding: '7px 12px', color: expired ? '#ff5f5f' : '#9a7070', whiteSpace: 'nowrap', fontSize: 11 }}>{expired ? 'Expired' : new Date(s.expires_at as string).toLocaleDateString('no')}</td>
                        <td style={{ padding: '7px 12px', color: '#9a7070', fontFamily: 'monospace', fontSize: 11 }}>{s.user_id ? (s.user_id as string).slice(0, 8) : '—'}</td>
                        <td style={{ padding: '7px 12px', color: '#9a7070', whiteSpace: 'nowrap' }}>{s.reaction_me_too as number} · {s.reaction_wild as number} · {s.reaction_doubtful as number}</td>
                        <td style={{ padding: '7px 12px' }}>
                          <DeleteButton id={s.id as string} action={deleteSecret} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Whispers ── */}
        {tab === 'whispers' && (
          <>
            <p style={{ color: '#9a7070', margin: '0 0 16px', fontSize: 13 }}>
              Showing {whispers.length} whispers (newest first)
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['ID', 'Secret', 'From', 'To', 'Message', 'Sent', 'Read', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#9a7070', fontWeight: 500, borderBottom: '1px solid rgba(255,232,220,0.08)', whiteSpace: 'nowrap', fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(whispers as Record<string, unknown>[]).map(w => (
                    <tr key={w.id as string} style={{ borderBottom: '1px solid rgba(255,232,220,0.04)' }}>
                      <td style={{ padding: '7px 12px', color: '#9a7070', fontFamily: 'monospace', fontSize: 11 }}>{(w.id as string).slice(0, 8)}</td>
                      <td style={{ padding: '7px 12px', color: '#9a7070', fontFamily: 'monospace', fontSize: 11 }}>{(w.secret_id as string).slice(0, 8)}</td>
                      <td style={{ padding: '7px 12px', color: '#9a7070', fontFamily: 'monospace', fontSize: 11 }}>{(w.sender_id as string).slice(0, 8)}</td>
                      <td style={{ padding: '7px 12px', color: '#9a7070', fontFamily: 'monospace', fontSize: 11 }}>{(w.receiver_id as string).slice(0, 8)}</td>
                      <td style={{ padding: '7px 12px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={w.text as string}>{w.text as string}</td>
                      <td style={{ padding: '7px 12px', color: '#9a7070', whiteSpace: 'nowrap', fontSize: 11 }}>{new Date(w.created_at as string).toLocaleDateString('no')}</td>
                      <td style={{ padding: '7px 12px', color: '#9a7070', fontSize: 11 }}>{w.read_at ? '✓' : '—'}</td>
                      <td style={{ padding: '7px 12px' }}>
                        <DeleteButton id={w.id as string} action={deleteWhisper} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{
      background: '#1a0a0d',
      border: '1px solid rgba(255,232,220,0.08)',
      borderRadius: 12,
      padding: '18px 20px',
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#FF7A4D' }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 12, color: '#9a7070', marginTop: 4 }}>{icon} {label}</div>
    </div>
  )
}

function StatGroup({ label, rows, icon }: { label: string; rows: [string, number][]; icon: string }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 12px', fontSize: 12, color: '#9a7070', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
        {icon} {label}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {rows.map(([period, value]) => (
          <div key={period} style={{
            background: '#1a0a0d',
            border: '1px solid rgba(255,232,220,0.08)',
            borderRadius: 12,
            padding: '16px 18px',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FF7A4D' }}>{value.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#9a7070', marginTop: 4 }}>{period}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
