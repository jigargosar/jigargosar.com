import React, {Component, Fragment} from 'react'
import {ArrayValue} from 'react-values'
import * as _ from 'ramda'

function createNote(idx) {
  const id = `${idx}`
  return {
    id,
    text: `Note text ${id}`,
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <header>
          <h1>Fun React Notes</h1>
        </header>
        <ArrayValue defaultValue={_.times(createNote)(5)}>
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
  _.forEachObjIndexed((v, k) => {
    console.log('Log', k, v)
    if (_.contains(_.type(v))(['Object', 'Array'])) {
      console.table(v)
    }
  })(p)
  return null
}
