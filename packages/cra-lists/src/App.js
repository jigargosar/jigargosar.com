import React, {Fragment as F} from 'react'
import {C} from './StateContext'
import formatDate from 'date-fns/format'
import cn from 'classnames'
import {animated, Transition} from 'react-spring'
import {trace} from 'mobx'

// import {RenderState} from './debug/RenderState'
// import Radium, {Style} from 'radium'

const R = require('ramda')

class SpacedRow extends C {
  r({inline = false, className, children}) {
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
}

const centeredContentClass = 'f5 center mw7 mv3 ph3'

const buttonCN =
  'input-reset pointer ttc bn blue link bg-white-30 pa1 ph2 br-pill hover-bg-white'

class SignInOutView extends C {
  r({s}) {
    if (!s.auth.isAuthKnown) return <div>...Loading</div>
    const content = s.auth.isSignedIn ? (
      <F>
        <div>{s.auth.displayName}</div>
        <button className={cn(buttonCN)} onClick={s.auth.signOut}>
          Sign Out
        </button>
      </F>
    ) : (
      <button className={cn(buttonCN)} onClick={s.auth.signIn}>
        SignIn
      </button>
    )
    return (
      <SpacedRow className={'f5'} inline>
        {content}
      </SpacedRow>
    )
  }
}

class PageTitle extends C {
  r({s}) {
    return <div className="f1">{s.pageTitle}</div>
  }
}

class Header extends C {
  r({s}) {
    return (
      <div className="bg-light-blue tc pa3">
        <PageTitle />
        <SignInOutView />
      </div>
    )
  }
}

function getFormattedDate(date) {
  return formatDate(date, `hh:mm a Do MMM 'YY`)
}

class GrainItem extends C {
  r({s, grain, style}) {
    const toDisplayText = R.when(R.isEmpty, R.always('<empty>'))
    return (
      <div className={'pv3'} style={style}>
        <div className={'flex hide-child'}>
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
        </div>
      </div>
    )
  }
}

class ArchivedListHeader extends C {
  r() {
    return <div className={'pv2 f4 b'}>ARCHIVE</div>
  }
}

function renderAnimatedGrainsList(grains, animate = false) {
  if (animate) {
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
  } else {
    return R.map(grain => (
      <GrainItem key={grain._id} grain={grain} />
    ))(grains)
  }
}

function renderAnimatedArchivedHeader(s, animate = false) {
  if (animate) {
    return (
      <Transition
        native
        from={{opacity: 0, height: 0}}
        enter={{opacity: 1, height: 'auto'}}
        leave={{opacity: 0, height: 0}}
      >
        {s.grains.hasArchived
          ? style => {
              return (
                <animated.div style={style}>
                  <ArchivedListHeader />
                </animated.div>
              )
            }
          : style => <animated.div style={style} />}
      </Transition>
    )
  } else {
    return <ArchivedListHeader />
  }
}

class GrainsList extends C {
  r({s}) {
    return (
      <F>
        {renderAnimatedGrainsList(s.grains.active, false)}
        {renderAnimatedArchivedHeader(s, false)}
        {renderAnimatedGrainsList(s.grains.archived, false)}
      </F>
    )
  }
}

class GrainEdit extends C {
  r({s}) {
    if (s.editModal.isClosed) return null
    if (localStorage.traceEnabled) {
      trace()
    }
    return (
      <div className={'fixed absolute--fill bg-black-20 pa4-ns'}>
        <div
          className={
            'w-100 h-100 bg-white shadow-1 f5 flex flex-column'
          }
        >
          <div className={'bb b--moon-gray pa3 f4 b'}>Edit</div>
          <div className={'flex-auto mh3'}>
            <div className={'mv2 flex flex-wrap'}>
              <label className={'pv2 w-100'}>Text</label>
              <input
                className={'pa2 h2 outline-0 f4 flex-auto'}
                placeholder={'e.g. Go Fish!'}
                value={s.editModal.form.text}
                onChange={s.onFormFieldChange('text')}
              />
            </div>
          </div>
          <div
            className={'bt b--moon-gray pa3 flex flex-row-reverse'}
          >
            <button onClick={s.saveEdit} className={buttonCN}>
              Ok
            </button>
            <button onClick={s.cancelEdit} className={buttonCN}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }
}

class GrainListHeader extends C {
  r({s}) {
    return (
      <SpacedRow className={'pv3'}>
        <div className={'f4 b'}>LIST</div>
        <button className={cn(buttonCN)} onClick={s.onAddNew}>
          Add
        </button>
      </SpacedRow>
    )
  }
}
export class App extends C {
  r() {
    return (
      <div className={'f6'}>
        <Header />
        <div className={`${centeredContentClass}`}>
          <GrainListHeader />
          <GrainsList />
          <GrainEdit />
          <footer className={'pt3 pb7 '}>Footer</footer>
        </div>

        {/*<RenderState src={s.toJSON()} />*/}
        {/*<RenderState*/}
        {/*src={s.debugJSON()}*/}
        {/*hide={s.hideRenderState}*/}
        {/*onClose={s.onCloseRenderState}*/}
        {/*/>*/}
      </div>
    )
  }
}
