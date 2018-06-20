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
        {s.n.list.map((n, idx) => (
          <div key={idx}>{`Note ${idx}: ${n.text}`}</div>
        ))}
      </div>
    )
  }
}

Notes.propTypes = {}
