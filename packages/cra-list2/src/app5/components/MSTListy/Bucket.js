/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById} from '../utils'
import {Delete, PlaylistAdd} from '@material-ui/icons'
import {ListPane, renderDeleteIcon} from './ListPane'
import {observer} from 'mobx-react'
import {B} from '../little-rebass'
import system from 'system-components'

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

const Button = system({
  is: 'button',
  bg: 'transparent solid',
  color: '#666',
  border: 0,
  p: 1,
  fontSize: 3,
  display: 'flex',
  alignItems: 'center',
  lineHeight: 'inherit',
})

function Bucket({bucket}) {
  return (
    <Fragment>
      <B.Flex alignItems={'center'}>
        <B.Box fontSize={3} flex={'1 1'}>
          {bucket.name || 'I am a Bucket Short and Stout'}
        </B.Box>
        <Button children={<Delete fontSize={'inherit'} />} />
        <Button
          children={<PlaylistAdd fontSize={'inherit'} />}
          onClick={() => bucket.addItem()}
        />
      </B.Flex>
      <BucketItems bucket={bucket} />
    </Fragment>
  )
}

Bucket = observer(Bucket)

export {Bucket}
