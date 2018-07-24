/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById} from '../utils'
import {observer} from 'mobx-react'
import {Box, FlexRow, system} from '../little-rebass'
import {BucketItem} from './BucketItem'

const BucketItems = observer(function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
})

const Header = system({
  is: FlexRow,
  mb: 2,
  pl: 1,
  colors: 'dim',
  variant: 'default',
  tabIndex: 0,
})

const Title = system({
  textStyle: 'bucketTitle',
  flex: 1,
})

export const Bucket = observer(function Bucket({bucket}) {
  return (
    <Fragment>
      <Header
        id={bucket.headerDOMId}
        onKeyDown={bucket.onHeaderKeydown}
      >
        <Title>
          {bucket.name || 'I am a Bucket Short and Stout'}
        </Title>
      </Header>
      <BucketItems bucket={bucket} />
    </Fragment>
  )
})
