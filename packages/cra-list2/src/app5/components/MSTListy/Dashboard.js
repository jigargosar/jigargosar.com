/* eslint-disable no-func-assign*/
import React from 'react'
import {renderKeyedById} from '../utils'
import {Bucket} from './Bucket'
import {observer} from 'mobx-react'
import {REB} from '../REB'

function Dashboard({dashboard}) {
  return (
    <REB.Box
    // flexWrap={'wrap'}
    >
      <REB.Flex
        m={2}
        // flexDirection={'column'}
        // align={'stretch'}
      >
        <REB.Button
          onClick={() => dashboard.addBucket()}
          children={'Add List'}
        />
      </REB.Flex>
      {renderKeyedById(Bucket, 'bucket', dashboard.buckets)}
    </REB.Box>
  )
}

Dashboard = observer(Dashboard)

export {Dashboard}
