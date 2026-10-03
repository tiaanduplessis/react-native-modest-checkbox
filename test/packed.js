const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const tar = require('tar')

const root = path.resolve(__dirname, '..')
const directory = fs.mkdtempSync(path.join(root, '.type-test-'))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const run = (args, cwd = directory) => execFileSync(npm, args, { cwd, encoding: 'utf8' })

try {
  const [packed] = JSON.parse(run(['pack', '--ignore-scripts', '--json', '--pack-destination', directory], root))
  for (const file of ['index.js', 'index.d.ts', '.d.ts', 'checked.png', 'unchecked.png']) {
    assert(packed.files.some(entry => entry.path === file), `Missing packed file: ${file}`)
  }
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ private: true }))
  const installed = path.join(directory, 'node_modules/react-native-modest-checkbox')
  fs.mkdirSync(installed, { recursive: true })
  tar.x({ file: path.join(directory, packed.filename), cwd: installed, strip: 1, sync: true })
  for (const file of ['index.js', 'index.d.ts', '.d.ts', 'checked.png', 'unchecked.png']) {
    assert.deepStrictEqual(fs.readFileSync(path.join(installed, file)), fs.readFileSync(path.join(root, file)))
  }
  const manifest = require(path.join(installed, 'package.json'))
  assert.strictEqual(manifest.types, 'index.d.ts')
  assert.strictEqual(manifest.main, 'index.js')
  fs.copyFileSync(path.join(__dirname, 'types.tsx'), path.join(directory, 'types.tsx'))
  fs.writeFileSync(path.join(directory, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      strict: true,
      noEmit: true,
      jsx: 'react',
      module: 'commonjs',
      moduleResolution: 'node',
      lib: ['es2020'],
      types: ['react', 'react-native'],
      skipLibCheck: false
    },
    files: ['types.tsx']
  }))
  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', directory], { stdio: 'inherit' })
  console.log('Packed consumer: declaration discovery, JSX, props, callback, styles and assets passed')
} finally {
  fs.rmSync(directory, { recursive: true, force: true })
}
