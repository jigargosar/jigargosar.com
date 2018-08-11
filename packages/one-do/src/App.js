import React, {Component} from 'react'
import store from './store'
import {observer} from './lib/little-react'
import MaterialApp from './MaterialAppFrame'

@observer
class App extends Component {
  render() {
    return <MaterialApp store={store} />
  }

  componentDidCatch(error, info) {
    console.log(info, error)
    return <div>Error</div>
  }
}

export default App
