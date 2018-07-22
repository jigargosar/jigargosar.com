/* eslint-disable no-func-assign*/
import React from 'react'
import {cn, renderKeyedById} from '../utils'
import {Btn} from '../tui'
import {ListPane} from './ListPane'
import {Bucket} from './Bucket'
import {observer} from 'mobx-react'
import {REB} from '../REB'

function Dashboard({dashboard}) {
  return (
    <REB.Flex className={cn('flex flex-wrap')}>
      {renderKeyedById(Bucket, 'bucket', dashboard.buckets)}
      <ListPane>
        <ListPane.Item
          Component={Btn}
          colors={'black-50 hover-black-80 hover-bg-black-10'}
          onClick={() => dashboard.addBucket()}
        >
          <ListPane.ItemText>{`Add List`}</ListPane.ItemText>
        </ListPane.Item>
      </ListPane>
    </REB.Flex>
  )
}

Dashboard = observer(Dashboard)

export {Dashboard}
