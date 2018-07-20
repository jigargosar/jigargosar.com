/* eslint-disable no-func-assign*/
import React from 'react'
import {cn, renderKeyedById} from '../utils'
import {_} from '../../little-ramda'
import {Btn} from '../ui/tui'
import {ListPane} from './ListPane'
import {Bucket} from './Bucket'
import {inject, observer} from 'mobx-react'

function Dashboard({buckets, addBucket}) {
  return (
    <div className={cn('flex flex-wrap')}>
      {renderKeyedById(Bucket, 'bucket', buckets)}
      <ListPane>
        <ListPane.Item
          Component={Btn}
          colors={'black-50 hover-black-80 hover-bg-black-10'}
          onClick={addBucket}
        >
          <ListPane.ItemText>{`Add List`}</ListPane.ItemText>
        </ListPane.Item>
      </ListPane>
    </div>
  )
}

Dashboard = _.compose(
  inject(({store: {store}}) => ({
    buckets: store.buckets,
    addBucket: () => store.addBucket(),
  })),
  observer,
)(Dashboard)

export {Dashboard}
