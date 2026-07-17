import { useState, useEffect, useCallback } from 'react'
import { isKeyDisabled } from './keyboardLogic'

const ROW1 = 'abcdefghijklm'.split('')
const ROW2 = 'nopqrstuvwxyz'.split('')
const SPECIAL_KEYS = ['SPACE', 'DEL', 'CLEAR']
const ALL_KEYS = [...ROW1, ...ROW2, ...SPECIAL_KEYS]

export default function Keyboard({ availableLetters, onKeyPress, disabled }) {
  const [focusIndex, setFocusIndex] = useState(0)

  const getRowForIndex = (idx) => {
    if (idx < ROW1.length) return { row: 0, col: idx }
    if (idx < ROW1.length + ROW2.length) return { row: 1, col: idx - ROW1.length }
    return { row: 2, col: idx - ROW1.length - ROW2.length }
  }

  const getIndexForPos = (row, col) => {
    if (row === 0) return Math.max(0, Math.min(col, ROW1.length - 1))
    if (row === 1) return ROW1.length + Math.max(0, Math.min(col, ROW2.length - 1))
    return ROW1.length + ROW2.length + Math.max(0, Math.min(col, SPECIAL_KEYS.length - 1))
  }

  // A key is navigable if it's a special key or an available letter.
  // Disabled (dead-end) letters are skipped over during d-pad navigation.
  const isEnabled = (idx) => !isKeyDisabled(ALL_KEYS[idx], availableLetters)

  // Single-cell move in a direction, matching the grid layout.
  const rawStep = (idx, key) => {
    const { row, col } = getRowForIndex(idx)
    switch (key) {
      case 'ArrowRight': return Math.min(idx + 1, ALL_KEYS.length - 1)
      case 'ArrowLeft':  return Math.max(idx - 1, 0)
      case 'ArrowDown':  return row < 2 ? getIndexForPos(row + 1, col) : idx
      case 'ArrowUp':    return row > 0 ? getIndexForPos(row - 1, col) : idx
      default:           return idx
    }
  }

  // Keep stepping in the same direction until landing on an enabled key.
  // If the direction dead-ends into only-disabled keys, stay put.
  const slide = (idx, key) => {
    let cur = idx
    let next = rawStep(cur, key)
    while (!isEnabled(next) && next !== cur) {
      cur = next
      next = rawStep(cur, key)
    }
    return isEnabled(next) ? next : idx
  }

  const handleArrowNav = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleKeyClick(ALL_KEYS[focusIndex])
      return
    }
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault()
      setFocusIndex(slide(focusIndex, e.key))
    }
  }, [focusIndex, availableLetters])

  useEffect(() => {
    window.addEventListener('keydown', handleArrowNav)
    return () => window.removeEventListener('keydown', handleArrowNav)
  }, [handleArrowNav])

  // If the focused key gets disabled (availability changed after a keystroke),
  // slide focus to the nearest enabled key so the cursor never rests on a dead-end.
  useEffect(() => {
    if (!isEnabled(focusIndex)) {
      const right = slide(focusIndex, 'ArrowRight')
      setFocusIndex(right !== focusIndex ? right : slide(focusIndex, 'ArrowLeft'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableLetters])

  const handleKeyClick = (key) => {
    if (disabled) return
    if (key === 'SPACE') {
      onKeyPress(' ')
    } else if (key === 'DEL') {
      onKeyPress('DEL')
    } else if (key === 'CLEAR') {
      onKeyPress('CLEAR')
    } else {
      if (isKeyDisabled(key, availableLetters)) return
      onKeyPress(key)
    }
  }

  const renderKey = (key, index) => {
    const isDisabled = isKeyDisabled(key, availableLetters)
    const isFocused = index === focusIndex
    const isSpecial = SPECIAL_KEYS.includes(key)

    return (
      <button
        key={key}
        onClick={() => handleKeyClick(key)}
        className={`
          flex items-center justify-center rounded-lg font-bold uppercase transition-all duration-150 select-none
          ${isSpecial ? 'px-5 py-3 text-sm' : 'w-12 h-12 text-lg'}
          ${isDisabled
            ? 'bg-slate-900 text-slate-700 cursor-not-allowed opacity-30'
            : 'bg-slate-800 text-white hover:bg-slate-700 cursor-pointer active:scale-95'
          }
          ${isFocused ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-950' : ''}
          ${key === 'DEL' ? 'bg-yellow-900/40 text-yellow-400' : ''}
          ${key === 'CLEAR' ? 'bg-red-900/40 text-red-400' : ''}
        `}
      >
        {key === 'DEL' ? '⌫' : key === 'SPACE' ? '␣' : key}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <div className="flex gap-1.5">
        {ROW1.map((k, i) => renderKey(k, i))}
      </div>
      <div className="flex gap-1.5">
        {ROW2.map((k, i) => renderKey(k, ROW1.length + i))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {SPECIAL_KEYS.map((k, i) => renderKey(k, ROW1.length + ROW2.length + i))}
      </div>
    </div>
  )
}
