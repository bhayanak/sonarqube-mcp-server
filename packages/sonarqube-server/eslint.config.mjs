import tseslint from 'typescript-eslint'
import security from 'eslint-plugin-security'

export default tseslint.config(
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'security/detect-object-injection': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.*', '*.cjs'],
  },
)
