/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {cn, renderKeyedById} from '../utils'
import {observer} from 'mobx-react'
import {
  B,
  Box,
  Btn,
  buttonStyle,
  FlexRow,
  modularScale,
  Text,
  AutoSize,
  TextArea,
} from '../little-rebass'
import styled from 'styled-components'
import FocusTrap from 'focus-trap-react'

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
      py={1}
      lineHeight={1.25}
    >
      <FlexRow mx={1}>
        <B.Tooltip text={item.id}>
          <Box lineHeight={2} colors={'dim'} fontSize={0}>
            {item.id.slice(5, 8)}
          </Box>
        </B.Tooltip>
      </FlexRow>
      <FlexRow flex={'1'} mx={1}>
        {item.isEditing ? (
          <FocusTrap className={cn('flex-auto flex')}>
            <AutoSize>
              <TextArea
                id={item.inputDOMId}
                rows={1}
                colors={'selected'}
                value={item.name}
                lineHeight={1.25}
                // onBlur={item.onInputBlur}
                onFocus={item.onInputFocus}
                onChange={item.onInputChange}
                onKeyDown={item.onInputKeyDown}
              />
            </AutoSize>
          </FocusTrap>
        ) : (
          <Text>{item.name || 'I am a hard core TODo'}</Text>
        )}
      </FlexRow>
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
