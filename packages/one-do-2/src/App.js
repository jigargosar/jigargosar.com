import React, {Component} from 'react'
import {observer} from './lib/little-react'
import MaterialAppFrame from './components/MaterialAppFrame'
import {StoreContextProvider} from './StoreContext'

@observer
class App extends Component {
  render() {
    return (
      <StoreContextProvider>
        <MaterialAppFrame />
      </StoreContextProvider>
    )
  }

  componentDidCatch(error, info) {
    console.log(info, error)
    return <div>Error</div>
  }
}

export default App
