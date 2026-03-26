import { useState, useEffect, useCallback } from 'react'

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

  const handleArrowNav = useCallback((e) => {
    const { row, col } = getRowForIndex(focusIndex)
    let newIndex = focusIndex

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        newIndex = Math.min(focusIndex + 1, ALL_KEYS.length - 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = Math.max(focusIndex - 1, 0)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (row < 2) newIndex = getIndexForPos(row + 1, col)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (row > 0) newIndex = getIndexForPos(row - 1, col)
        break
      case 'Enter':
        e.preventDefault()
        handleKeyClick(ALL_KEYS[focusIndex])
        return
    }
    setFocusIndex(newIndex)
  }, [focusIndex])

  useEffect(() => {
    window.addEventListener('keydown', handleArrowNav)
    return () => window.removeEventListener('keydown', handleArrowNav)
  }, [handleArrowNav])

  const handleKeyClick = (key) => {
    if (disabled) return
    if (key === 'SPACE') {
      onKeyPress(' ')
    } else if (key === 'DEL') {
      onKeyPress('DEL')
    } else if (key === 'CLEAR') {
      onKeyPress('CLEAR')
    } else {
      if (availableLetters[key] === false) return
      onKeyPress(key)
    }
  }

  const renderKey = (key, index) => {
    const isLetter = key.length === 1
    const isDisabled = isLetter && availableLetters[key] === false
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
