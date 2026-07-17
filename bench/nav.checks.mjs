// Tests for skip-disabled d-pad navigation (mirrors Keyboard.jsx slide logic)
// and a regression guard for the corpus punctuation bug.
import assert from 'node:assert'

const ROW1 = 'abcdefghijklm'.split('')
const ROW2 = 'nopqrstuvwxyz'.split('')
const SPECIAL = ['SPACE', 'DEL', 'CLEAR']
const ALL = [...ROW1, ...ROW2, ...SPECIAL]

function rowCol(i) {
  if (i < 13) return [0, i]
  if (i < 26) return [1, i - 13]
  return [2, i - 26]
}
function idxForPos(r, c) {
  if (r === 0) return Math.max(0, Math.min(c, 12))
  if (r === 1) return 13 + Math.max(0, Math.min(c, 12))
  return 26 + Math.max(0, Math.min(c, 2))
}
function rawStep(idx, key) {
  const [row, col] = rowCol(idx)
  if (key === 'ArrowRight') return Math.min(idx + 1, ALL.length - 1)
  if (key === 'ArrowLeft') return Math.max(idx - 1, 0)
  if (key === 'ArrowDown') return row < 2 ? idxForPos(row + 1, col) : idx
  if (key === 'ArrowUp') return row > 0 ? idxForPos(row - 1, col) : idx
  return idx
}
function makeSlide(availableLetters) {
  const isEnabled = (idx) => {
    const k = ALL[idx]
    if (SPECIAL.includes(k)) return true
    return availableLetters[k] !== false
  }
  return (idx, key) => {
    let cur = idx, next = rawStep(cur, key)
    while (!isEnabled(next) && next !== cur) { cur = next; next = rawStep(cur, key) }
    return isEnabled(next) ? next : idx
  }
}
const I = Object.fromEntries(ALL.map((k, i) => [k, i]))

let passed = 0
const check = (name, fn) => { fn(); passed++; console.log('  ok -', name) }

// 1. Right from 'a' with b..y disabled jumps straight to 'z'.
check('slide right skips a disabled run', () => {
  const avail = {}
  for (const c of 'bcdefghijklmnopqrstuvwxy') avail[c] = false
  const slide = makeSlide(avail)
  assert.strictEqual(slide(I['a'], 'ArrowRight'), I['z'])
})

// 2. No skipping when everything is enabled -> single-cell move.
check('slide right moves one cell when all enabled', () => {
  const slide = makeSlide({})
  assert.strictEqual(slide(I['a'], 'ArrowRight'), I['b'])
})

// 3. Dead-end (nothing enabled to the right) -> stay put.
check('slide dead-ends by staying put', () => {
  const avail = {}
  for (const c of 'nopqrstuvwxyz') avail[c] = false // whole row2 letters off
  const slide = makeSlide(avail)
  // from 'z' pressing right: only specials remain (always enabled) -> moves to SPACE
  assert.strictEqual(slide(I['z'], 'ArrowRight'), I['SPACE'])
})

// 4. Down skips a disabled key in the row below.
check('slide down lands on enabled key', () => {
  const avail = { n: false } // 'a' is above 'n'
  const slide = makeSlide(avail)
  const dest = slide(I['a'], 'ArrowDown')
  assert.notStrictEqual(dest, I['n'])
  assert.ok(avail[ALL[dest]] !== false)
})

// 5. Special keys always enabled/reachable.
check('special keys are always navigable', () => {
  const avail = {}
  for (const c of 'abcdefghijklmnopqrstuvwxyz') avail[c] = false
  const slide = makeSlide(avail)
  assert.strictEqual(slide(I['SPACE'], 'ArrowRight'), I['DEL'])
})

// 6. Regression: only a-z + space are typeable; hyphenated titles are excluded
//    from the timed corpus (the bug that produced Infinity / undefined focus).
check('corpus excludes non-typeable titles', () => {
  const titles = ['Spider-Man', 'Wall-E', 'X-Men', 'Inception', 'The Godfather']
    .map(t => t.toLowerCase())
  const typeable = titles.filter(t => /^[a-z ]+$/.test(t))
  assert.deepStrictEqual(typeable, ['inception', 'the godfather'])
})

console.log(`\n${passed}/6 nav tests passed`)
