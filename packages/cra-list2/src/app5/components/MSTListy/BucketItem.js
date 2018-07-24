import styled from 'styled-components'
import {
  Box,
  Btn,
  buttonStyle,
  FlexRow,
  TextArea,
} from '../little-rebass'
import modularScale from 'polished/lib/helpers/modularScale'
import {observer} from 'mobx-react'
import FocusTrap from 'focus-trap-react'
import {cn} from '../utils'
import {AutoSize} from '../lib/AutoSize'
import React from 'react'

export const PreWrap = styled(Box)`
  white-space: pre-wrap;
`
export const BucketItemLayout = styled(FlexRow).attrs({
  pl: modularScale(0.5),
  width: 1,
  tabIndex: 0,
})`
  ${buttonStyle};
`
export const BucketItem = observer(function BucketItem({item}) {
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
        <Box lineHeight={2} colors={'dim'} fontSize={0}>
          {item.id.slice(5, 8)}
        </Box>
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
          <PreWrap>{item.name || 'I am a hard core TODo'}</PreWrap>
        )}
      </FlexRow>
    </BucketItemLayout>
  )
})
export const BucketItemBtn = styled(Btn).attrs({
  pl: modularScale(0.5),
  width: 1,
})``
