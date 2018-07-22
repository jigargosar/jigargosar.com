/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById} from '../utils'
import {Delete, PlaylistAdd} from '@material-ui/icons'
import {observer} from 'mobx-react'
import {B, Btn, IconBtn} from '../little-rebass'

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
      <B.Flex alignItems={'center'}>
        <B.Box fontSize={3} flex={'1 1'}>
          {bucket.name || 'I am a Bucket Short and Stout'}
        </B.Box>
        <IconBtn icon={Delete} fontSize={4} />
        <IconBtn
          icon={PlaylistAdd}
          onClick={() => bucket.addItem()}
        />
      </B.Flex>
      <BucketItems bucket={bucket} />
    </Fragment>
  )
}

Bucket = observer(Bucket)

export {Bucket}
