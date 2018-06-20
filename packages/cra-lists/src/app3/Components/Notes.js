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
  r({s}) {
    return (
      <div>
        <Button onClick={() => s.n.add()}>ADD</Button>
        {s.n.list.map(n => <NoteItem key={n.id} id={n.id} n={n} />)}
      </div>
    )
  }
}

class NoteItem extends M {
  r({s, n, id}) {
    return (
      <div className={cn('mv3')}>
        <div className={cn('f6')}>{`Note id: ${id}`}</div>
        <div className={cn('f4 code')}>{`${n.text}`}</div>
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
