/* eslint-disable no-func-assign*/
import React from 'react'
import {renderKeyedById} from '../utils'
import {Bucket} from './Bucket'
import {observer} from 'mobx-react'
import {Box, Btn, Flex} from '../little-rebass'
import {lifecycle, rc} from '../little-recompose'
import system from 'system-components'
import styled from 'styled-components'
import modularScale from 'polished/lib/helpers/modularScale'
import {
  onModelBlur,
  onModelFocus,
} from '../../mst/listy-stores/collection-stores'

const Layout = system({
  is: Flex,
  flexWrap: 'wrap',
})

const Panel = system({
  is: Box,
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

const BucketItemBtn = styled(Btn).attrs({
  pl: modularScale(0.5),
  width: 1,
})``

const Dashboard = observer(
  focusItemOnMount(
    observer(function Dashboard({dashboard}) {
      return (
        <Layout>
          {renderKeyedById(BucketPanel, 'bucket', dashboard.buckets)}
          <Panel>
            <BucketItemBtn
              id={dashboard.btnAddListDOMId}
              onClick={() => dashboard.addBucket()}
              children={'Add List'}
              onKeyDown={dashboard.onBtnAddListKeyDown}
              onFocus={onModelFocus(dashboard)}
              onBlur={onModelBlur(dashboard)}
            />
          </Panel>
        </Layout>
      )
    }),
  ),
)

export {Dashboard}
