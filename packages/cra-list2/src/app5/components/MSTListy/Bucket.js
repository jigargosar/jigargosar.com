/* eslint-disable no-func-assign*/
import React from 'react'
import {cn, renderKeyedById} from '../utils'
import {PlaylistAdd} from '@material-ui/icons'
import {ListPane, renderDeleteIcon} from './ListPane'
import {observer} from 'mobx-react'
import {REB} from '../REB'

function BucketItem({item}) {
  const {text: itemText, isSelected, onFocus} = item

  return (
    <ListPane.Item
      id={item.id}
      kind={isSelected ? 'selected' : 'button'}
      onFocus={onFocus}
    >
      <ListPane.ItemText className={cn('code')}>
        {itemText || 'I am a hard core TODo'}
      </ListPane.ItemText>
    </ListPane.Item>
  )
}

BucketItem = observer(BucketItem)

function renderBucketHeader(bucket) {
  return (
    <REB.Flex>
      {bucket.name || 'I am a Bucket Short and Stout'}
      <ListPane.ItemSecondaryAction
        onClick={() => bucket.addItem()}
        Icon={PlaylistAdd}
      />
      {renderDeleteIcon(bucket.onDelete)}
    </REB.Flex>
  )
}

function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
}

BucketItems = observer(BucketItems)

function Bucket({bucket}) {
  return (
    <REB.Flex flexDirection={'column'}>
      {renderBucketHeader(bucket)}
      <BucketItems bucket={bucket} />
    </REB.Flex>
  )
}

Bucket = observer(Bucket)

export {Bucket}
