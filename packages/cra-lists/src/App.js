import React, {Fragment as F} from 'react'
import {observer} from 'mobx-react'
import {withState} from './StateContext'
import formatDate from 'date-fns/format'
import * as cn from 'classnames'
import {Transition, animated} from 'react-spring'

const R = require('ramda')

function SpacedRow({inline = false, className, children}) {
  return (
    <div
      className={cn(
        'SpacedRow',
        {'SpacedRow--inline': inline},
        className,
      )}
    >
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

const GrainItem = injectS(function GrainItem({s, grain, style}) {
  const [displayText, cn = ''] = R.isEmpty(grain.text)
    ? ['<empty>', 'black-70']
    : [grain.text]
  return (
    <div className={'pv3'} style={style}>
      <button onClick={s.onUpdate(grain)}>E</button>
      <button onClick={s.onToggleArchive(grain)}>X</button>
      <div className={cn}>{displayText}</div>
      <div className={'f6 black-50 pl2'}>
        <SpacedRow>
          <div>id: {grain._id}</div>
          <div>rev: {grain._rev}</div>
          <div>a: {grain.actorId}</div>
          <div>cAt: {getFormattedDate(grain.createdAt)}</div>
          <div>mAt: {getFormattedDate(grain.modifiedAt)}</div>
          <div>ver: {grain.version}</div>
          <div>X: {`${grain.isArchived}`}</div>
        </SpacedRow>
      </div>
    </div>
  )
})

const GrainsList = injectS(function GrainsList({s}) {
  function grainsList(grains) {
    return (
      <Transition
        native
        keys={grains.map(item => item._id)}
        from={{opacity: 0, height: 0}}
        enter={{opacity: 1, height: 'auto'}}
        leave={{opacity: 0, height: 0}}
      >
        {R.map(grain => style => (
          <animated.div style={style}>
            <GrainItem grain={grain} />
          </animated.div>
        ))(grains)}
      </Transition>
    )
  }

  return (
    <F>
      {grainsList(s.g.active)}
      <Transition
        native
        from={{opacity: 0}}
        enter={{opacity: 1}}
        leave={{opacity: 0}}
      >
        {s.g.archived.length > 0 &&
          (style => (
            <animated.div className={'pv2 f3'} style={style}>
              Archived List
            </animated.div>
          ))}
      </Transition>
      {grainsList(s.g.archived)}
    </F>
  )
})

const GrainListHeader = injectS(function GrainListHeader({s}) {
  return (
    <SpacedRow className={'pv2'}>
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
        <footer className={'pt3 pb7 '}>Footer</footer>
      </div>
    </F>
  )
})

export default App
