import { test } from 'node:test'
import assert from 'node:assert/strict'
import { weightGenres, weightAlbums } from '../scripts/lib/genres.js'

test('weights genres by artist rank, highest first', () => {
  const artists = [
    { rank: 1, genres: ['indie', 'rock'] },
    { rank: 2, genres: ['indie', 'pop'] },
    { rank: 3, genres: ['rock'] },
  ]
  const out = weightGenres(artists)
  // indie: 50+49=99, rock: 50+48=98, pop: 49
  assert.equal(out[0].genre, 'indie')
  assert.equal(out[1].genre, 'rock')
  assert.equal(out[2].genre, 'pop')
})

test('weights are fractions that sum to ~1 when nothing is truncated', () => {
  const artists = [
    { rank: 1, genres: ['a'] },
    { rank: 2, genres: ['b'] },
  ]
  const out = weightGenres(artists)
  const sum = out.reduce((s, g) => s + g.weight, 0)
  assert.ok(Math.abs(sum - 1) < 1e-9)
})

test('handles empty and missing input', () => {
  assert.deepEqual(weightGenres([]), [])
  assert.deepEqual(weightGenres(undefined), [])
  assert.deepEqual(weightGenres([{ rank: 1 }]), [])
})

test('respects the limit', () => {
  const artists = [{ rank: 1, genres: ['a', 'b', 'c', 'd', 'e'] }]
  assert.equal(weightGenres(artists, 3).length, 3)
})

test('weightAlbums aggregates tracks by album, highest first', () => {
  const tracks = [
    { rank: 1, album: 'Blonde', artists: ['Frank Ocean'], image: 'cover-blonde' },
    { rank: 2, album: 'Blonde', artists: ['Frank Ocean'] },
    { rank: 3, album: 'Currents', artists: ['Tame Impala'] },
  ]
  const out = weightAlbums(tracks)
  assert.equal(out[0].album, 'Blonde')
  assert.equal(out[0].artist, 'Frank Ocean')
  assert.equal(out[0].image, 'cover-blonde')
  assert.equal(out[1].album, 'Currents')
  const sum = out.reduce((s, a) => s + a.weight, 0)
  assert.ok(Math.abs(sum - 1) < 1e-9)
})

test('weightAlbums handles empty input', () => {
  assert.deepEqual(weightAlbums([]), [])
  assert.deepEqual(weightAlbums(undefined), [])
})
