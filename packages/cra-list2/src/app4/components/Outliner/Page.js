import React from 'react'
import {cn, F, mrInjectAll, renderKeyedById} from '../utils'
import {Text} from '../ui'

function OutLines({lines}) {
  return renderKeyedById(Outline, 'line', lines)
}

function Outline({line}) {
  return (
    <div className={cn('pa1')}>
      <Text>{line.text}</Text>
      <OutLines lines={line.lines} />
    </div>
  )
}

const OutlinePage = mrInjectAll(function App({out}) {
  return (
    <F>
      <div className={cn('pa3 bg-blue white shadow-1')}>
        <Text>{`Outliner`}</Text>
      </div>
      <div className={cn('pa3')}>
        <OutLines lines={out.root.lines} />
      </div>
    </F>
  )
})

export default OutlinePage
