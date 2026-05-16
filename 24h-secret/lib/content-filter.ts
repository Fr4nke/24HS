const PROFANITY = [
  // English
  'fuck', 'fucking', 'fucker', 'shit', 'shitting', 'bitch', 'bitches',
  'cunt', 'cock', 'dick', 'pussy', 'ass', 'asses', 'asshole',
  'bastard', 'whore', 'slut', 'faggot', 'nigger', 'nigga', 'retard',
  'motherfucker', 'bullshit',
  // Norwegian
  'faen', 'jævla', 'jævli', 'helvete', 'dritt', 'dritten',
  'pikk', 'fitte', 'kuk', 'hore', 'ræva', 'rasshøl', 'forbanna',
  'svartingen', 'neger',
]

function censorWord(match: string): string {
  if (match.length <= 2) return match[0] + '*'
  return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1]
}

export function filterProfanity(text: string): string {
  let result = text
  for (const word of PROFANITY) {
    // \b doesn't handle æøå well, so use lookahead/behind for word boundaries
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(?<![a-zA-ZæøåÆØÅ])${escaped}(?![a-zA-ZæøåÆØÅ])`, 'gi')
    result = result.replace(regex, censorWord)
  }
  return result
}

export function containsURL(text: string): boolean {
  // Match http(s):// links and bare domains like example.com or www.example.com
  return /https?:\/\/\S+/i.test(text) ||
    /www\.\S+\.\S+/i.test(text) ||
    /\b\S+\.(com|no|net|org|io|co|app|dev|me|ly|uk|de|fr|ru|cn|jp|xyz|link|site|web)(\/\S*)?(\s|$)/i.test(text)
}
