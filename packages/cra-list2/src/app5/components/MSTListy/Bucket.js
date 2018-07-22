/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
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

function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
}

BucketItems = observer(BucketItems)

function Bucket({bucket}) {
  return (
    <Fragment>
      <B.Flex>
        {bucket.name || 'I am a Bucket Short and Stout'}
        <ListPane.ItemSecondaryAction
          onClick={() => bucket.addItem()}
          Icon={PlaylistAdd}
        />
        {renderDeleteIcon(bucket.onDelete)}
      </B.Flex>
      <BucketItems bucket={bucket} />
    </Fragment>
  )
}

Bucket = observer(Bucket)

export {Bucket}
