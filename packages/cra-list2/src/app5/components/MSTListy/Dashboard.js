/* eslint-disable no-func-assign*/
import React from 'react'
import {renderKeyedById} from '../utils'
import {Bucket, BucketItemBtn} from './Bucket'
import {observer} from 'mobx-react'
import {B} from '../little-rebass'
import {lifecycle, rc} from '../little-recompose'
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
  colors: 'dimBorder',
})

const BucketPanel = rc.nest(Panel, Bucket)

const focusItemOnMount = lifecycle({
  componentDidMount() {
    console.debug('this.props.dashboard.onMount()')
    this.props.dashboard.onMount()
  },
})

const Dashboard = focusItemOnMount(
  observer(function Dashboard({dashboard}) {
    return (
      <Layout>
        {renderKeyedById(BucketPanel, 'bucket', dashboard.buckets)}
        <Panel>
          <BucketItemBtn
            onClick={() => dashboard.addBucket()}
            children={'Add List'}
          />
        </Panel>
      </Layout>
    )
  }),
)

export {Dashboard}
