import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn((key: string, defaultValue: any) => {
    const [state, setState] = vi.fn(() => [defaultValue, vi.fn(), vi.fn()])()
    return [state, setState, vi.fn()]
  })
}))

global.window.spark = {
  llmPrompt: vi.fn((strings: string[], ...values: any[]) => {
    return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '')
  }) as any,
  llm: vi.fn(async (prompt: string) => 'Mock LLM response') as any,
  user: vi.fn(async () => ({
    login: 'testuser',
    email: 'test@example.com',
    avatarUrl: 'https://example.com/avatar.png',
    id: 123,
    isOwner: true
  })) as any,
  kv: {
    keys: vi.fn(async () => []),
    get: vi.fn(async () => undefined),
    set: vi.fn(async () => {}),
    delete: vi.fn(async () => {})
  } as any
} as any
