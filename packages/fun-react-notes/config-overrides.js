const rewireMobx = require('react-app-rewire-mobx')
const rewirePreact = require('react-app-rewire-preact')
const {compose} = require('react-app-rewired')

module.exports = {
  webpack: compose(rewirePreact, rewireMobx),
}
