// Foo

/*eslint-disable*/
import React from 'react'
import cn from 'classnames'
import {Container, RootContainer, Title} from './ui'
import {RC} from './utils'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends RC {
  render() {
    return (
      <RootContainer>
        <Title>Notes</Title>
        <div>Notes List</div>
      </RootContainer>
    )
  }
}

App.propTypes = {}

export default App
