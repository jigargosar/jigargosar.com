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
import {C, renderKeyedById, withS} from './utils'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

const createNoteListOfSize = R.compose(
  R.map(i => ({id: `${i}`, text: `Note Text ${i}`})),
  R.times(R.identity),
)

const Note = ({note}) => <ListItem>{note.text}</ListItem>

const NoteList = ({noteList}) => (
  <List>{renderKeyedById(Note, 'note', noteList)}</List>
)

const App = withS(
  class App extends C {
    r() {
      return (
        <RootContainer>
          <CenterLayout>
            <Title>Notes</Title>
            <NoteList noteList={createNoteListOfSize(10)} />
          </CenterLayout>
        </RootContainer>
      )
    }
  },
)

App.propTypes = {}

export default App
