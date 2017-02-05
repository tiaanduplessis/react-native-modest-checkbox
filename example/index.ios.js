import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import CheckBox from 'react-native-modest-checkbox';

export default class example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <CheckBox
          label='Default'
          checked={true}
          onChange={(checked) => console.log('Checked!', checked)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }
});

AppRegistry.registerComponent('example', () => example);
