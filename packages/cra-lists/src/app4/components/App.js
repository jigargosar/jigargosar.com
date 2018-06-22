// Foo

/*eslint-disable*/
import React from 'react'
import cn from 'classnames'
import {CenterContainer, RootContainer, Title} from './ui'
import {RC} from './utils'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends RC {
  render() {
    return (
      <RootContainer>
        <CenterContainer>
          <Title>Notes</Title>
          <div>Notes List</div>
        </CenterContainer>
      </RootContainer>
    )
  }
}

App.propTypes = {}

export default App
