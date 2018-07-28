/* eslint-disable no-func-assign*/
import React from 'react'
import {PropTypes, renderKeyedById} from '../utils'
import {Bucket} from './Bucket'
import {observer} from 'mobx-react'
import {Box, Btn, Flex} from '../little-rebass'
import {lifecycle, rc} from '../little-recompose'
import system from 'system-components'
import styled from 'styled-components'
import modularScale from 'polished/lib/helpers/modularScale'
import {
  onModelFocus,
  restoreFocusOnSelectedModelOnDashboardMount,
} from '../../mst/listy-stores/view-helpers'

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

const restoreFocusOnSelectedModelOnMount = lifecycle({
  componentDidMount() {
    restoreFocusOnSelectedModelOnDashboardMount(this.props.dashboard)
  },
})

const BucketItemBtn = styled(Btn).attrs({
  pl: modularScale(0.5),
  width: 1,
})``

const Dashboard = restoreFocusOnSelectedModelOnMount(
  observer(function Dashboard({dashboard}) {
    return (
      <Layout>
        {renderKeyedById(BucketPanel, 'bucket', dashboard.children)}
        <Panel>
          <BucketItemBtn
            id={dashboard.id}
            onClick={dashboard.onAddChild}
            children={'Add List'}
            onFocus={onModelFocus(dashboard)}
          />
        </Panel>
      </Layout>
    )
  }),
)

Dashboard.propTypes = {
  dashboard: PropTypes.shape({children: PropTypes.array.isRequired})
    .isRequired,
}

export {Dashboard}
