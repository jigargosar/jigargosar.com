/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById} from '../utils'
import {observer} from 'mobx-react'
import {dpFlexRow, system} from '../little-rebass'
import {BucketItem} from './BucketItem'
import {onModelBlur} from '../../mst/listy-stores/view-helpers'
import {onModelFocus} from '../../mst/listy-stores/view-helpers'

const BucketItems = observer(function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
})

const Header = system({
  ...dpFlexRow,
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
        onFocus={onModelFocus(bucket)}
        onBlur={onModelBlur(bucket)}
      >
        <Title>
          {bucket.name || 'I am a Bucket Short and Stout'}
        </Title>
      </Header>
      <BucketItems bucket={bucket} />
    </Fragment>
  )
})
