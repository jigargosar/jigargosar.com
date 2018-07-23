/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById} from '../utils'
import {observer} from 'mobx-react'
import {
  B,
  Box,
  Btn,
  buttonStyle,
  FlexRow,
  Input,
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
  tabIndex: 0,
})`
  ${buttonStyle};
`

const BucketItem = observer(function BucketItem({item}) {
  return (
    <BucketItemLayout
      id={item.id}
      // colors={item.isEditing ? 'selected' : 'default'}
      variant={item.isEditing ? 'selected' : 'default'}
      onFocus={item.onFocus}
      onBlur={item.onBlur}
      onKeyDown={item.onLIKeydown}
      mx={-1}
    >
      <B.Tooltip text={item.id}>
        <Text lineHeight={2} mx={1} colors={'dim'} fontSize={0}>
          {item.id.slice(5, 8)}
        </Text>
      </B.Tooltip>
      {item.isEditing ? (
        <Input
          id={item.inputDOMId}
          lineHeight={2}
          rows={1}
          mx={1}
          defaultValue={item.text || 'I am a hard core TODo'}
          onBlur={() => {
            document.getElementById(item.id).focus()
            item.onInputBlur()
          }}
        />
      ) : (
        <Text lineHeight={2} mx={1}>
          {item.text || 'I am a hard core TODo'}
        </Text>
      )}
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
        id={bucket.headerDOMId}
        onKeyDown={bucket.onHeaderKeydown}
      >
        <Box textStyle={'bucketTitle'} flex={1}>
          {bucket.name || 'I am a Bucket Short and Stout'}
        </Box>
      </BucketHeaderLayout>
      <BucketItems bucket={bucket} />
    </Fragment>
  )
}

Bucket = observer(Bucket)

export {Bucket}
