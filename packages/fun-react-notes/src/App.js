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
              {_.map(renderNote)(notes.value)}
            </Fragment>
          )}
        </ArrayValue>
      </div>
    )
  }
}

export default App

class Note extends Component {
  render() {
    const {note} = this.props
    return (
      <Fragment>
        {/*<Log note={note} />*/}
        <div>
          <small>{note.id}</small>
        </div>
        <div>{note.text}</div>
      </Fragment>
    )
  }
}

function renderNote(note) {
  return <Note key={note.id} note={note} />
}

class Log extends Component {
  render() {
    console.groupCollapsed('Props', this.props)
    _.forEachObjIndexed((v, k) => {
      console.log('Log', k, v)
      if (_.contains(_.type(v))(['Object', 'Array'])) {
        console.table(v)
      }
    })(this.props)
    return null
  }
}
