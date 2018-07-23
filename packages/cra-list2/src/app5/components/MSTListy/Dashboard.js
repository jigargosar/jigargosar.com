/* eslint-disable no-func-assign*/
import React from 'react'
import {renderKeyedById} from '../utils'
import {Bucket} from './Bucket'
import {observer} from 'mobx-react'
import {B, Btn} from '../little-rebass'
import {rc} from '../little-recompose'
import system from 'system-components'

const Layout = system({
  is: B.Flex,
  flexWrap: 'wrap',
})

const Panel = system({
  is: B.Box,
  width: [1, 1, 1 / 2, 1 / 3, 1 / 4],
  p: 3,
  // mx: [0, 'auto', 0],
  borderBottom: 1,
  borderRight: 1,
  borderColor: 'lightgray',
})

const BucketPanel = rc.nest(Panel, Bucket)

const Dashboard = observer(function Dashboard({dashboard}) {
  return (
    <Layout>
      {renderKeyedById(BucketPanel, 'bucket', dashboard.buckets)}
      <Panel>
        <Btn
          onClick={() => dashboard.addBucket()}
          children={'Add List'}
        />
      </Panel>
    </Layout>
  )
})

export {Dashboard}
