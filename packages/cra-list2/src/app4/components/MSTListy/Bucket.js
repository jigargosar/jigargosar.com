/* eslint-disable no-func-assign*/
import React from 'react'
import {cn, renderKeyedById} from '../utils'
import {PlaylistAdd} from '@material-ui/icons'
import {Row} from '../ui/tui'
import {ListPane, renderDeleteIcon} from './ListPane'
import {observer} from 'mobx-react'

function BucketItem({item}) {
  const {
    text: itemText,
    isSelected,
    onFocus,
    onDelete: onDeleteItem,
  } = item

  return (
    <ListPane.Item
      colors={cn({
        'black bg-black-10': isSelected,
      })}
      onFocus={onFocus}
    >
      <Row p={2}>
        <input type={'checkbox'} tabIndex={-1} />
      </Row>
      <ListPane.ItemText className={cn('code')}>
        {itemText || 'I am a hard core TODo'}
      </ListPane.ItemText>
      {renderDeleteIcon(onDeleteItem)}
    </ListPane.Item>
  )
}

BucketItem = observer(BucketItem)

function renderBucketHeader(bucket) {
  return (
    <ListPane.Item className={cn('f4 lh-copy')}>
      <ListPane.ItemText className={cn('f5', 'flex-auto')}>
        {bucket.name || 'I am a Bucket Short and Stout'}
      </ListPane.ItemText>
      <ListPane.ItemSecondaryAction
        onClick={bucket.onAddItem}
        Icon={PlaylistAdd}
      />
      {/*<ListPane.ItemAction Icon={Settings} />*/}
      {renderDeleteIcon(bucket.onDelete)}
    </ListPane.Item>
  )
}

function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
}

BucketItems = observer(BucketItems)

function Bucket({bucket}) {
  return (
    <ListPane>
      {renderBucketHeader(bucket)}
      <BucketItems bucket={bucket} />
    </ListPane>
  )
}

Bucket = observer(Bucket)

export {Bucket}
