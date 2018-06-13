import React, {Fragment as F} from 'react'
import {observer} from 'mobx-react'
import {withState} from './StateContext'
import formatDate from 'date-fns/format'
import * as cn from 'classnames'

const R = require('ramda')

function SpacedRow({inline = false, children}) {
  return (
    <div className={cn('SpacedRow', {'SpacedRow--inline': inline})}>
      {children}
    </div>
  )
}

const centeredContentClass = 'center mw7 mv3 ph3'

const injectS = R.compose(withState, observer)

const SignInOutView = injectS(function SignInOutView({s}) {
  const userInfo = s.fire.userInfo
  const content = userInfo ? (
    <F>
      <div>{userInfo.displayName}</div>
      <button onClick={s.fire.signOut}>SignOut</button>
    </F>
  ) : (
    <button onClick={s.fire.signIn}>SignIn</button>
  )
  return <SpacedRow inline>{content}</SpacedRow>
})

const Header = injectS(function Header({s}) {
  return (
    <div className="bg-light-blue tc pa3">
      <div className="f1">{s.pageTitle}</div>
      {!s.fire.isAuthLoading && <SignInOutView />}
      {s.fire.isAuthLoading && <div>...Loading</div>}
    </div>
  )
})

function getFormattedDate(date) {
  return formatDate(date, `hh:mm a Do MMM 'YY`)
}

const GrainItem = injectS(function GrainItem({s, grain}) {
  const [displayText, cn = ''] = R.isEmpty(grain.text)
    ? ['<empty>', 'black-70']
    : [grain.text]
  return (
    <div className={'mv2'}>
      <button onClick={s.onUpdate(grain)}>E</button>
      <div className={cn}>{displayText}</div>
      <div className={'f6 black-50 ml2'}>
        <SpacedRow>
          <div>id: {grain._id}</div>
          <div>rev: {grain._rev}</div>
          <div>a: {grain.actorId}</div>
          <div>cAt: {getFormattedDate(grain.createdAt)}</div>
          <div>mAt: {getFormattedDate(grain.modifiedAt)}</div>
          <div>ver: {grain.version}</div>
        </SpacedRow>
      </div>
    </div>
  )
})

const GrainsList = injectS(function GrainsList({s}) {
  return (
    <div>
      {R.map(grain => <GrainItem key={grain._id} grain={grain} />)(
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
