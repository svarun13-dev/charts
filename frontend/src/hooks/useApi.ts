import { useState, useEffect, useCallback } from 'react'

interface UseApiOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseApiReturn<T> {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | undefined>(options.initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      setData(result)
      options.onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [apiCall])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

export function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return

    const id = setInterval(callback, delay)
    return () => clearInterval(id)
  }, [callback, delay])
}
