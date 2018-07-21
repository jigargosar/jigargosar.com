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
  mRunInAction('Hot Update States', () => {
    if (firstLoad) {
      console.log('App Reloaded')
      firstLoad = false
    } else {
      console.clear()
      console.log('Clearing Console on Hot Reload')
    }

    Object.assign(storesBox, {
      store: require('./mst/listy-stores').store,
    })
    const App = require('./components/MSTListy/Main').default
    ReactDOM.render(
      <Provider store={storesBox}>
        <App />
      </Provider>,
      document.getElementById('root'),
    )
  })
}

render()

registerServiceWorker()

if (module.hot) {
  window.s = storesBox

  module.hot['accept'](
    ['./mst/listy-stores', './components/MSTListy/Main'],
    tryCatchLog(render),
  )
}
