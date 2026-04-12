import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
    ...nextVitals,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'node_modules/**']),
    {
        rules: {
            '@next/next/no-img-element': 'off',
        },
    },
]);

export default eslintConfig;
