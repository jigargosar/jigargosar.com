import React from 'react'
import ReactDOM from 'react-dom'
// import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mRunInAction, oObject} from './mobx/little-mobx'
import {tryCatchLog} from './little-ramda'
import {Provider} from 'mobx-react'

const storesBox = oObject({}, {}, {name: 'storesBox'})

let firstLoad = true

function render() {
  if (firstLoad) {
    console.log('Full Page Load')
    firstLoad = false
  } else {
    console.clear()
    console.log('HMR: Console Cleared')
  }

  Object.assign(storesBox, {
    ...require('./mst/listy-stores'),
  })
  const App = require('./components/MSTListy/Main').default
  ReactDOM.render(
    <Provider stores={storesBox}>
      <App />
    </Provider>,
    document.getElementById('root'),
  )
}

function renderAction() {
  mRunInAction('render', render)
}

renderAction()

registerServiceWorker()

if (module.hot) {
  window.s = storesBox

  module.hot['accept'](
    ['./mst/listy-stores', './components/MSTListy/Main'],
    tryCatchLog(renderAction),
  )
}
