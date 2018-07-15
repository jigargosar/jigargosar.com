import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'

class NoteTree extends React.Component {
  state = {root: {text: 'Root'}}

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
