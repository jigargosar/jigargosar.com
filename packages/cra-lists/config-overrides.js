// const { compose } = require('react-app-rewired');
const { injectBabelPlugin , compose} = require('react-app-rewired');

const { partial, partialRight,identity } = require('ramda');

// const reactAppRewireBuildDev = require('react-app-rewire-build-dev');


// noinspection ES6ConvertModuleExportToExport
module.exports =  compose(
  partial(injectBabelPlugin,['babel-plugin-transform-decorators']),
  // partialRight(reactAppRewireBuildDev,[{outputPath:'./dev-build'}])
  // partial(injectBabelPlugin,['babel-plugin-transform-decorators'])
)
