import { useState, useEffect } from 'react'

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  checks: {
    database: boolean
    memory: boolean
    storage: boolean
  }
  version: string
  environment: string
}

interface PerformanceMemory {
  usedJSHeapSize: number
  jsHeapSizeLimit: number
  totalJSHeapSize: number
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks = {
    database: false,
    memory: false,
    storage: false,
  }

  try {
    const keys = await window.spark.kv.keys()
    checks.database = Array.isArray(keys)
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  try {
    const perf = performance as Performance & { memory?: PerformanceMemory }
    if (perf && perf.memory) {
      const memory = perf.memory
      const usedMemoryMB = memory.usedJSHeapSize / 1024 / 1024
      const totalMemoryMB = memory.jsHeapSizeLimit / 1024 / 1024
      checks.memory = usedMemoryMB / totalMemoryMB < 0.9
    } else {
      checks.memory = true
    }
  } catch (error) {
    console.error('Memory health check failed:', error)
    checks.memory = true
  }

  try {
    await window.spark.kv.set('health-check-test', Date.now())
    const testValue = await window.spark.kv.get('health-check-test')
    checks.storage = testValue !== undefined
    await window.spark.kv.delete('health-check-test')
  } catch (error) {
    console.error('Storage health check failed:', error)
  }

  const healthyCount = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.keys(checks).length

  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (healthyCount === totalChecks) {
    status = 'healthy'
  } else if (healthyCount > 0) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: performance.now(),
    checks,
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  }
}

export function useHealthCheck(intervalMs: number = 60000) {
  const [health, setHealth] = useState<HealthCheckResult | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      const result = await performHealthCheck()
      setHealth(result)
    }

    checkHealth()
    const interval = setInterval(checkHealth, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])

  return health
}
