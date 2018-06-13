import React, {Fragment as F} from 'react'
import {observer, Observer} from 'mobx-react'
import {withState} from './StateContext'
import formatDate from 'date-fns/format'
import * as cn from 'classnames'
import {animated, Transition} from 'react-spring'
import {trace} from 'mobx'

const R = require('ramda')

function SpacedRow({inline = false, className, children}) {
  return (
    <div
      className={cn(
        'SpacedRow flex-wrap',
        {'SpacedRow--inline': inline},
        className,
      )}
    >
      {children}
    </div>
  )
}

const centeredContentClass = 'f5 center mw7 mv3 ph3'

const injectS = R.compose(withState, observer)

const SignInOutView = injectS(function SignInOutView({s}) {
  const userInfo = s.fire.userInfo
  const content = userInfo ? (
    <F>
      <div>{userInfo.displayName}</div>
      <button className={'input-reset'} onClick={s.fire.signOut}>
        SignOut
      </button>
    </F>
  ) : (
    <button className={'input-reset'} onClick={s.fire.signIn}>
      SignIn
    </button>
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

const GrainItem = injectS(function GrainItem({
  s,
  grain: {_id},
  style,
}) {
  trace()
  const grain = s.g.idLookup.get(_id)
  const [displayText, cn = ''] = R.isEmpty(grain.text)
    ? ['<empty>', 'black-70']
    : [grain.text, '']

  return (
    <div className={'pv3'} style={style}>
      <SpacedRow className={'flex-nowrap hide-child'}>
        <div className={'child'}>
          <button
            className={'input-reset outline-0 pointer w-100 '}
            onClick={s.onUpdate(grain)}
          >
            E
          </button>
          <button
            className={'input-reset outline-0 pointer w-100'}
            onClick={s.onToggleArchive(grain)}
          >
            X
          </button>
        </div>
        <div className={'dib'}>
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
      </SpacedRow>
    </div>
  )
})
const ArchivedListHeader = () => (
  <div className={'pv2 f3'}>Archived List</div>
)
function renderGrainsList(grains) {
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

const ArchivedGrainList = injectS(function ArchivedGrainList({s}) {
  trace()
  return renderGrainsList(s.g.archived)
})
const GrainsList = injectS(function GrainsList({s}) {
  return (
    <div>
      {renderGrainsList(s.g.active)}
      <Transition
        native
        from={{opacity: 0, height: 0}}
        enter={{opacity: 1, height: 'auto'}}
        leave={{opacity: 0, height: 0}}
      >
        {style =>
          React.createElement(
            animated.div,
            {style},
            s.g.hasArchived
              ? React.createElement(ArchivedListHeader)
              : null,
          )
        }
      </Transition>
      <ArchivedGrainList />
    </div>
  )
})

const GrainListHeader = injectS(function GrainListHeader({s}) {
  return (
    <SpacedRow className={'pv3'}>
      <div className={'f4 b'}>LIST</div>
      <button className={'input-reset'} onClick={s.onAddNew}>
        Add
      </button>
    </SpacedRow>
  )
})
const App = injectS(function App() {
  return (
    <div className={'f6'}>
      <Header />
      <div className={`${centeredContentClass}`}>
        <GrainListHeader />
        <GrainsList />
        <footer className={'pt3 pb7 '}>Footer</footer>
      </div>
    </div>
  )
})

export default App
