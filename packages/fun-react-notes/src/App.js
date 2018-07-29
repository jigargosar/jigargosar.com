import React, {Component, Fragment} from 'react'
import {ArrayValue} from 'react-values'

class App extends Component {
  render() {
    return (
      <div>
        <header>
          <h1>Fun React Notes</h1>
        </header>
        <ArrayValue>
          {notes => (
            <Fragment>
              <Log notes={notes.value} />
            </Fragment>
          )}
        </ArrayValue>
      </div>
    )
  }
}

export default App

const Log = p => {
  console.log('Log', p)
  console.table(p)
  return null
}
