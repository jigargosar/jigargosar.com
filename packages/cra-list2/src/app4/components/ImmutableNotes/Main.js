import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {_} from '../../little-ramda'

function createNote({text = ''}) {
  return {text, children: []}
}

function addChild(child) {
  return function(note) {
    return _.assoc('children')(_.append(child, note.children))(note)
  }
}

class NoteTree extends React.Component {
  state = {
    root: addChild(createNote({text: 'first child'}))(
      createNote({text: 'Tree Root'}),
    ),
  }

  render() {
    const {root} = this.state
    return <div>{root.text}</div>
  }
}

const Main = mrInjectAll(function Main() {
  return (
    <TypographyDefaults className={cn('mb4')}>
      <AppHeaderBar>
        <Title className={cn('flex-auto')}>
          {`Immutable Note Outliner`}
        </Title>
      </AppHeaderBar>
      <CenterLayout>
        <NoteTree />
      </CenterLayout>
    </TypographyDefaults>
  )
})

export default Main
