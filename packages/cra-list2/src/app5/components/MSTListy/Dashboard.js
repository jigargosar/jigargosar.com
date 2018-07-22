/* eslint-disable no-func-assign*/
import React from 'react'
import {renderKeyedById} from '../utils'
import {Bucket} from './Bucket'
import {observer} from 'mobx-react'
import {REB} from '../REB'

function Dashboard({dashboard}) {
  return (
    <REB.Flex flexWrap={'wrap'}>
      {renderKeyedById(Bucket, 'bucket', dashboard.buckets)}
      <REB.Flex
        flex={'1 1 auto'}
        flexDirection={'column'}
        // align={'stretch'}
      >
        <REB.Button
          onClick={() => dashboard.addBucket()}
          children={'Add List'}
        />
      </REB.Flex>
    </REB.Flex>
  )
}

Dashboard = observer(Dashboard)

export {Dashboard}
