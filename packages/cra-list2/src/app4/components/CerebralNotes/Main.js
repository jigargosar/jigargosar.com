import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {Controller, Module} from 'cerebral'
import {connect, Container} from '@cerebral/react'
import {state} from 'cerebral/tags'

function NoteTextInput({textValue}) {
  return (
    <input
      // id={getNoteId(note)}
      className={cn('flex-auto', 'ma0 pv2 bw0 outline-0')}
      // value={getNoteText(note)}
      defaultValue={textValue}
      // onChange={onNoteTextChangeEvent(note)}
      // onKeyDown={onNoteInputKeyDown(note)}
    />
  )
}

function NoteTextLine({note}) {
  return (
    <div className={cn('code flex items-center')}>
      <div className={cn('mr3')}>
        {/*{isNoteExpanded(note) ? `-` : `+`}*/}
        {`-`}
      </div>
      <div
        className={cn(
          'flex-auto',
          'flex items-center',
          'bb bw1 b--light-gray',
        )}
      >
        {/*<div className={cn('f6 gray mr3', 'dn')}>*/}
        {/*{getDebugId(note)}*/}
        {/*</div>*/}
        <div className={cn('flex-auto', 'flex')}>
          <NoteTextInput textValue={note.text} />
        </div>
      </div>
    </div>
  )
}

/**
 * @return {null}
 */
function NoteChildren({note}) {
  // if (doesNoteHaveVisibleChildren(note)) {
  //   return (
  //     <div className={cn('ml3')}>
  //       {_.map(childNote => (
  //         <F key={getNoteId(childNote)}>
  //           <NoteChild note={childNote} />
  //         </F>
  //       ))(selectChildren(note))}
  //     </div>
  //   )
  // } else {
  return null
  // }
}

function NoteChild({note}) {
  return (
    <F>
      <NoteTextLine note={note} />
      <NoteChildren note={note} />
    </F>
  )
}

const NoteTree = connect({note: state`rootNote`}, function NoteTree({
  note,
}) {
  return (
    <F>
      <div className={cn('ma3 pa3 shadow-1 bg-white')}>
        <NoteChild note={note} />
      </div>
    </F>
  )
})

function createAppController() {
  function getDevTools() {
    if (module.hot) {
      return require('cerebral/devtools').default({
        host: 'localhost:8585',
        reconnect: true,
      })
    }
    return null
  }

  const app = Module({
    // Define module state, namespaced by module path
    state: {
      rootNote: {text: 'Root Note Title', children: []},
      currentRootNotePath: ['rootNote'],
    },
    signals: {},
    modules: {},
    providers: {},
    catch: [],
  })

  const controller = Controller(app, {
    devtools: getDevTools(),
  })

  return controller
}

const controller = createAppController()

function Main() {
  return (
    <Container controller={controller}>
      <TypographyDefaults className={cn('mb4')}>
        <AppHeaderBar>
          <Title className={cn('flex-auto')}>
            {`Cerebral Note Outliner`}
          </Title>
        </AppHeaderBar>
        <CenterLayout>
          <NoteTree />
        </CenterLayout>
      </TypographyDefaults>
    </Container>
  )
}

export default Main
