const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

// Does `title` match `query` at the start of the title or at any word boundary?
// Case-insensitive. This is the same matching rule the TMDB result filter uses.
export function titleMatchesQuery(title, query) {
  const t = title.toLowerCase()
  const q = query.toLowerCase()
  if (t.startsWith(q)) return true
  for (let i = 1; i < t.length; i++) {
    if (t[i - 1] === ' ' && t.substring(i).startsWith(q)) return true
  }
  return false
}

// Core keyboard algorithm: given the current search `prefix` and the set of known
// `titles`, return a map of which next letters should be ENABLED. A letter is
// enabled when appending it to the prefix still matches at least one title.
export function getEnabledLetters(prefix, titles, letters = ALPHABET) {
  const availability = {}
  for (const letter of letters) {
    availability[letter] = titles.some((title) =>
      titleMatchesQuery(title, prefix + letter)
    )
  }
  return availability
}

// A single-character (letter) key is disabled when the availability map has
// explicitly marked it false. Special keys (SPACE/DEL/CLEAR) are never disabled.
export function isKeyDisabled(key, availableLetters) {
  return key.length === 1 && availableLetters[key] === false
}
