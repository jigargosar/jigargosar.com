import React, {Fragment as F} from 'react'
import {observer} from 'mobx-react'
import {withState} from './StateContext'
import formatDate from 'date-fns/format'
import cn from 'classnames'
import {animated, Transition} from 'react-spring'

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

const buttonCN = 'input-reset pointer ttc mh1 bn blue link'

const injectS = R.compose(withState, observer)

const SignInOutView = injectS(function SignInOutView({s}) {
  const userInfo = s.fire.userInfo
  const content = userInfo ? (
    <F>
      <div>{userInfo.displayName}</div>
      <button className={cn(buttonCN)} onClick={s.fire.signOut}>
        Sign Out
      </button>
    </F>
  ) : (
    <button className={cn(buttonCN)} onClick={s.fire.signIn}>
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
const GrainItem = injectS(function GrainItem({s, grain, style}) {
  const toDisplayText = R.when(R.isEmpty, R.always('<empty>'))
  return (
    <div className={'pv3'} style={style}>
      <SpacedRow className={'flex-nowrap hide-child'}>
        <div className={'child'}>
          <button
            className={cn(buttonCN, 'w-100')}
            onClick={s.onUpdate(grain)}
          >
            E
          </button>
          <button
            className={cn(buttonCN, 'w-100')}
            onClick={s.onToggleArchive(grain)}
          >
            X
          </button>
        </div>
        <div className={'dib'}>
          <div
            className={cn('pointer', {
              'black-70': R.isEmpty(grain.text),
            })}
            onClick={s.onStartEditing(grain)}
          >
            {toDisplayText(grain.text)}
          </div>
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
  <div className={'pv2 f4 b'}>ARCHIVE</div>
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

const GrainsList = injectS(function GrainsList({s}) {
  return (
    <F>
      {renderGrainsList(s.g.active)}
      <Transition
        native
        from={{opacity: 0, height: 0}}
        enter={{opacity: 1, height: 'auto'}}
        leave={{opacity: 0, height: 0}}
      >
        {s.g.hasArchived
          ? style => {
              return (
                <animated.div style={style}>
                  <ArchivedListHeader />
                </animated.div>
              )
            }
          : style => <animated.div style={style} />}
      </Transition>
      {renderGrainsList(s.g.archived)}
    </F>
  )
})
const GrainEdit = injectS(function GrainEdit({s}) {
  if (s.editState.type === 'idle') return null
  return (
    <div className={'fixed absolute--fill bg-black-20 pa4-ns'}>
      <div
        className={
          'w-100 h-100 bg-white shadow-1 f4 flex flex-column'
        }
      >
        <div className={'bb b--moon-gray pa3'}>Edit</div>
        <div className={'flex-auto pa3 flex'}>
          <input
            className={'flex-auto link outline-0 f4 h2 pa2'}
            placeholder={'Enter Text ...'}
          />
        </div>
        <div className={'bt b--moon-gray pa3 flex flex-row-reverse'}>
          <button className={buttonCN}>Ok</button>
          <button className={buttonCN}>Cancel</button>
        </div>
      </div>
    </div>
  )
})
const GrainListHeader = injectS(function GrainListHeader({s}) {
  return (
    <SpacedRow className={'pv3'}>
      <div className={'f4 b'}>LIST</div>
      <button className={cn(buttonCN)} onClick={s.onAddNew}>
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
        <GrainEdit />
        <footer className={'pt3 pb7 '}>Footer</footer>
      </div>
    </div>
  )
})

export default App
