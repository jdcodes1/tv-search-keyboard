import { describe, it, expect } from 'vitest'
import {
  titleMatchesQuery,
  getEnabledLetters,
  isKeyDisabled,
} from './keyboardLogic.js'

const TITLES = ['Star Wars', 'Stranger Things', 'Toy Story', 'The Matrix']

describe('titleMatchesQuery', () => {
  it('matches at the start of the title', () => {
    expect(titleMatchesQuery('Star Wars', 'star')).toBe(true)
  })

  it('matches at a word boundary inside the title', () => {
    expect(titleMatchesQuery('Star Wars', 'war')).toBe(true)
    expect(titleMatchesQuery('The Matrix', 'mat')).toBe(true)
  })

  it('is case-insensitive and rejects non-matches / mid-word matches', () => {
    expect(titleMatchesQuery('Star Wars', 'STAR')).toBe(true)
    expect(titleMatchesQuery('Star Wars', 'tar')).toBe(false) // mid-word, not a boundary
    expect(titleMatchesQuery('Star Wars', 'zzz')).toBe(false)
  })

  it('treats an empty query as matching everything', () => {
    expect(titleMatchesQuery('Toy Story', '')).toBe(true)
  })
})

describe('getEnabledLetters', () => {
  it('enables every letter that begins a word in some title for an empty prefix', () => {
    const av = getEnabledLetters('', TITLES)
    expect(av.s).toBe(true) // Star / Stranger / Story
    expect(av.t).toBe(true) // Toy / The / Things
    expect(av.m).toBe(true) // Matrix (word boundary)
    expect(av.w).toBe(true) // Wars (word boundary)
    expect(av.z).toBe(false)
    expect(av.q).toBe(false)
  })

  it('computes the valid next letters for a non-empty prefix', () => {
    const av = getEnabledLetters('st', TITLES)
    expect(av.a).toBe(true) // "sta" -> Star Wars
    expect(av.r).toBe(true) // "str" -> Stranger Things
    expect(av.o).toBe(true) // "sto" -> Story (word boundary in Toy Story)
    expect(av.b).toBe(false)
    expect(av.z).toBe(false)
  })

  it('disables all letters when no title matches the prefix', () => {
    const av = getEnabledLetters('xyz', TITLES)
    expect(Object.values(av).every((enabled) => enabled === false)).toBe(true)
    expect(Object.keys(av)).toHaveLength(26)
  })

  it('is case-insensitive with respect to the prefix', () => {
    expect(getEnabledLetters('ST', TITLES)).toEqual(getEnabledLetters('st', TITLES))
  })
})

describe('isKeyDisabled', () => {
  it('disables a letter only when explicitly marked false', () => {
    expect(isKeyDisabled('a', { a: false })).toBe(true)
    expect(isKeyDisabled('a', { a: true })).toBe(false)
    expect(isKeyDisabled('a', {})).toBe(false) // unknown letter is enabled
  })

  it('never disables special multi-character keys', () => {
    expect(isKeyDisabled('SPACE', { SPACE: false })).toBe(false)
    expect(isKeyDisabled('DEL', {})).toBe(false)
  })
})
