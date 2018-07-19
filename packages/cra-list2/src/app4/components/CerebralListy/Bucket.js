/* eslint-disable no-func-assign*/
import React from 'react'
import {cn} from '../utils'
import {connect, signal} from '../../little-cerebral'
import {_} from '../../little-ramda'
import {
  bucketById,
  bucketIdToItemIds,
  isItemSelected,
  itemById,
} from '../../CerebralListyState/app'
import {PlaylistAdd} from '@material-ui/icons'
import {Btn, Row} from '../ui/tui'
import {ListPane, renderDeleteIcon} from './ListPane'
import {rc} from '../recompose-utils'

const BucketItem = connect(
  {
    selectItem: signal`selectItem`,
    item: itemById,
    deleteItem: signal`deleteItem`,
    isSelected: isItemSelected,
  },
  rc.pure(function BucketItem({
    isSelected,
    item,
    selectItem,
    deleteItem,
  }) {
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
          {item.text}
        </ListPane.ItemText>
        {renderDeleteIcon(() => deleteItem({itemId: item.id}))}
      </ListPane.Item>
    )
  }),
)

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

export const Bucket = connect(
  {
    addItem: signal`addItem`,
    bucket: bucketById,
    itemIds: bucketIdToItemIds,
    deleteBucket: signal`deleteBucket`,
  },
  ({bucket, addItem, itemIds, deleteBucket}) => ({
    onAddItem: () => addItem({bucketId: bucket.id}),
    bucket,
    itemIds,
    deleteBucket,
  }),
  function Bucket({bucket, itemIds, onAddItem, deleteBucket}) {
    return (
      <ListPane>
        {renderBucketHeader(bucket, onAddItem, deleteBucket)}
        {_.map(id => <BucketItem key={id} itemId={id} />)(itemIds)}
        {renderBucketAddItem(onAddItem)}
      </ListPane>
    )
  },
)
