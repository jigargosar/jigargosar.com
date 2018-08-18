import cn from 'classnames'
import {prettyStringifySafe} from './little-ramda'
import React from 'react'

export function ObsPromise({p}) {
  const renderResult = p.case({
    fulfilled: renderJSON,
    rejected: e => {
      console.error(`renderObsPromise`, e)
      return null
    },
  })

  function renderJSON(data) {
    return (
      <pre className={cn('pa3', 'br4 f6 code bg-black-10')}>
        <code typeof={'JSON'}>{prettyStringifySafe(data)}</code>
      </pre>
    )
  }

  return (
    <div className={cn('pa3')}>
      <div className={cn('ph3 ', 'f6 ttu')}>{`status = ${p.state}`}</div>
      <div>{renderResult}</div>
    </div>
  )
}
