/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById} from '../utils'
import {observer} from 'mobx-react'
import {Box, buttonStyle, FlexRow} from '../little-rebass'
import styled from 'styled-components'
import {BucketItem} from './BucketItem'

export const HeaderLayout = styled(FlexRow).attrs({
  mb: 2,
  pl: 1,
  colors: 'dim',
  variant: 'default',
  tabIndex: 0,
})`
  ${buttonStyle};
`

const BucketItems = observer(function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
})

function Bucket({bucket}) {
  return (
    <Fragment>
      <HeaderLayout
        id={bucket.headerDOMId}
        onKeyDown={bucket.onHeaderKeydown}
      >
        <Box textStyle={'bucketTitle'} flex={1}>
          {bucket.name || 'I am a Bucket Short and Stout'}
        </Box>
      </HeaderLayout>
      <BucketItems bucket={bucket} />
    </Fragment>
  )
}

Bucket = observer(Bucket)

export {Bucket}
