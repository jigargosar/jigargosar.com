/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById} from '../utils'
import {Delete, PlaylistAdd} from '@material-ui/icons'
import {observer} from 'mobx-react'
import {Box, Flex, IconBtn} from '../little-rebass'

function BucketItem({item}) {
  const {text: itemText, /*isSelected,*/ onFocus} = item

  return (
    <Flex id={item.id} onFocus={onFocus}>
      {itemText || 'I am a hard core TODo'}
    </Flex>
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
      <Flex alignItems={'center'}>
        <Box fontSize={3} flex={'1 1'}>
          {bucket.name || 'I am a Bucket Short and Stout'}
        </Box>
        <IconBtn icon={Delete} />
        <IconBtn
          icon={PlaylistAdd}
          onClick={() => bucket.addItem()}
        />
      </Flex>
      <BucketItems bucket={bucket} />
    </Fragment>
  )
}

Bucket = observer(Bucket)

export {Bucket}
