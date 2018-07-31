const rewireMobx = require('react-app-rewire-mobx')
// const rewirePreact = require('react-app-rewire-preact')
const {compose} = require('react-app-rewired')
// const rewireReactHotLoader = require('react-app-rewire-hot-loader')

module.exports = {
  webpack: compose(
    /*rewireReactHotLoader, */ /*rewirePreact, */ rewireMobx,
  ),
}
