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

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

const createNoteListOfSize = R.compose(
  R.map(i => ({id: `${i}`, text: `Note Text ${i}`})),
  R.times(R.identity),
)
class App extends RC {
  render() {
    const list = createNoteListOfSize(10)
    return (
      <RootContainer>
        <CenterLayout>
          <Title>Notes</Title>
        </CenterLayout>
        <CenterLayout>
          <List>
            {R.map(({id, text}) => (
              <ListItem key={id}>{text}</ListItem>
            ))(list)}
          </List>
        </CenterLayout>
      </RootContainer>
    )
  }
}

App.propTypes = {}

export default App
