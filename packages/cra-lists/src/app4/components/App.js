// Foo

/*eslint-disable*/
import React from 'react'
import cn from 'classnames'
import {
  CenterLayout,
  List,
  ListItem,
  RootContainer,
  Section,
  Title,
} from './ui'
import {RC} from './utils'
import {o} from '../../StateContext'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

const createNoteListOfSize = R.compose(
  R.map(i => ({id: `${i}`, text: `Note Text ${i}`})),
  R.times(R.identity),
)

function renderKeyedById(Component, propName, idList) {
  return R.map(value => (
    <Component key={value.id} {...{[propName]: value}} />
  ))(idList)
}

const Note = o(({note}) => <ListItem>{note.text}</ListItem>)
class App extends RC {
  render() {
    const noteList = createNoteListOfSize(10)
    return (
      <RootContainer>
        <CenterLayout>
          <Title>Notes</Title>
        </CenterLayout>
        <CenterLayout>
          <List>{renderKeyedById(Note, 'note', noteList)}</List>
        </CenterLayout>
      </RootContainer>
    )
  }
}

App.propTypes = {}

export default App
