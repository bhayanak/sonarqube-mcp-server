import { describe, it, expect, beforeEach } from 'vitest'
import { LRUCache } from '../src/api/cache.js'

describe('LRUCache', () => {
  let cache: LRUCache

  beforeEach(() => {
    cache = new LRUCache(3, 5000)
  })

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should return undefined for missing keys', () => {
    expect(cache.get('missing')).toBeUndefined()
  })

  it('should evict oldest entry when max size reached', () => {
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.set('d', 4) // evicts 'a'
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
    expect(cache.get('d')).toBe(4)
  })

  it('should expire entries after TTL', async () => {
    const shortCache = new LRUCache(10, 50)
    shortCache.set('key', 'value')
    expect(shortCache.get('key')).toBe('value')

    await new Promise((r) => setTimeout(r, 100))
    expect(shortCache.get('key')).toBeUndefined()
  })

  it('should refresh LRU order on get', () => {
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a') // refresh 'a'
    cache.set('d', 4) // evicts 'b' (oldest after 'a' was refreshed)
    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBeUndefined()
  })

  it('should clear all entries', () => {
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('a')).toBeUndefined()
  })
})
