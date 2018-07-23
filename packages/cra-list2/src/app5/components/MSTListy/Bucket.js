/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById} from '../utils'
import {Delete, PlaylistAdd} from '@material-ui/icons'
import {observer} from 'mobx-react'
import {B, Box, Btn, FlexRow, IconBtn} from '../little-rebass'
import styled from 'styled-components'

export const BucketItemBtn = styled(Btn).attrs({
  pl: 2,
  width: 1,
})``

const BucketItem = observer(function BucketItem({item}) {
  return (
    <B.Text
      id={item.id}
      pl={2}
      onFocus={item.onFocus}
      onBlur={item.onBlur}
      tabIndex={-1}
    >
      {item.text || 'I am a hard core TODo'}
    </B.Text>
  )
})

const BucketItems = observer(function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
})

function Bucket({bucket}) {
  return (
    <Fragment>
      <FlexRow>
        <Box fontSize={3} flex={1}>
          {bucket.name || 'I am a Bucket Short and Stout'}
        </Box>
        <IconBtn icon={Delete} />
        <IconBtn
          icon={PlaylistAdd}
          onClick={() => bucket.addItem()}
        />
      </FlexRow>
      <BucketItems bucket={bucket} />
      <BucketItemBtn
        children={'Add Item'}
        id={`add-item-${bucket.id}`}
      />
    </Fragment>
  )
}

Bucket = observer(Bucket)

export {Bucket}
