import React, {Component, Fragment} from 'react'
import {NumberValue} from 'react-values'

class App extends Component {
  state = {
    title: 'Welcome to React',
    content: `To get started, edit <code>src/App.js</code> and save to reload.`,
    counter: 0,
  }

  render() {
    return (
      <div>
        <header>
          <h1>{this.state.title}</h1>
        </header>
        <NumberValue>
          {ct => (
            <Fragment>
              <p>{ct.value}</p>
              <button onClick={() => ct.increment(10)}>inc</button>
              <button onClick={() => ct.set(10)}>set 10</button>
            </Fragment>
          )}
        </NumberValue>
      </div>
    )
  }
}

export default App
