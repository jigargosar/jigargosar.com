/* eslint-disable no-func-assign*/
import React from 'react'
import {renderKeyedById} from '../utils'
import {Bucket} from './Bucket'
import {observer} from 'mobx-react'
import {B} from '../little-rebass'
import styled from 'styled-components'
import {rc} from '../little-recompose'

const Layout = styled(B.Box)``

Layout.defaultProps = {
  // flexDirection: 'column',
  // alignItems: 'center',
  // flexWrap={'wrap'}
}

const Panel = styled(B.Flex)``

Panel.defaultProps = {
  p: 3,
  m: 3,
  border: '1px solid',
}

const BucketPanel = rc.nest(Panel, Bucket)

const Dashboard = observer(function Dashboard({dashboard}) {
  return (
    <B.Box
    // flexWrap={'wrap'}
    >
      <Layout>
        {renderKeyedById(BucketPanel, 'bucket', dashboard.buckets)}
      </Layout>
      <Panel>
        <B.Button
          onClick={() => dashboard.addBucket()}
          children={'Add List'}
        />
      </Panel>
    </B.Box>
  )
})

export {Dashboard}
