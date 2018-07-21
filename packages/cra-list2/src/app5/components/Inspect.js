import {Inspector} from 'react-inspector'
import React, {Fragment} from 'react'
import {domain} from '../mst/listy-stores'
import {defaultNodeRenderer} from './Inspect/defaultNodeRenderer'

export function INS() {
  return (
    <Fragment>
      <Inspector
        name={'domain'}
        data={domain}
        // name={'Domain'}
        // data={Domain}
        // showNonenumerable
        expandLevel={2}
        nodeRenderer={defaultNodeRenderer}
      />
      {/*
      <Inspector
        expandLevel={1}
        data={{
          a1: 1,
          a2: 'A2',
          a3: true,
          a4: undefined,
          a5: {
            'a5-1': null,
            'a5-2': ['a5-2-1', 'a5-2-2'],
            'a5-3': {},
          },
          a6: function() {
            console.log('hello world')
          },
          a7: new Date('2005-04-03'),
        }}
        nodeRenderer={defaultNodeRenderer}
      />
*/}
    </Fragment>
  )
}
