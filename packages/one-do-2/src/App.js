import React, {Component} from 'react'
import AppContainer from './orbit-components/AppContainer'
import {hotDispose} from './lib/hot'
import {observer} from './lib/mobx-react'

@observer
class App extends Component {
  state = {hasError: false}
  render() {
    if (this.state.hasError) {
      return this.renderError()
    }
    return <AppContainer />
  }

  componentDidCatch(error, info) {
    this.setState({hasError: true, error, info})
  }

  // noinspection JSMethodCanBeStatic
  renderError() {
    return <div>Error Occurred</div>
  }
}

export default App

if (module.hot) {
  hotDispose(() => {
    // debugger
  }, module)
}
