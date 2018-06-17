import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {StateProvider} from './StateContext'
import {State} from './mobx-stores/State'

const App = require('./App').App
function render() {
  ReactDOM.render(
    <React.Fragment>
      <StateProvider value={State}>
        <App />
      </StateProvider>
      {/*<DevTools />*/}
    </React.Fragment>,
    document.getElementById('root'),
  )
}

render()

if (module.hot) {
  window.state = State
  module.hot.accept(['./state-loader'], () => {
    render()
  })
}

registerServiceWorker()
