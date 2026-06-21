import nextJest from 'next/jest.js'

// Aponta para a raiz do projeto para o Jest ler o next.config.ts e ficheiros .env
const createJestConfig = nextJest({
    dir: './',
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: any = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.{js,ts}',
        '!src/app/layout.tsx',
    ],
}

// Exporta a configuração para o Next.js a processar
export default createJestConfig(config)