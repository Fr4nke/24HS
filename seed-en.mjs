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

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

const inHours = h => new Date(Date.now() + h * 3_600_000).toISOString()
const agoHours = h => new Date(Date.now() - h * 3_600_000).toISOString()

const SECRETS = [
  { text: "I've been pretending to be busy at work for six months. I finish everything by 10am and spend the rest watching YouTube.", mood: 'other', reactions: [74, 18, 9], hoursAgo: 3, expiresIn: 21 },
  { text: "I told everyone I quit drinking for health reasons. The truth is I just couldn't afford it anymore after losing half my savings.", mood: 'shame', reactions: [52, 4, 7], hoursAgo: 7, expiresIn: 17 },
  { text: "I found a wallet with $400 in it last week. I kept the money and mailed the wallet back with the cards. Still not sure if that makes me a good or bad person.", mood: 'other', reactions: [31, 44, 38], hoursAgo: 1, expiresIn: 23 },
  { text: "My best friend got the job I wanted. I congratulated her with a huge smile while crying in the car on the way home.", mood: 'regret', reactions: [88, 6, 3], hoursAgo: 5, expiresIn: 19 },
  { text: "I've been secretly applying to jobs in another country for months. My partner has no idea we might be moving.", mood: 'fear', reactions: [19, 37, 12], hoursAgo: 2, expiresIn: 22 },
  { text: "Finally paid off my student loans after 11 years. Cried in the bank parking lot for 20 minutes. Best cry of my life.", mood: 'relief', reactions: [142, 8, 1], hoursAgo: 9, expiresIn: 15 },
  { text: "I ghosted someone I genuinely liked because I was scared they actually liked me back. I think about it every day.", mood: 'regret', reactions: [67, 5, 14], hoursAgo: 4, expiresIn: 20 },
  { text: "I've been telling people I run marathons. I've never run more than 2 miles without stopping.", mood: 'shame', reactions: [39, 22, 31], hoursAgo: 6, expiresIn: 18 },
  { text: "My boss thinks I have a chronic illness as an excuse for working from home. I'm perfectly healthy — I just hate the office.", mood: 'other', reactions: [56, 14, 27], hoursAgo: 8, expiresIn: 16 },
  { text: "I adopted a dog impulsively during a depressive episode. The dog literally saved my life. Best impulsive decision I ever made.", mood: 'joy', reactions: [203, 11, 2], hoursAgo: 2, expiresIn: 22 },
  { text: "I've been in love with my coworker for two years. They got engaged last month. I smiled at the announcement and then went to the bathroom to breathe.", mood: 'longing', reactions: [94, 4, 6], hoursAgo: 11, expiresIn: 13 },
  { text: "I let my younger sibling take the blame for something I broke when we were kids. They brought it up at Christmas dinner last year. I still haven't confessed.", mood: 'shame', reactions: [33, 19, 22], hoursAgo: 3, expiresIn: 21 },
  { text: "I got a promotion by solving a problem that I accidentally caused in the first place. Nobody ever figured it out.", mood: 'pride', reactions: [29, 61, 18], hoursAgo: 5, expiresIn: 19 },
  { text: "I've been secretly going to therapy for a year. My family would be devastated if they knew — they think therapy is for weak people.", mood: 'fear', reactions: [77, 3, 4], hoursAgo: 13, expiresIn: 11 },
  { text: "Quit social media 8 months ago and told people it was for my mental health. Honestly I just couldn't handle seeing how happy everyone else looked.", mood: 'relief', reactions: [48, 7, 5], hoursAgo: 6, expiresIn: 18 },
  { text: "I haven't told my parents that I dropped out of my master's program. They're so proud. It's been four months.", mood: 'fear', reactions: [61, 8, 17], hoursAgo: 1, expiresIn: 23 },
  { text: "I write anonymous compliments and leave them on strangers' cars. It started after a really dark period and now it's the best part of my week.", mood: 'joy', reactions: [189, 9, 1], hoursAgo: 4, expiresIn: 20 },
  { text: "My ex reached out after 3 years. I typed and deleted a response 14 times over two days. I still haven't replied.", mood: 'longing', reactions: [83, 12, 9], hoursAgo: 8, expiresIn: 16 },
  { text: "I took credit for a colleague's idea in a meeting. They were too quiet to speak up. I got praised by the entire leadership team. I feel sick about it.", mood: 'shame', reactions: [44, 16, 53], hoursAgo: 2, expiresIn: 22 },
  { text: "I've been wearing the same lucky hoodie to every important event for 6 years. Job interviews, dates, exams. It has a 100% success rate. I'm terrified it'll get lost.", mood: 'other', reactions: [117, 31, 4], hoursAgo: 10, expiresIn: 14 },
]

async function main() {
  console.log('Inserting 20 English secrets...\n')
  let ok = 0
  for (const s of SECRETS) {
    const { error } = await db.from('secrets').insert({
      text: s.text,
      mood: s.mood,
      created_at: agoHours(s.hoursAgo),
      expires_at: inHours(s.expiresIn),
      user_id: null,
      reaction_me_too: s.reactions[0],
      reaction_wild: s.reactions[1],
      reaction_doubtful: s.reactions[2],
      is_synthetic: true,
    })
    if (error) { console.error('Error:', error.message); continue }
    console.log(`✓ [${s.mood}] ${s.text.slice(0, 60)}...`)
    ok++
  }
  console.log(`\nDone — ${ok}/20 inserted.`)
}

main().catch(console.error)
