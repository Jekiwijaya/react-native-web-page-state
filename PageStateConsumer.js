import React from 'react';
import PropTypes from 'prop-types';

export default class PageStateConsumer extends React.Component {
  static contextTypes = {
    pageState: PropTypes.shape().isRequired,
  };

  handleResetPageState = (...args) => {
    if (args && args.length) {
      this.context.pageState.set(args[0]);
    } else {
      this.context.pageState.reset();
    }
  };

  render() {
    if (!this.context.pageState) {
      throw new Error(`Didn't find and PageStateProvider!`);
    }
    const { children } = this.props;
    return children({
      setPageState: this.context.pageState.set,
      resetPageState: this.handleResetPageState,
    });
  }
}
