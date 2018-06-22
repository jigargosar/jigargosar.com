// Foo

/*eslint-disable*/
import React, {Component as RC} from 'react'
import cn from 'classnames'
import {Container, RootContainer, Title} from './ui'

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
