import React, {Fragment as F} from 'react'
import {observer} from 'mobx-react'
import {withState} from './StateContext'

const R = require('ramda')

const centeredContentClass = 'center mw7 mv3 ph3'

const injectS = R.compose(withState, observer)

const Header = injectS(function Header({s}) {
  return (
    <div className="bg-light-blue tc pa3">
      <div className="f1">{s.pageTitle}</div>
      {/*<div>${signInOutView(state, emit)}</div>*/}
    </div>
  )
})

function SpacedRow({children}) {
  return <div className={'SpacedRow'}>{children}</div>
}

const GrainItem = injectS(function GrainItem({s, grain}) {
  const [displayText, cn = ''] = R.isEmpty(grain.text)
    ? ['<empty>', 'black-70']
    : [grain.text]
  return (
    <div className={'mv2'}>
      <button onClick={s.onUpdate(grain)}>E</button>
      <div className={cn}>{displayText}</div>
      <div className={'f5 black-50 ml2'}>
        <SpacedRow>
          <div>id:{grain.id}</div>
          <div>c:{grain.createdAt}</div>
          <div>m:{grain.modifiedAt}</div>
        </SpacedRow>
      </div>
    </div>
  )
})

const GrainsList = injectS(function GrainsList({s}) {
  return (
    <div>
      {R.map(grain => <GrainItem key={grain.id} grain={grain} />)(
        s.grainsList,
      )}
    </div>
  )
})

const GrainListHeader = injectS(function GrainListHeader({s}) {
  return (
    <SpacedRow>
      LIST
      <button onClick={s.onAddNew}>Add</button>
      <button onClick={s.onClear}>Clear</button>
    </SpacedRow>
  )
})
const App = injectS(function App() {
  return (
    <F>
      <Header />
      <div className={`${centeredContentClass}`}>
        <GrainListHeader />
        <GrainsList />
      </div>
    </F>
  )
})

export default App
