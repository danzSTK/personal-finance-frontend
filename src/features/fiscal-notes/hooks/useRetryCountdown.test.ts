import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRetryCountdown } from './useRetryCountdown'

describe('useRetryCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('decrementa segundo a segundo até zerar e limpa intervalo no reset', () => {
    const { result, unmount } = renderHook(() => useRetryCountdown())

    expect(result.current.remainingSeconds).toBe(0)
    expect(result.current.isCountingDown).toBe(false)

    act(() => {
      result.current.start(3)
    })

    expect(result.current.remainingSeconds).toBe(3)
    expect(result.current.isCountingDown).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.remainingSeconds).toBe(2)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.remainingSeconds).toBe(0)
    expect(result.current.isCountingDown).toBe(false)

    act(() => {
      result.current.start(5)
    })
    expect(result.current.remainingSeconds).toBe(5)
    expect(result.current.isCountingDown).toBe(true)

    act(() => {
      result.current.reset()
    })
    expect(result.current.remainingSeconds).toBe(0)
    expect(result.current.isCountingDown).toBe(false)

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.remainingSeconds).toBe(0)

    unmount()
  })
})
