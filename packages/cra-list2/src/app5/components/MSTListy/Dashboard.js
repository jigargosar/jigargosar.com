/* eslint-disable no-func-assign*/
import React from 'react'
import {renderKeyedById} from '../utils'
import {Bucket} from './Bucket'
import {observer} from 'mobx-react'
import {B} from '../little-rebass'

function Dashboard({dashboard}) {
  return (
    <B.Box
    // flexWrap={'wrap'}
    >
      <B.Flex
        m={2}
        // flexDirection={'column'}
        // align={'stretch'}
      >
        <B.Button
          onClick={() => dashboard.addBucket()}
          children={'Add List'}
        />
      </B.Flex>
      <B.Flex flexDirection={'column'} alignItems={'center'}>
        {renderKeyedById(Bucket, 'bucket', dashboard.buckets)}
      </B.Flex>
    </B.Box>
  )
}

Dashboard = observer(Dashboard)

export {Dashboard}
