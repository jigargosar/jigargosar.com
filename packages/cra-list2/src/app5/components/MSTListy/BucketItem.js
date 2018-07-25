import styled from 'styled-components'
import {
  Box,
  Btn,
  dpFlexRow,
  FlexRow,
  preWrapCSS,
  system,
  TextArea,
} from '../little-rebass'
import modularScale from 'polished/lib/helpers/modularScale'
import {observer} from 'mobx-react'
import FocusTrap from 'focus-trap-react'
import {cn} from '../utils'
import {AutoSize} from '../lib/AutoSize'
import React from 'react'

const Container = system({
  ...dpFlexRow,
  pl: modularScale(0.5),
  py: 1,
  width: 1,
  tabIndex: 0,
  variant: 'default',
  lineHeight: 1.25,
  css: {overflow: 'hidden'},
})

const Title = system({
  css: preWrapCSS,
})

const ID = system({
  ...dpFlexRow,
  px: 1,
  colors: 'dim',
  fontSize: 0,
})

export const BucketItemBtn = styled(Btn).attrs({
  pl: modularScale(0.5),
  width: 1,
})``

const Input = system({
  is: TextArea,
  flex: 1,
  colors: 'selected',
  css: {resize: 'none'},
})

const Editor = function(props) {
  return (
    <FocusTrap className={cn('flex-auto flex')}>
      <AutoSize>
        <Input {...props} />
      </AutoSize>
    </FocusTrap>
  )
}

export const BucketItem = observer(function BucketItem({item}) {
  return (
    <Container
      id={item.id}
      variant={item.isEditing ? 'selected' : 'default'}
      onFocus={item.onFocus}
      onBlur={item.onBlur}
      onKeyDown={item.onLIKeydown}
    >
      <ID>{item.id.slice(5, 8)}</ID>
      {item.isEditing ? (
        <FlexRow flex={1} mx={1} css={{overflow: 'inherit'}}>
          <Editor
            id={item.inputDOMId}
            // rows={1}
            value={item.name}
            // onBlur={item.onInputBlur}
            onFocus={item.onInputFocus}
            onChange={item.onInputChange}
            onKeyDown={item.onInputKeyDown}
          />
        </FlexRow>
      ) : (
        <FlexRow flex={1} px={1} css={{overflow: 'inherit'}}>
          <Box
            css={{
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
              wordWrap: 'break-word',
            }}
          >
            {item.name || 'I am a hard core TODo'}
          </Box>
        </FlexRow>
      )}
    </Container>
  )
})
