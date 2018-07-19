/* eslint-disable no-func-assign*/
import React from 'react'
import {cn} from '../utils'
import {_} from '../../little-ramda'
import {PlaylistAdd} from '@material-ui/icons'
import {Btn, Row} from '../ui/tui'
import {ListPane, renderDeleteIcon} from './ListPane'
import {inject, observer} from 'mobx-react'

function BucketItem({isSelected, item, selectItem, deleteItem}) {
  return (
    <ListPane.Item
      colors={cn({
        'black bg-black-10': isSelected,
      })}
      onFocus={() => selectItem({item})}
    >
      <Row p={2}>
        <input type={'checkbox'} tabIndex={-1} />
      </Row>
      <ListPane.ItemText className={cn('code')}>
        {item.text || 'I am a hard core TODo'}
      </ListPane.ItemText>
      {renderDeleteIcon(() => deleteItem({itemId: item.id}))}
    </ListPane.Item>
  )
}

BucketItem = _.compose(
  inject(({store: {store}}, {itemId}) => ({
    selectItem: _.F,
    item: store.itemLookup.get(itemId),
    deleteItem: _.F,
    isSelected: false,
  })),
  observer,
)(BucketItem)
// BucketItem = connect(
//   {
//     selectItem: signal`selectItem`,
//     item: itemById,
//     deleteItem: signal`deleteItem`,
//     isSelected: isItemSelected,
//   },
//   BucketItem,
// )

function renderBucketHeader(bucket, onAddItem, deleteBucket) {
  return (
    <ListPane.Item className={cn('f4 lh-copy')}>
      <ListPane.ItemText className={cn('f5', 'flex-auto')}>
        {bucket.name}
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

function Bucket({bucket, itemIds, onAddItem, deleteBucket}) {
  return (
    <ListPane>
      {renderBucketHeader(bucket, onAddItem, deleteBucket)}
      {_.map(id => <BucketItem key={id} itemId={id} />)(itemIds)}
      {renderBucketAddItem(onAddItem)}
    </ListPane>
  )
}

Bucket = _.compose(
  inject(({store: {store}}) => {
    return {
      onAddItem: store.addItem,
      bucket: {name: 'Bucket Name'},
      itemIds: store.itemIds,
      deleteBucket: _.F,
    }
  }),
  observer,
)(Bucket)

export {Bucket}
// Bucket = connect(
//   {
//     addItem: signal`addItem`,
//     bucket: bucketById,
//     itemIds: bucketIdToItemIds,
//     deleteBucket: signal`deleteBucket`,
//   },
//   ({bucket, addItem, itemIds, deleteBucket}) => ({
//     onAddItem: () => addItem({bucketId: bucket.id}),
//     bucket,
//     itemIds,
//     deleteBucket,
//   }),
//   Bucket,
// )
