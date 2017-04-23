import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native'

class CheckBox extends Component {
  state = {
    checked: false
  }

  componentDidMount () {
    this.setState({ checked: this.props.checked })
  }

  render () {
    return (
      <TouchableOpacity onPress={this._handleToggleChecked} underlayColor={this.props.underlayColor} style={styles.flexContainer}>
        <View style={this.props.containerStyle || styles.container}>
          {this.props.labelBefore ? <Label labelStyle={this.props.labelStyle} numberOfLabelLines={this.props.numberOfLabelLines} label={this.props.label} /> : null }

          {this.props.custom
            ? this.state.checked
              ? this.props.checkedComponent : this.props.uncheckedComponent
            : <Image style={this.props.checkBoxStyle || styles.checkbox} source={this.state.checked ? this.props.checkedImage : this.props.uncheckedImage} />
        }

          {this.props.labelBefore ? null : <Label labelStyle={this.props.labelStyle} numberOfLabelLines={this.props.numberOfLabelLines} label={this.props.label} /> }
        </View>
      </TouchableOpacity>
    )
  }

  _handleToggleChecked = () => {
    const checked = !this.state.checked
    const name = this.props.label

    this.setState({checked})
    this.props.onChange && this.props.onChange({name, checked})
  }
}

const Label = (props) => (
  <View style={styles.labelContainer}>
    <Text style={[styles.label, props.labelStyle]} numberOfLines={props.numberOfLabelLines}>
      {props.label}
    </Text>
  </View>
)

var styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 30,
    height: 30
  },
  labelContainer: {
    marginLeft: 10,
    marginRight: 10
  },
  label: {
    fontSize: 16,
    color: '#222'
  }
})

CheckBox.defaultProps = {
  custom: false,
  label: 'Label',
  numberOfLabelLines: 1,
  labelBefore: false,
  checked: false,
  checkedImage: require('./checked.png'),
  uncheckedImage: require('./unchecked.png'),
  checkedComponent: (<Text>Checked</Text>),
  uncheckedComponent: (<Text>Unchecked</Text>)
}

CheckBox.propTypes = {
  custom: PropTypes.bool,
  checkedComponent: PropTypes.element,
  uncheckedComponent: PropTypes.element,
  checked: PropTypes.bool,
  checkBoxStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  containerStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  label: PropTypes.string,
  labelBefore: PropTypes.bool,
  labelStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  numberOfLabelLines: PropTypes.number,
  onChange: PropTypes.func
}

export default CheckBox
