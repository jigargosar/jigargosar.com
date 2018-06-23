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

const NoteList = injectAllStates(
  class NoteList extends OC {
    r({noteList}) {
      return <List>{renderKeyedById(Note, 'note', noteList)}</List>
    }
  },
)

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
