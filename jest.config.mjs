import nextJest from 'next/jest.js'

// next/jest wires up the Next.js compiler, so JSX, next/link, CSS modules and
// the "@/*" alias from jsconfig.json work inside tests without extra setup.
const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coverageProvider: 'v8'
}

export default createJestConfig(config)
