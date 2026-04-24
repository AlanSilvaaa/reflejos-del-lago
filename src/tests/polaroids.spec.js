/* eslint-disable */
import { infiniteModeText, noMovementModeText, normalModeText } from '@/data/polaroids'
import { describe, expect, it } from 'vitest'

describe('polaroid game modes', () => {
  it('export the expected card structure', () => {
    ;[normalModeText, noMovementModeText, infiniteModeText].forEach(mode => {
      expect(mode).toHaveProperty('front')
      expect(mode).toHaveProperty('back')
      expect(mode.front).toHaveProperty('title')
      expect(mode.back).toHaveProperty('description')
      expect(Array.isArray(mode.back.rules)).toBe(true)
    })
  })
})
