const rewireMobx = require('react-app-rewire-mobx')
const {compose} = require('react-app-rewired')

module.exports = {
  webpack: compose(rewireMobx),
}
