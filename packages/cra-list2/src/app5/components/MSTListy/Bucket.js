/* eslint-disable no-func-assign*/
import React from 'react'
import {renderKeyedById} from '../utils'
import {PlaylistAdd} from '@material-ui/icons'
import {ListPane, renderDeleteIcon} from './ListPane'
import {observer} from 'mobx-react'
import {B} from '../little-rebass'

function BucketItem({item}) {
  const {text: itemText, /*isSelected,*/ onFocus} = item

  return (
    <B.Flex id={item.id} onFocus={onFocus}>
      {itemText || 'I am a hard core TODo'}
    </B.Flex>
  )
}

BucketItem = observer(BucketItem)

function renderBucketHeader(bucket) {
  return (
    <B.Flex>
      {bucket.name || 'I am a Bucket Short and Stout'}
      <ListPane.ItemSecondaryAction
        onClick={() => bucket.addItem()}
        Icon={PlaylistAdd}
      />
      {renderDeleteIcon(bucket.onDelete)}
    </B.Flex>
  )
}

function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
}

BucketItems = observer(BucketItems)

function Bucket({bucket}) {
  return (
    <B.Box
      width={1 / 2}
      // flexDirection={'column'}
    >
      {renderBucketHeader(bucket)}
      <BucketItems bucket={bucket} />
    </B.Box>
  )
}

Bucket = observer(Bucket)

export {Bucket}
