// Foo

/*eslint-disable*/
import React, {Fragment as F} from 'react'
import cn from 'classnames'
import {M} from '../../StateContext'
import {Button} from '../UI'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export class Notes extends M {
  r({s}) {
    return (
      <div>
        <Button onClick={() => s.n.add()}>ADD</Button>
        {s.n.list.map(n => (
          <div key={n.id} className={cn('mv3')}>
            <div className={cn('f6')}>{`Note ${n.id}`}</div>
            <div className={cn('f4 code')}>{`${n.text}`}</div>
          </div>
        ))}
      </div>
    )
  }
}

Notes.propTypes = {}
