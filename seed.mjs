import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load from 24h-secret/.env.local — never hardcode credentials
try {
  for (const line of readFileSync('./24h-secret/.env.local', 'utf8').split('\n')) {
    const eq = line.indexOf('=')
    if (eq > 0 && !line.startsWith('#')) {
      process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
    }
  }
} catch { /* file not found, rely on existing env */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const now = Date.now()
const daysAgo = d => new Date(now - d * 86_400_000).toISOString()
const inHours = h => new Date(now + h * 3_600_000).toISOString()

async function clearAll() {
  console.log('Clearing whispers...')
  await db.from('whispers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('Clearing secrets...')
  await db.from('secrets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('Fetching existing users...')
  const { data } = await db.auth.admin.listUsers({ perPage: 1000 })
  for (const u of data?.users ?? []) {
    await db.auth.admin.deleteUser(u.id)
    console.log('  deleted user:', u.email)
  }
}

const USER_DEFS = [
  { email: 'ola.nordmann@gmail.com',    name: 'Ola Nordmann' },
  { email: 'kari.bakke@hotmail.com',    name: 'Kari Bakke' },
  { email: 'erik.solberg@outlook.com',  name: 'Erik Solberg' },
  { email: 'ingrid.holm@yahoo.no',      name: 'Ingrid Holm' },
  { email: 'thomas.berg@gmail.com',     name: 'Thomas Berg' },
  { email: 'maja.lund@gmail.com',       name: 'Maja Lund' },
]

async function createUsers() {
  const users = []
  for (const def of USER_DEFS) {
    const { data, error } = await db.auth.admin.createUser({
      email: def.email,
      email_confirm: true,
      password: 'Secret1234!',
      user_metadata: { full_name: def.name },
    })
    if (error) { console.error('User error:', def.email, error.message); continue }
    users.push({ ...def, id: data.user.id })
    console.log('Created user:', def.email, data.user.id)
  }
  return users
}

// daysAgo > 1 → expired (expires_at in past). Reactions: [meeToo, wild, doubtful]
const SECRET_DEFS = [
  { text: 'Jeg sa opp jobben uten å fortelle familien. De tror jeg fremdeles jobber der.', mood: 'shame',   daysAgo: 2.1, userIdx: 0, reactions: [12, 3, 5] },
  { text: 'Bestod endelig legge-eksamen etter fire forsøk. Ingen vet om de andre.', mood: 'pride',          daysAgo: 0.3, userIdx: 1, reactions: [34, 8, 2] },
  { text: 'Jeg er hemmelig glad for at prosjektet kollegaen min var så stolt av, feilet.', mood: 'other',   daysAgo: 0.8, userIdx: 2, reactions: [7, 21, 14] },
  { text: 'Spiste kjæresten til kollegaen sin mat fra kjøleskapet på jobb. Hver dag i en måned.', mood: 'shame', daysAgo: 0.5, userIdx: null, reactions: [3, 42, 18] },
  { text: 'Tenker fortsatt på eks-en min to år etter at vi gikk fra hverandre. Savner henne.', mood: 'longing', daysAgo: 0.2, userIdx: 3, reactions: [56, 4, 3] },
  { text: 'Skrur av kameraet på Teams-møter og spiller Spider Solitaire. Hver eneste gang.', mood: 'other', daysAgo: 1.2, userIdx: 4, reactions: [89, 6, 9] },
  { text: 'Fikk blomster fra en anonym beundrer på jobb. Fortalte alle det var fra kjæresten.', mood: 'pride', daysAgo: 0.6, userIdx: 0, reactions: [11, 7, 22] },
  { text: 'Har ikke lest bøkene vi diskuterer i bokklubben på over ett år. Bruker bare AI.', mood: 'shame', daysAgo: 0.4, userIdx: 1, reactions: [71, 5, 1] },
  { text: 'Gråt på toalettet etter et møte i dag. Alle trodde jeg var i godt humør.', mood: 'other',        daysAgo: 0.1, userIdx: null, reactions: [44, 2, 6] },
  { text: 'Angrer dypt på at jeg ikke studerte medisin. Nå er jeg sivilingeniør og ulykkelig.', mood: 'regret', daysAgo: 0.7, userIdx: 2, reactions: [33, 3, 11] },
  { text: 'Fikk jobbtilbud fra konkurrenten til sjefen min. Vurderer det seriøst.', mood: 'fear',           daysAgo: 0.5, userIdx: 3, reactions: [18, 14, 2] },
  { text: 'Bestemor kjøpte en pelskåpe til 300 kr på loppemarked. Den er ekte og verdt 30.000.', mood: 'joy', daysAgo: 1.6, userIdx: 4, reactions: [5, 66, 8] },
  { text: 'Kollegaen min tar æren for arbeidet mitt foran sjefen. Har skjedd fem ganger i år.', mood: 'anger', daysAgo: 0.2, userIdx: 5, reactions: [48, 9, 3] },
  { text: 'Takket nei til venner fem helger på rad og satt alene hjemme. Det var fantastisk.', mood: 'relief', daysAgo: 0.4, userIdx: null, reactions: [62, 4, 7] },
  { text: 'Later som om jeg elsker hunden til samboeren min. Hater egentlig hunder.', mood: 'other',        daysAgo: 0.9, userIdx: 0, reactions: [9, 11, 34] },
  { text: 'Dro på jobbseminar i Bergen. Brukte halvparten av dagene på fjelltur i stedet.', mood: 'joy',    daysAgo: 2.0, userIdx: 1, reactions: [77, 13, 4] },
  { text: 'Ingen på jobb vet at jeg er kjæreste med en av direktørene.', mood: 'fear',                      daysAgo: 0.3, userIdx: null, reactions: [40, 28, 6] },
  { text: 'Legen sa jeg måtte slutte med kaffe. Drikker fremdeles fem kopper om dagen.', mood: 'shame',     daysAgo: 0.6, userIdx: 2, reactions: [93, 2, 1] },
  { text: 'Håper innerst inne at eks-en min ser at det går bra med meg nå.', mood: 'longing',               daysAgo: 0.5, userIdx: 3, reactions: [29, 3, 8] },
  { text: 'Fikk endelig sagt til moren min at jeg elsker henne. Hadde ikke gjort det på ti år.', mood: 'relief', daysAgo: 0.05, userIdx: 4, reactions: [118, 7, 2] },
]

async function createSecrets(users) {
  const secretIds = []
  for (const def of SECRET_DEFS) {
    const createdAt = daysAgo(def.daysAgo)
    // expires 24h after creation
    const expiresAt = new Date(new Date(createdAt).getTime() + 86_400_000).toISOString()
    const userId = def.userIdx !== null ? users[def.userIdx]?.id ?? null : null

    const { data, error } = await db.from('secrets').insert({
      text: def.text,
      mood: def.mood,
      created_at: createdAt,
      expires_at: expiresAt,
      user_id: userId,
      reaction_me_too: def.reactions[0],
      reaction_wild: def.reactions[1],
      reaction_doubtful: def.reactions[2],
    }).select('id').single()

    if (error) { console.error('Secret error:', error.message); secretIds.push(null); continue }
    secretIds.push(data.id)
    console.log('Created secret:', def.text.slice(0, 50), '...')
  }
  return secretIds
}

const WHISPER_DEFS = [
  { fromIdx: 1, toIdx: 0, secretIdx: 1, text: 'Gratulerer! Fire forsøk viser bare at du aldri ga opp.', readAt: daysAgo(0.1) },
  { fromIdx: 2, toIdx: 0, secretIdx: 6, text: 'Haha, jeg ville gjort det samme! Du er ikke alene.', readAt: daysAgo(0.05) },
  { fromIdx: 3, toIdx: 1, secretIdx: 7, text: 'Haha, er du i bokklubben min? Vi har visst samme metode.', readAt: null },
  { fromIdx: 4, toIdx: 2, secretIdx: 9, text: 'Jeg angrer også. Ble økonom. Drømte om å bli lege.', readAt: null },
  { fromIdx: 5, toIdx: 3, secretIdx: 4, text: 'Noen ganger holder minnene lenger enn selve forholdet.', readAt: daysAgo(0.08) },
  { fromIdx: 0, toIdx: 5, secretIdx: 12, text: 'Dokumenter alt og ta det opp med HR. Du fortjener æren.', readAt: null },
  { fromIdx: 1, toIdx: 4, secretIdx: 19, text: 'Dette fikk meg til å ringe mamma med én gang. Takk.', readAt: daysAgo(0.02) },
  { fromIdx: 3, toIdx: 2, secretIdx: 10, text: 'Ta imot tilbudet! Lojalitet lønner seg ikke alltid.', readAt: null },
  { fromIdx: 2, toIdx: 5, secretIdx: 12, text: 'Har sett det skje. Du burde si ifra direkte til sjefen.', readAt: daysAgo(0.15) },
  { fromIdx: 4, toIdx: 3, secretIdx: 18, text: 'Jeg savner eks-en min også. Kanskje vi bør ta en kaffe?', readAt: null },
]

async function createWhispers(users, secretIds) {
  for (const def of WHISPER_DEFS) {
    const sender = users[def.fromIdx]
    const receiver = users[def.toIdx]
    const secretId = secretIds[def.secretIdx]
    if (!sender || !receiver || !secretId) { console.warn('Skipping whisper, missing data'); continue }

    const { error } = await db.from('whispers').insert({
      secret_id: secretId,
      sender_id: sender.id,
      receiver_id: receiver.id,
      text: def.text,
      read_at: def.readAt,
    })
    if (error) { console.error('Whisper error:', error.message); continue }
    console.log('Created whisper:', sender.email, '→', receiver.email)
  }
}

async function main() {
  console.log('\n=== Clearing database ===')
  await clearAll()

  console.log('\n=== Creating users ===')
  const users = await createUsers()

  console.log('\n=== Creating secrets ===')
  const secretIds = await createSecrets(users)

  console.log('\n=== Creating whispers ===')
  await createWhispers(users, secretIds)

  console.log('\n=== Done! ===')
  console.log(`Users: ${users.length}, Secrets: ${secretIds.filter(Boolean).length}, Whispers: ${WHISPER_DEFS.length}`)
}

main().catch(console.error)
