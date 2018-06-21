// Foo

/*eslint-disable*/
import React, {Fragment as F} from 'react'
import cn from 'classnames'
import {M} from '../../StateContext'
import {Button} from '../UI'
import isHotKey from 'is-hotkey'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export class Notes extends M {
  r({ns}) {
    return (
      <F>
        <div className={cn('mv3')}>
          <Button onClick={() => ns.add()}>ADD</Button>
        </div>
        {ns.list.map(n => <NoteItem key={n.id} id={n.id} n={n} />)}
      </F>
    )
  }
}

class NoteItem extends M {
  r({ns, n, id}) {
    const NoteComp = !ns.isEditing(n.id) ? NoteItemText : NoteItemEdit
    return (
      <div className={cn('mv0')}>
        <div className={cn('f6')}>{`Note id: ${id} sortIdx: ${
          n.sortIdx
        }`}</div>
        <NoteComp n={n} />
      </div>
    )
  }
}

class NoteItemText extends M {
  r({ns, n}) {
    return (
      <div
        className={cn('pa1 f4 code truncate ba bw1 b--transparent')}
        onClick={() => ns.onEdit(n.id)}
      >
        <div className={cn('pa1')}>{`${n.text}`}</div>
      </div>
    )
  }
}

const isAnyHotKey = R.compose(R.anyPass, R.map(R.curryN(2, isHotKey)))

class NoteItemEdit extends M {
  inputRef = React.createRef()

  componentDidMount() {
    this.inputRef.current.focus()
  }

  r({ns, n}) {
    return (
      <div className={cn(' flex f4 code pa1')}>
        <input
          className={cn('flex-auto lh-copy f4 pa1 ba bw1 b--blue')}
          key={n.id}
          ref={this.inputRef}
          onKeyDown={e => {
            console.debug('NodeEditKeyDown', e.key, e)
            // const mapping = {
            //   ArrowUp: ns.onEditPrev,
            //   ArrowDown: ns.onEditNext,
            //   Enter: ns.onEditNext,
            // }
            // const mappingFn = R.propOr(R.identity, R.__, mapping)
            // mappingFn(e.key)(e)

            R.cond([
              [isHotKey('ArrowUp'), ns.onEditPrev],
              [isAnyHotKey(['enter', 'ArrowDown']), ns.onEditNext],
              [isHotKey('mod+enter'), ns.onEditInsertBelow],
            ])(e)
          }}
          defaultValue={ns.editText}
          onChange={e => ns.onEditTextChange(e.target.value)}
        />
      </div>
    )
  }
}

// export const CollapsedString = o(
//   class CollapsedString extends C {
//     r({value, maxLength}) {
//       //todo: get some lib to do the truncation
//       return value
//     }
//   },
// )
