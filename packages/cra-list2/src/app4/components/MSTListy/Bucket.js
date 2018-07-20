/* eslint-disable no-func-assign*/
import React from 'react'
import {cn, renderKeyedById} from '../utils'
import {_} from '../../little-ramda'
import {PlaylistAdd} from '@material-ui/icons'
import {Btn, Row} from '../ui/tui'
import {ListPane, renderDeleteIcon} from './ListPane'
import {inject, observer} from 'mobx-react'

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

function renderBucketHeader(bucket, onAddItem, deleteBucket) {
  return (
    <ListPane.Item className={cn('f4 lh-copy')}>
      <ListPane.ItemText className={cn('f5', 'flex-auto')}>
        {bucket.name || 'I am a Bucket Short and Stout'}
      </ListPane.ItemText>
      <ListPane.ItemSecondaryAction
        onClick={onAddItem}
        Icon={PlaylistAdd}
      />
      {/*<ListPane.ItemAction Icon={Settings} />*/}
      {renderDeleteIcon(() => deleteBucket({bucketId: bucket.id}))}
    </ListPane.Item>
  )
}

function renderBucketAddItem(onAddItem) {
  return (
    <ListPane.Item
      Component={Btn}
      colors="black-50 hover-black-80 hover-bg-black-10"
      onClick={onAddItem}
    >
      <Row p={2} pr={1} className={cn('f4')}>
        <PlaylistAdd fontSize={'inherit'} />
      </Row>
      <ListPane.ItemText>{`Add Task`}</ListPane.ItemText>
    </ListPane.Item>
  )
}

function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
}

BucketItems = observer(BucketItems)

// function BucketItems({items}) {
//   return renderKeyedById(BucketItem, 'item', items)
// }
//
// BucketItems = oInject(({store}, {bucketId}) => {
//   const bucket = store.bucketLookup.get(bucketId)
//   return {
//     itemIds: bucket.itemIds,
//     items: bucket.items,
//   }
// })(BucketItems)

function Bucket({bucket, onAddItem, deleteBucket}) {
  return (
    <ListPane>
      {renderBucketHeader(bucket, onAddItem, deleteBucket)}
      <BucketItems bucket={bucket} />
      {renderBucketAddItem(onAddItem)}
    </ListPane>
  )
}

Bucket = _.compose(
  inject(({store: {store}}) => ({
    bucket: store.bucket,
    onAddItem: store.addItem,
    deleteBucket: _.F,
  })),
  observer,
)(Bucket)

export {Bucket}
