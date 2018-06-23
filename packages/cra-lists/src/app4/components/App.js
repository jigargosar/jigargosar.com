// Foo

/*eslint-disable*/
import React from 'react'
import {
  CenterLayout,
  List,
  ListItem,
  RootContainer,
  Title,
} from './ui'
import {
  C,
  injectAllStates,
  observer,
  OC,
  renderKeyedById,
  WithState,
} from './utils'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class Note extends OC {
  r({note}) {
    return <ListItem>{note.text}</ListItem>
  }
}

class NoteList extends OC {
  r() {
    return (
      <List>
        <WithState>
          {({noteList}) => renderKeyedById(Note, 'note', noteList)}
        </WithState>
      </List>
    )
  }
}

class App extends C {
  r() {
    return (
      <RootContainer>
        <CenterLayout>
          <Title>Notes</Title>
          <NoteList />
        </CenterLayout>
      </RootContainer>
    )
  }
}

App.propTypes = {}

export default App
