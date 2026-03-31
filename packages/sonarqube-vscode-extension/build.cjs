const esbuild = require('esbuild')
const path = require('path')
const fs = require('fs')

// Plugin to strip shebang lines from source files before bundling
const stripShebangPlugin = {
  name: 'strip-shebang',
  setup(build) {
    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      const source = await fs.promises.readFile(args.path, 'utf8')
      if (source.startsWith('#!')) {
        return {
          contents: source.replace(/^#!.*\n/, ''),
          loader: 'ts',
        }
      }
      return undefined
    })
  },
}

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
    plugins: [stripShebangPlugin],
  })

  console.log('Build complete: dist/extension.js + dist/server.js')
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
