const {compose, injectBabelPlugin} = require('react-app-rewired')

module.exports = {
  webpack: compose(config =>
    injectBabelPlugin('transform-decorators-legacy', config),
  ),
}
