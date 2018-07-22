/* eslint-disable no-func-assign*/
import React from 'react'
import {renderKeyedById} from '../utils'
import {Bucket} from './Bucket'
import {observer} from 'mobx-react'
import {B} from '../little-rebass'
import styled from 'styled-components'

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

const BucketPanel = observer(function({bucket}) {
  return (
    <Panel bucket={bucket}>
      <Bucket bucket={bucket} />
    </Panel>
  )
})

const Dashboard = observer(function Dashboard({dashboard}) {
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
      <Layout>
        {renderKeyedById(BucketPanel, 'bucket', dashboard.buckets)}
      </Layout>
    </B.Box>
  )
})

export {Dashboard}
