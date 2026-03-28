const esbuild = require('esbuild')
const path = require('path')

async function build() {
  // 1. Bundle the extension entry point (CJS, external vscode)
  await esbuild.build({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    minify: false,
  })

  // 2. Bundle the MCP server entry point (CJS, fully self-contained)
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '..', 'sonarqube-server', 'src', 'index.ts')],
    bundle: true,
    outfile: 'dist/server.js',
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    minify: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  })

  console.log('Build complete: dist/extension.js + dist/server.js')
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
