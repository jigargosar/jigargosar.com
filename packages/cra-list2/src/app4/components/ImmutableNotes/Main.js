import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {_, mapIndexed} from '../../little-ramda'

function createNote({text = ''}) {
  return {text, children: []}
}

function appendChild(child) {
  return function(note) {
    return _.assoc('children')(_.append(child, note.children))(note)
  }
}

function getChildren({children}) {
  return children
}

class NoteTree extends React.Component {
  state = {
    root: _.compose(
      appendChild(createNote({text: 'second child'})),
      appendChild(createNote({text: 'first child'})),
    )(createNote({text: 'Tree Root'})),
  }
  renderChild = (child, idx) => {
    return <div key={idx}>{child.text}</div>
  }

  renderChildren = note => {
    return (
      <div className={cn('ml3')}>
        {mapIndexed(this.renderChild)(getChildren(note))}
      </div>
    )
  }

  render() {
    const {root} = this.state
    return (
      <div className={cn('ma3')}>
        <div>{root.text}</div>
        {this.renderChildren(root)}
      </div>
    )
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
