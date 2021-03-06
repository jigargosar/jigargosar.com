import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, whenKey, withKeyEvent} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {
  connect,
  Container,
  props,
  signal,
  state,
} from '../../little-cerebral'
import {_, validate} from '../../little-ramda'
import {controller} from '../../cerebral/CerebralNotesState/controller'

const NoteTextInput = connect(
  {
    setText: signal`setText`,
    prependNewChild: signal`prependNewChild`,
    appendSibling: signal`appendSibling`,
    value: state`noteLookup.${props`id`}.text`,
  },
  function({setText, value, prependNewChild, appendSibling}, {id}) {
    validate('FS', [setText, value])

    return {
      id,
      onChange: e =>
        setText({
          text: e.target.value,
          id,
        }),
      value,
      onKeyDown: withKeyEvent(
        whenKey('enter')(() => appendSibling({id})),
        whenKey('alt+enter')(() => prependNewChild({id})),
        // whenKey('backspace')(onBackspaceKeyDown),
        // whenKey('tab')(wrapPD(indentNote)),
        // whenKey('shift+tab')(wrapPD(unIndentNote)),
        // whenKey('down')(wrapPD(navigateToNextNote)),
        // whenKey('up')(wrapPD(navigateToPreviousNote)),
        // whenKey('shift+up')(wrapPD(() => collapseNote(note))),
        // whenKey('shift+down')(wrapPD(() => expandNote(note))),
        // whenKey('mod+.')(wrapPD(() => setCurrentRootNote(note))),
        // whenKey('mod+,')(wrapPD(setCurrentRootNoteOneLevelUp)),
      ),
    }
  },
  function NoteTextInput({id, value, onChange, onKeyDown}) {
    return (
      <input
        id={id}
        className={cn('flex-auto', 'ma0 pv2 bw0 outline-0')}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    )
  },
)

function NoteTextLine({id}) {
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
        <div className={cn('f6 gray mr3', 'dn_')}>
          {id.slice(0, 3)}
        </div>
        <div className={cn('flex-auto', 'flex')}>
          <NoteTextInput id={id} />
        </div>
      </div>
    </div>
  )
}

const NoteChildren = connect(
  {childrenIds: state`childrenLookup.${props`id`}`},
  function NoteChildren({childrenIds}) {
    // if (doesNoteHaveVisibleChildren(note)) {
    // debugger
    return (
      <div className={cn('ml3')}>
        {_.map(id => (
          <F key={id}>
            <NoteChild id={id} />
          </F>
        ))(childrenIds)}
      </div>
    )
    // } else {
    //   return null
    // }
  },
)
function NoteChild({id}) {
  return (
    <F>
      <NoteTextLine id={id} />
      <NoteChildren id={id} />
    </F>
  )
}

const NoteTree = connect({id: state`rootNoteId`}, function NoteTree({
  id,
}) {
  return (
    <F>
      <div className={cn('ma3 pa3 shadow-1 bg-white')}>
        <NoteChild id={id} />
      </div>
    </F>
  )
})

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
