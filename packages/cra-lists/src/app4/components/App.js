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

class App extends RC {
  render() {
    return (
      <RootContainer>
        <CenterLayout>
          <Title>Notes</Title>
        </CenterLayout>
        <CenterLayout>
          <List>
            {R.times(
              id => <ListItem key={id}>{`Note ${id}`}</ListItem>,
              10,
            )}
          </List>
        </CenterLayout>
      </RootContainer>
    )
  }
}

App.propTypes = {}

export default App
