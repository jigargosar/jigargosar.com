// const { compose } = require('react-app-rewired');
const { compose, identity } = require('ramda');

// noinspection ES6ConvertModuleExportToExport
module.exports =  compose(
  identity()
)
