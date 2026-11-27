import { useCallback, useEffect, useState } from 'react'

/**
 * Countdown timer hook for rate-limited or temporarily unavailable SEFAZ retries.
 */
export const useRetryCountdown = () => {
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [runId, setRunId] = useState(0)

  const isCountingDown = remainingSeconds > 0

  const start = useCallback((seconds: number) => {
    const normalized =
      Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0
    setRemainingSeconds(normalized)
    setRunId((prev) => prev + 1)
  }, [])

  const reset = useCallback(() => {
    setRemainingSeconds(0)
    setRunId((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!isCountingDown) {
      return
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isCountingDown, runId])

  return {
    remainingSeconds,
    isCountingDown,
    start,
    reset,
  }
}
