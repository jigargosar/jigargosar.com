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

const GrainItem = injectS(function GrainItem({grain}) {
  return (
    <div>
      <div>{grain.text}</div>
      <div>{grain.id}</div>
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
