const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Module = require('module')
const React = require('react')
const renderer = require('react-test-renderer')
const { transformSync } = require('@babel/core')

const filename = path.resolve(__dirname, '../index.js')
const code = transformSync(fs.readFileSync(filename, 'utf8'), {
  filename,
  configFile: false,
  babelrc: false,
  plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs']
}).code

function loadCheckbox (platform) {
  const component = new Module(filename, module)
  component.filename = filename
  component.paths = module.paths
  const native = {
    TouchableOpacity: 'TouchableOpacity',
    TouchableNativeFeedback: 'TouchableNativeFeedback',
    TouchableWithoutFeedback: 'TouchableWithoutFeedback',
    View: 'View',
    Text: 'Text',
    Image: 'Image',
    Platform: { OS: platform },
    StyleSheet: { create: styles => styles }
  }
  component.require = id => {
    if (id === 'react-native') return native
    if (id === './checked.png') return 1
    if (id === './unchecked.png') return 2
    return require(id)
  }
  component._compile(code, filename)
  return component.exports.default
}

for (const platform of ['ios', 'android']) {
  const Checkbox = loadCheckbox(platform)
  const touchable = platform === 'ios' ? 'TouchableOpacity' : 'TouchableNativeFeedback'
  const events = []
  let tree
  const render = props => React.createElement(Checkbox, { label: 'Choice', onChange: event => events.push(event), ...props })
  renderer.act(() => { tree = renderer.create(render({})) })
  assert.strictEqual(tree.root.findByType('Image').props.source, 2)
  renderer.act(() => { tree.root.findByType(touchable).props.onPress() })
  assert.deepStrictEqual(events, [{ label: 'Choice', checked: true }])
  // Keep the existing prop synchronization behavior: parent checked is authoritative after an update.
  assert.strictEqual(tree.root.findByType('Image').props.source, 2)
  renderer.act(() => { tree.update(render({ checked: true })) })
  assert.strictEqual(tree.root.findByType('Image').props.source, 1)
  renderer.act(() => { tree.root.findByType(touchable).props.onPress() })
  assert.deepStrictEqual(events[1], { label: 'Choice', checked: false })
  const checkedImage = { uri: 'https://example.com/checked.png' }
  const uncheckedImage = [{ uri: 'https://example.com/unchecked.png' }]
  const checkboxStyle = [{ opacity: 0.5 }, null]
  renderer.act(() => { tree.update(render({ checked: true, checkedImage, uncheckedImage, checkboxStyle, disabled: true })) })
  assert.strictEqual(tree.root.findByType('Image').props.source, checkedImage)
  assert.strictEqual(tree.root.findByType('Image').props.style[1], checkboxStyle)
  assert.strictEqual(tree.root.findByType(touchable).props.disabled, true)
  renderer.act(() => { tree.update(render({ checked: false, checkedImage, uncheckedImage, noFeedback: true, disabled: true })) })
  assert.strictEqual(tree.root.findByType('Image').props.source, uncheckedImage)
  assert.strictEqual(tree.root.findByType('TouchableWithoutFeedback').props.disabled, true)
  const customLabel = React.createElement('CustomLabel')
  const checkedComponent = React.createElement('Checked')
  const uncheckedComponent = React.createElement('Unchecked')
  renderer.act(() => { tree.update(render({ checked: true, customLabel, checkedComponent, uncheckedComponent, labelBefore: true })) })
  assert.strictEqual(tree.root.findAllByType('Image').length, 0)
  assert.strictEqual(tree.root.findAllByType('Checked').length, 1)
  assert.strictEqual(tree.root.findAllByType('CustomLabel').length, 1)
  const view = tree.root.findByType('View')
  assert.strictEqual(view.children[0].findByType('CustomLabel').type, 'CustomLabel')
  renderer.act(() => { tree.update(render({ checked: false, checkedComponent, uncheckedComponent, numberOfLabelLines: 3, labelBefore: false })) })
  assert.strictEqual(tree.root.findAllByType('Unchecked').length, 1)
  assert.strictEqual(tree.root.findByType('Text').props.numberOfLines, 3)
  renderer.act(() => { tree.unmount() })
}
console.log('Runtime regressions passed for iOS/Android host mocks; no native simulator is used')
