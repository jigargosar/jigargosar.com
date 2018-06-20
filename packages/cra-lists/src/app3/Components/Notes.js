// Foo

/*eslint-disable*/
import React, {Fragment as F} from 'react'
import cn from 'classnames'
import {C, M, o, O} from '../../StateContext'
import {Button} from '../UI'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export class Notes extends M {
  r({ns}) {
    return (
      <div>
        <Button onClick={() => ns.add()}>ADD</Button>
        {ns.list.map(n => <NoteItem key={n.id} id={n.id} n={n} />)}
      </div>
    )
  }
}

class NoteItem extends M {
  r({ns, n, id}) {
    const NoteComp = !ns.isEditing(n.id) ? NoteItemText : NoteItemEdit
    return (
      <div className={cn('mv3')}>
        <div className={cn('f6')}>{`Note id: ${id}`}</div>
        <NoteComp n={n} />
      </div>
    )
  }
}

class NoteItemText extends M {
  r({ns, n}) {
    return (
      <div
        className={cn('f4 code truncate')}
        onClick={() => ns.onEdit(n.id)}
      >{`${n.text}`}</div>
    )
  }
}
class NoteItemEdit extends M {
  inputRef = React.createRef()
  componentDidMount() {
    this.inputRef.current.focus()
  }
  r({ns, n}) {
    // return <div className={cn('f4 code blue')}>{`${n.text}`}</div>
    return (
      <div className={cn('flex')}>
        <input
          ref={this.inputRef}
          onKeyDown={e => {
            console.debug('NodeEditKeyDown', e.key, e)
            const mapping = {
              ArrowUp: ns.onEditPrev,
              ArrowDown: ns.onEditNext,
            }
            const mappingFn = R.propOr(R.identity, R.__, mapping)
            mappingFn(e.key)()
          }}
          className={cn('flex-auto pa2 f4 code blue')}
          defaultValue={n.text}
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
