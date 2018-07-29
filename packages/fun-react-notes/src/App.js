import React, {Component, Fragment} from 'react'
import {NumberValue} from 'react-values'
import CFP from './components/CFP'

class App extends Component {
  state = {
    title: 'Welcome to React',
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log(`nextProps,nextState`, nextProps, nextState)
    return true
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(`prevProps,prevState`, prevProps, prevState)
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
              <button onClick={() => ct.increment(10)}>
                <b>INC</b>
              </button>
              <button onClick={() => ct.decrement(10)}>
                <b>DEC</b>
              </button>
            </Fragment>
          )}
        </NumberValue>
        <CFP comp={CFP}>a</CFP>
      </div>
    )
  }
}

export default App
