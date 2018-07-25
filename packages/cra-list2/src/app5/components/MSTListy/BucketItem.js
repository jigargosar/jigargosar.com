import {
  dpFlexRow,
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
import {
  onModelBlur,
  onModelFocus,
} from '../../mst/listy-stores/view-helpers'

const Row = system({
  ...dpFlexRow,
  pl: modularScale(0.5),
  py: 1,
  // width: 1,
  tabIndex: 0,
  variant: 'default',
  lineHeight: 1.25,
  css: {overflow: 'hidden'},
})
Row.displayName = 'Row'

const Col = system({
  ...dpFlexRow,
  flex: null,
  px: 1,
  py: 1,
})

const Title = system({
  css: preWrapCSS,
})

const ID = system({
  colors: 'dim',
  fontSize: 0,
})
ID.displayName = 'ID'

const Input = system({
  is: TextArea,
  flex: 1,
  colors: 'selected',
  css: {resize: 'none'},
})

const InputWrapper = function InputWrapper({children}) {
  return (
    <FocusTrap className={cn('flex-auto flex')}>
      <AutoSize>{children}</AutoSize>
    </FocusTrap>
  )
}

export const BucketItem = observer(function BucketItem({item}) {
  return (
    <Row
      id={item.id}
      variant={item.isEditing ? 'selected' : 'default'}
      onFocus={onModelFocus(item)}
      onBlur={onModelBlur(item)}
      onKeyDown={item.onItemKeydown}
    >
      <Col>
        <ID>{item.id.slice(5, 8)}</ID>
      </Col>
      {item.isEditing ? (
        <Col flex={1}>
          <InputWrapper>
            <Input
              id={item.inputDOMId}
              // rows={1}
              value={item.name}
              onBlur={item.onInputBlur}
              onFocus={item.onInputFocus}
              onChange={item.onInputChange}
              onKeyDown={item.onInputKeyDown}
            />
          </InputWrapper>
        </Col>
      ) : (
        <Col flex={1}>
          <Title>{item.name || 'I am a hard core TODo'}</Title>
        </Col>
      )}
    </Row>
  )
})
