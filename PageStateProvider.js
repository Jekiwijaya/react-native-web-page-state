import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import get from 'lodash/get';

import Handler from './Handler';

export default class PageStateProvider extends Component {
  static propTypes = {
    config: PropTypes.shape().isRequired,
  };

  state = {};

  static childContextTypes = {
    pageState: PropTypes.shape(),
  };

  static defaultProps = {
    config: {},
  };

  setPageState = (path, value) => {
    this.setState({
      [path]: value,
    });
  };

  resetPageState = () => {
    const { config } = this.props;
    Object.keys(config).forEach(path => this.setPageState(path));
  };

  getChildContext() {
    return {
      pageState: {
        set: this.setPageState,
        reset: this.resetPageState,
      },
    };
  }

  render() {
    const { config } = this.props;
    return (
      <View style={{ flex: 1 }}>
        {this.props.children}
        {Object.keys(config).map(configName => (
          <Handler key={`handler-${configName}`} config={config[configName]} {...get(this.state, configName)} />
        ))}
      </View>
    );
  }
}
