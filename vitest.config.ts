import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
    test: {
        watch: false,
        globals: true,
        coverage: {
            enabled: true,
            reporter: ['text', 'html', 'lcovonly'],
            reportsDirectory: './dist/coverage',
        },
    },
}));
