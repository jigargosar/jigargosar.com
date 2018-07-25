import styled from 'styled-components'
import {
  Box,
  Btn,
  dpFlexRow,
  FlexRow,
  system,
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
export const BucketItemLayout = system({
  ...dpFlexRow,
  pl: modularScale(0.5),
  py: 1,
  width: 1,
  tabIndex: 0,
  variant: 'default',
  lineHeight: 1.25,
})

export const BucketItemBtn = styled(Btn).attrs({
  pl: modularScale(0.5),
  width: 1,
})``

export const BucketItem = observer(function BucketItem({item}) {
  return (
    <BucketItemLayout
      id={item.id}
      variant={item.isEditing ? 'selected' : 'default'}
      onFocus={item.onFocus}
      onBlur={item.onBlur}
      onKeyDown={item.onLIKeydown}
    >
      <FlexRow px={1} colors={'dim'} fontSize={0}>
        {item.id.slice(5, 8)}
      </FlexRow>
      <FlexRow flex={'1'} mx={1}>
        {item.isEditing ? (
          <FocusTrap className={cn('flex-auto flex')}>
            <AutoSize>
              <TextArea
                css={`
                  outline: none;
                `}
                id={item.inputDOMId}
                rows={1}
                colors={'selected'}
                value={item.name}
                // lineHeight={1.25}
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
