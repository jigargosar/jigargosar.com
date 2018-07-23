/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById, whenKeyPD, withKeyEvent} from '../utils'
import {Delete, PlaylistAdd} from '@material-ui/icons'
import {observer} from 'mobx-react'
import {
  B,
  Box,
  Btn,
  buttonStyle,
  FlexRow,
  IconBtn,
  modularScale,
} from '../little-rebass'
import styled from 'styled-components'

export const BucketItemBtn = styled(Btn).attrs({
  pl: modularScale(0.5),
  width: 1,
})``

export const BucketItemLayout = styled(FlexRow).attrs({
  pl: modularScale(0.5),
  width: 1,
  variant: 'default',
})`
  ${buttonStyle};
`

const BucketItem = observer(function BucketItem({item}) {
  return (
    <BucketItemLayout
      id={item.id}
      onFocus={item.onFocus}
      onBlur={item.onBlur}
      tabIndex={0}
      onKeyDown={withKeyEvent(
        whenKeyPD('down')(item.onNavigateNext),
        whenKeyPD('up')(() => alert('up')),
        whenKeyPD('enter')(() => alert('enter')),
        whenKeyPD('space')(() => alert('space')),
      )}
    >
      <B.Text lineHeight={2}>
        {item.text || 'I am a hard core TODo'}
      </B.Text>
    </BucketItemLayout>
  )
})

const BucketItems = observer(function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
})

function Bucket({bucket}) {
  return (
    <Fragment>
      <FlexRow pb={2} colors={'dim'}>
        <Box textStyle={'bucketTitle'} flex={1}>
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
