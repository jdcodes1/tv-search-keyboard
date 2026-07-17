// D-pad navigation benchmark: normal vs "better" (dead-end-disabling) TV keyboard.
// Replicates the exact grid + nav rules from src/Keyboard.jsx and availability from src/tmdb.js.

const MOCK_TITLES = [
  'Prison Break','Pride and Prejudice','Primer','Prince of Egypt','Private Ryan','Primal Fear','Pretty Woman','Predator',
  'Press Play','Prometheus','Pulp Fiction','Puzzle','Pacific Rim','Parasite','Passengers','Patton',
  'Blade Runner','Black Panther','Blue Velvet','Braveheart','Cast Away','Casablanca','Cars','Captain Marvel',
  'Dark Knight','Dune','Drive','Django Unchained','Eternal Sunshine','Everything Everywhere All at Once',
  'Fight Club','Frozen','Finding Nemo','Forrest Gump','Gladiator','Gravity','Gone Girl','Get Out',
  'Harry Potter','Her','Hugo','Heat','Inception','Interstellar','Iron Man','Inside Out',
  'Joker','Jaws','Jurassic Park','John Wick','Kill Bill','King Kong','Knives Out',
  'La La Land','Logan','Lord of the Rings','Life of Pi','Mad Max','Matrix','Moana','Moonlight',
  'Nightcrawler','No Country for Old Men','Nomadland','Oppenheimer','Once Upon a Time in Hollywood',
  'Ratatouille','Rocky','Rush Hour','Rear Window','Spirited Away','Star Wars','Spider-Man','Shrek',
  'Titanic','Top Gun','Toy Story','The Godfather','Up','Unbreakable','Us','Venom','Vertigo','V for Vendetta',
  'Wall-E','Whiplash','Wonder Woman','Wicked','X-Men','Yesterday','Zootopia','Zodiac',
]
const titles = MOCK_TITLES.map(t => t.toLowerCase())

// prefix-search availability (matches mockSearch: startsWith)
function availableLetters(prefix) {
  const avail = {}
  for (let c = 97; c <= 122; c++) {
    const L = String.fromCharCode(c)
    avail[L] = titles.some(t => t.startsWith(prefix + L))
  }
  return avail
}

// ---- grid layout (exact from Keyboard.jsx) ----
const ROW1 = 'abcdefghijklm'.split('')
const ROW2 = 'nopqrstuvwxyz'.split('')
const SPECIAL = ['SPACE','DEL','CLEAR']
const ALL = [...ROW1, ...ROW2, ...SPECIAL]

function rowCol(idx) {
  if (idx < ROW1.length) return [0, idx]
  if (idx < ROW1.length + ROW2.length) return [1, idx - ROW1.length]
  return [2, idx - ROW1.length - ROW2.length]
}
function idxForPos(row, col) {
  if (row === 0) return Math.max(0, Math.min(col, ROW1.length - 1))
  if (row === 1) return ROW1.length + Math.max(0, Math.min(col, ROW2.length - 1))
  return ROW1.length + ROW2.length + Math.max(0, Math.min(col, SPECIAL.length - 1))
}

// raw single-press transitions (exact from handleArrowNav)
function neighbors(idx) {
  const [row, col] = rowCol(idx)
  return {
    ArrowRight: Math.min(idx + 1, ALL.length - 1),
    ArrowLeft:  Math.max(idx - 1, 0),
    ArrowDown:  row < 2 ? idxForPos(row + 1, col) : idx,
    ArrowUp:    row > 0 ? idxForPos(row - 1, col) : idx,
  }
}

// BFS shortest press-count from -> to over a transition function
function moves(from, to, trans) {
  if (from === to) return 0
  const q = [[from, 0]]; const seen = new Set([from])
  while (q.length) {
    const [cur, d] = q.shift()
    for (const nxt of Object.values(trans(cur))) {
      if (nxt === to) return d + 1
      if (!seen.has(nxt)) { seen.add(nxt); q.push([nxt, d + 1]) }
    }
  }
  return Infinity
}

// skip-disabled transition: a press keeps going in that direction over disabled letters
// until it lands on an enabled key (letters may be disabled; specials always enabled).
function makeSkipTrans(enabledSet) {
  const enabled = (i) => i >= ALL.length - SPECIAL.length || enabledSet.has(ALL[i])
  return (idx) => {
    const n = neighbors(idx)
    const slide = (dir) => {
      let cur = idx, next = n[dir]
      // step repeatedly in same direction until enabled or no progress
      while (!enabled(next) && next !== cur) {
        cur = next
        next = neighbors(cur)[dir]
      }
      return enabled(next) ? next : idx // dead end -> stay
    }
    return {
      ArrowRight: slide('ArrowRight'),
      ArrowLeft:  slide('ArrowLeft'),
      ArrowDown:  slide('ArrowDown'),
      ArrowUp:    slide('ArrowUp'),
    }
  }
}

const KEY_INDEX = Object.fromEntries(ALL.map((k, i) => [k, i]))
function targetIndex(ch) { return ch === ' ' ? KEY_INDEX['SPACE'] : KEY_INDEX[ch] }

// cost to type a query. mode: 'normal' | 'asimpl' | 'skip'
// returns { presses } where presses = arrow moves + one select per char.
function typeCost(query, mode) {
  let cur = 0 // start focus at 'a'
  let presses = 0
  let prefix = ''
  for (const ch of query.toLowerCase()) {
    let trans = neighbors
    if (mode === 'skip') {
      const avail = availableLetters(prefix)
      const enabled = new Set(Object.keys(avail).filter(l => avail[l]))
      // the char we're about to type is always enabled by construction
      enabled.add(ch === ' ' ? null : ch)
      trans = makeSkipTrans(enabled)
    }
    const tgt = targetIndex(ch)
    presses += moves(cur, tgt, trans) + 1 // +1 select (Enter)
    cur = tgt
    prefix += ch
  }
  return presses
}

// Corpus: full-title searches a user would type on the demo.
// Keyboard only has a-z + SPACE, so restrict to titles typeable as-is
// (drops the 3 hyphenated titles: Spider-Man, Wall-E, X-Men).
// Availability still reflects the FULL movie set (that's what disables letters).
const CORPUS = MOCK_TITLES.map(t => t.toLowerCase()).filter(t => /^[a-z ]+$/.test(t))

function total(mode) { return CORPUS.reduce((s, q) => s + typeCost(q, mode), 0) }

const normal = total('normal')
const asimpl = total('asimpl')
const skip   = total('skip')

const pct = (a, b) => (((a - b) / a) * 100).toFixed(1)

console.log(`Corpus: ${CORPUS.length} full-title searches, cursor starts at 'a'\n`)
console.log(`Total d-pad presses (arrows + selects):`)
console.log(`  Normal keyboard (all letters):          ${normal}`)
console.log(`  Better, as implemented (no skip):       ${asimpl}   (${pct(normal, asimpl)}% fewer)`)
console.log(`  Better, skip-disabled (intended):       ${skip}   (${pct(normal, skip)}% fewer)`)
console.log(`\nPer-search average:`)
console.log(`  Normal: ${(normal / CORPUS.length).toFixed(1)}   as-impl: ${(asimpl / CORPUS.length).toFixed(1)}   skip: ${(skip / CORPUS.length).toFixed(1)}`)

// a few example queries
console.log(`\nExample queries (normal -> skip presses):`)
for (const q of ['inception','the godfather','oppenheimer','zootopia','everything everywhere all at once']) {
  console.log(`  ${q.padEnd(34)} ${String(typeCost(q,'normal')).padStart(4)} -> ${String(typeCost(q,'skip')).padStart(4)}  (${pct(typeCost(q,'normal'),typeCost(q,'skip'))}% fewer)`)
}
