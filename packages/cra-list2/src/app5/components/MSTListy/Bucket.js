/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById, whenKeyPD, withKeyEvent} from '../utils'
import {Delete} from '@material-ui/icons'
import {observer} from 'mobx-react'
import {
  B,
  Box,
  Btn,
  buttonStyle,
  FlexRow,
  IconBtn,
  modularScale,
  Text,
} from '../little-rebass'
import styled from 'styled-components'

export const BucketItemBtn = styled(Btn).attrs({
  pl: modularScale(0.5),
  width: 1,
})``

export const BucketHeaderLayout = styled(FlexRow).attrs({
  mb: 2,
  pl: 1,
  colors: 'dim',
  variant: 'default',
  tabIndex: 0,
})`
  ${buttonStyle};
`

export const BucketItemLayout = styled(FlexRow).attrs({
  pl: modularScale(0.5),
  width: 1,
  variant: 'default',
  tabIndex: 0,
})`
  ${buttonStyle};
`

const BucketItem = observer(function BucketItem({item}) {
  return (
    <BucketItemLayout
      id={item.id}
      onFocus={item.onFocus}
      onBlur={item.onBlur}
      onKeyDown={withKeyEvent(
        whenKeyPD('up')(item.onNavigatePrev),
        whenKeyPD('down')(item.onNavigateNext),
        whenKeyPD('mod+enter')(item.appendSibling),
        whenKeyPD('enter')(() => alert('enter')),
        whenKeyPD('space')(() => alert('space')),
      )}
      mx={-1}
    >
      <B.Tooltip text={item.id}>
        <Text lineHeight={2} mx={1} colors={'dim'} fontSize={0}>
          {`${item.id.slice(5, 8)}`}
        </Text>
      </B.Tooltip>
      <Text lineHeight={2} mx={1}>
        {`${item.text || 'I am a hard core TODo'}`}
      </Text>
    </BucketItemLayout>
  )
})

const BucketItems = observer(function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.items)
})

function Bucket({bucket}) {
  return (
    <Fragment>
      <BucketHeaderLayout
        onKeyDown={withKeyEvent(
          // whenKeyPD('up')(item.onNavigatePrev),
          // whenKeyPD('down')(item.onNavigateNext),
          // whenKeyPD('mod+enter')(item.appendSibling),
          whenKeyPD('d')(bucket.onDelete),
          whenKeyPD('enter')(() => alert('enter')),
          whenKeyPD('space')(() => alert('space')),
        )}
      >
        <Box textStyle={'bucketTitle'} flex={1}>
          {bucket.name || 'I am a Bucket Short and Stout'}
        </Box>
        <IconBtn icon={Delete} />
      </BucketHeaderLayout>
      <BucketItems bucket={bucket} />
      <BucketItemBtn
        children={'Add Item'}
        id={`add-item-${bucket.id}`}
        onClick={() => bucket.addItem()}
      />
    </Fragment>
  )
}

Bucket = observer(Bucket)

export {Bucket}
