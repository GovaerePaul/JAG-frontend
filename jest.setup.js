import '@testing-library/jest-dom'

// Polyfill fetch and Response for Firebase tests
global.fetch = jest.fn()
global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
  }
  json() { return Promise.resolve(this.body) }
  text() { return Promise.resolve(this.body) }
}
global.Headers = class Headers {
  constructor(init) {
    this.map = new Map()
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.map.set(key.toLowerCase(), value)
      })
    }
  }
  get(name) { return this.map.get(name.toLowerCase()) }
  set(name, value) { this.map.set(name.toLowerCase(), value) }
  has(name) { return this.map.has(name.toLowerCase()) }
}

// Mock Firebase - will be handled in individual test files

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock next-intl with actual translations
const frMessages = require('./src/i18n/messages/fr.json')

jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => {
    let value = frMessages
    if (namespace) {
      value = value[namespace]
    }
    const keys = key.split('.')
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key
      }
    }
    return value || key
  },
  useLocale: () => 'fr',
}))

// Mock @/i18n/navigation - will be handled in individual test files

// Global test setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
