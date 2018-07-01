// const { compose } = require('react-app-rewired');
const { injectBabelPlugin , compose} = require('react-app-rewired');

const { partial, identity } = require('ramda');

// noinspection ES6ConvertModuleExportToExport
module.exports =  compose(
  partial(injectBabelPlugin,['babel-plugin-transform-decorators']),
  // partial(injectBabelPlugin,['babel-plugin-transform-decorators'])
)
