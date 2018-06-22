/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from './components/utils'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

const createNoteListOfSize = R.compose(
  R.map(i => ({id: `${i}`, text: `Note Text ${i}`})),
  R.times(R.identity),
)

function render() {
  const App = require('./components/App').default
  ReactDOM.render(
    <StateProvider value={{noteList: createNoteListOfSize(10)}}>
      <App />
    </StateProvider>,
    document.getElementById('root'),
  )
}

render()

registerServiceWorker()

if (module.hot) {
  module.hot.accept(['./components/App'], () => {
    render()
  })
}
