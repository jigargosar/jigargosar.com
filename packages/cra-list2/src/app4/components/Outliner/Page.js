import React from 'react'
import {
  cn,
  F,
  isAnyHotKey,
  mrInjectAll,
  observer,
  renderKeyedById,
} from '../little-mobx'
import {Text} from '../ui'
import {_} from '../../utils'

const OutLines = observer(function OutLines({lines}) {
  return renderKeyedById(Outline, 'line', lines)
})

const Outline = mrInjectAll(function Outline({line, out}) {
  return (
    <div className={cn('flex items-center')}>
      {/*<Text>{line.text}</Text>*/}
      <input
        className={cn('flex-auto pa1 ')}
        value={line.text}
        onChange={e => line.userUpdate({text: e.target.value})}
        onKeyDown={e => {
          _.cond([
            [isAnyHotKey(['Enter']), () => out.onEnter(line)],
            [isAnyHotKey(['backspace']), () => out.onBackspace(line)],
          ])(e)
        }}
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
