import pageStateMethod from './pageStateMethod';

import withPageStateComponent from './withPageStateComponent';

export default function pageState(config) {
  return function decorator(...toDecorate) {
    if (toDecorate.length === 1) {
      // decorating a class
      return withPageStateComponent(config)(...toDecorate);
    }
    // decorating a method
    return pageStateMethod(config)(...toDecorate);
  };
}
