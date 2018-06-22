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
import {RC, renderKeyedById} from './utils'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

const createNoteListOfSize = R.compose(
  R.map(i => ({id: `${i}`, text: `Note Text ${i}`})),
  R.times(R.identity),
)

const Note = ({note}) => <ListItem>{note.text}</ListItem>

class App extends RC {
  render() {
    const noteList = createNoteListOfSize(10)
    return (
      <RootContainer>
        <CenterLayout>
          <Title>Notes</Title>
          <List>{renderKeyedById(Note, 'note', noteList)}</List>
        </CenterLayout>
      </RootContainer>
    )
  }
}

App.propTypes = {}

export default App
