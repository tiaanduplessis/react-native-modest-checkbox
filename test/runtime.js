const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Module = require('module')
const React = require('react')
const PropTypes = require('prop-types')
const renderer = require('react-test-renderer')
const { transformSync } = require('@babel/core')

const filename = path.resolve(__dirname, '../index.js')
const code = transformSync(fs.readFileSync(filename, 'utf8'), {
  filename,
  configFile: false,
  babelrc: false,
  plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs']
}).code

function captureWarnings (run) {
  const original = console.error
  const warnings = []
  console.error = (...args) => warnings.push(args.join(' '))
  try {
    run()
  } finally {
    console.error = original
  }
  return warnings
}

function loadCheckbox (platform, registeredStyles) {
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
    // Older React Native versions returned numeric registered style IDs.
    StyleSheet: { create: styles => registeredStyles ? Object.fromEntries(Object.keys(styles).map((key, index) => [key, index + 1])) : styles }
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

for (const [platform, registeredStyles] of [['ios', false], ['android', false], ['ios', true], ['android', true]]) {
  let Checkbox
  assert.deepStrictEqual(captureWarnings(() => { Checkbox = loadCheckbox(platform, registeredStyles) }), [])
  const styleProps = ['checkboxStyle', 'containerStyle', 'labelStyle']
  const styleValues = [17, 0, false, null, undefined, { opacity: 0.5 }, [17, { opacity: 0.5 }, false, null, undefined, [{ opacity: 1 }]]]
  const rejectedStyles = []
  for (const name of styleProps) {
    for (const value of styleValues) {
      PropTypes.resetWarningCache()
      const warnings = captureWarnings(() => PropTypes.checkPropTypes({ [name]: Checkbox.propTypes[name] }, { [name]: value }, 'prop', 'Checkbox'))
      if (warnings.length) rejectedStyles.push({ name, value, warnings })
    }
    for (const value of [true, '', 'invalid', () => {}]) {
      PropTypes.resetWarningCache()
      const warnings = captureWarnings(() => PropTypes.checkPropTypes({ [name]: Checkbox.propTypes[name] }, { [name]: value }, 'prop', 'Checkbox'))
      assert.strictEqual(warnings.length, 1, `Expected ${name} to reject ${String(value)}`)
      assert(warnings[0].includes(`Invalid prop \`${name}\``))
    }
  }
  assert.deepStrictEqual(rejectedStyles, [], 'Valid React Native styles must not warn')
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
  for (const style of styleValues) {
    const warnings = captureWarnings(() => renderer.act(() => {
      tree.update(render({ checkboxStyle: style, containerStyle: style, labelStyle: style }))
    }))
    assert.deepStrictEqual(warnings, [])
    assert.strictEqual(tree.root.findByType(touchable).props.style[1], style)
    assert.strictEqual(tree.root.findAllByType('View')[0].props.style[1], style)
    assert.strictEqual(tree.root.findByType('Image').props.style[1], style)
    assert.strictEqual(tree.root.findByType('Text').props.style[1], style)
  }
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
console.log('Runtime and style PropTypes regressions passed for iOS/Android host mocks with object/registered styles; no native simulator is used')
