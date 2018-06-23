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
  o,
  renderKeyedById,
  i,
  injectState,
  observer,
} from './utils'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

const Note = observer(
  class Note extends C {
    r({note}) {
      return <ListItem>{note.text}</ListItem>
    }
  },
)

const NoteList = injectState('noteList')(
  class NoteList extends C {
    r({noteList}) {
      return <List>{renderKeyedById(Note, 'note', noteList)}</List>
    }
  },
)

const App = observer(
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
  },
)

App.propTypes = {}

export default App
