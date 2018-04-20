if (!global._babelPolyfill) {
  require('babel-polyfill');
}

/* eslint-disable babel/no-invalid-this, prefer-rest-params */

import makeClassMemberDecorator from './makeClassMemberDecorator';
import merge from 'lodash/merge';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';

export function translatePayload(config) {
  if (typeof config === 'string') {
    const paths = config.split('.');
    const type = paths.pop();
    return [
      paths.join(''),
      {
        type,
      },
    ];
  }
  const [path, payload] = translatePayload(config.path);
  return [
    path,
    merge({}, payload || {}, {
      payload: config.payload,
    }),
  ];
}

export default function pageStateMethod(config = {}) {
  return makeClassMemberDecorator(
    decoratedFn =>
      async function decorateClassMember() {
        if (!has(this.props, 'setPageState')) {
          throw new Error(`Component didn't have decorator pageState.`);
        }
        let result = null,
          args;
        const loadingConfigs = (Array.isArray(config.loading) ? config.loading : [config.loading]).filter(Boolean);
        const errorConfigs =  (Array.isArray(config.error) ? config.error : [config.error]).filter(Boolean);
        const successConfigs = (Array.isArray(config.success) ? config.success : [config.success]).filter(Boolean);
        try {
          this.props.resetPageState(); // reset all
          if (!isEmpty(loadingConfigs)) {
            loadingConfigs.forEach(loadingConfig => {
              // run loading
              args = translatePayload(loadingConfig);
              this.props.setPageState(...args);
            })
          }

          result = await Reflect.apply(decoratedFn, this, arguments); // execute function

          if (!isEmpty(loadingConfigs)) {
            loadingConfigs.forEach(loadingConfig => {
              // reset loading
              args = translatePayload(loadingConfig);
              this.props.resetPageState(args[0]);
            });
          }

          if (!isEmpty(successConfigs)) {
            successConfigs.forEach(successConfig => {
              // run success callback
              args = translatePayload(successConfig);
              this.props.setPageState(...args);
            });
          }
        } catch (e) {
          // console.error(e);
          this.props.resetPageState(); // reset all
          const retryFn = decorateClassMember.bind(this);
          if (!isEmpty(errorConfigs)) {
            errorConfigs.forEach(errorConfig => {
              args = translatePayload(errorConfig); // run error

              this.props.setPageState(
                args[0],
                merge({}, args[1] || {}, {
                  payload: {
                    error: e,
                    retry: () => Reflect.apply(retryFn, this, arguments),
                  },
                })
              );
            });
          } else {
            throw e;
          }
        }
        return result;
      }
  );
}
