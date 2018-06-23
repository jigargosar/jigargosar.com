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

class Note extends C {
  r({note}) {
    return <ListItem>{'foo' + note.text}</ListItem>
  }
}

class NoteList extends C {
  r() {
    return (
      <List>
        <WithState>
          {({view: {noteList}}) => {
            return renderKeyedById(Note, 'note', noteList)
          }}
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
