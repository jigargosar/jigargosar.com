import React from 'react'
import {cn, F, mrInjectAll, renderKeyedById} from '../utils'
import {Text} from '../ui'

const out = {
  root: {
    id: '0',
    text: 'Home',
    lines: [
      {
        id: '1',
        text: 'line 1',
        lines: [],
      },
      {
        id: '2',
        text: 'line 2',
        lines: [
          {
            id: '1',
            text: 'line 2-1',
            lines: [],
          },
          {
            id: '2',
            text: 'line 2-2',
            lines: [],
          },
        ],
      },
    ],
  },
}

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

const OutlinePage = mrInjectAll(function App() {
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
