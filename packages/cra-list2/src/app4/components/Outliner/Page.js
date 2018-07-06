import React from 'react'
import {cn, F, mrInjectAll, observer, renderKeyedById} from '../utils'
import {Text} from '../ui'

const OutLines = observer(function OutLines({lines}) {
  return renderKeyedById(Outline, 'line', lines)
})

const Outline = observer(function Outline({line}) {
  return (
    <div className={cn('pa1')}>
      <Text>{line.text}</Text>
      <input
        value={line.text}
        onChange={e => line.userUpdate({text: e.target.value})}
      />
      <OutLines lines={line.lines} />
    </div>
  )
})

const OutlinePage = mrInjectAll(function App({out}) {
  return (
    <F>
      <div className={cn('pa3 bg-blue white shadow-1')}>
        <Text>{`Outliner`}</Text>
      </div>
      <div className={cn('pa3')}>
        <OutLines lines={out.lines} />
      </div>
    </F>
  )
})

export default OutlinePage
