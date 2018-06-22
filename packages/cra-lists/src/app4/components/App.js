// Foo

/*eslint-disable*/
import React from 'react'
import cn from 'classnames'
import {CenterLayout, RootContainer, Section, Title} from './ui'
import {RC} from './utils'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends RC {
  render() {
    return (
      <RootContainer>
        <CenterLayout>
          <Title>Notes</Title>
        </CenterLayout>
        <CenterLayout>Notes List</CenterLayout>
      </RootContainer>
    )
  }
}

App.propTypes = {}

export default App
