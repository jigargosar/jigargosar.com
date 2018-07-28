/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {PropTypes, renderKeyedById} from '../utils'
import {observer} from 'mobx-react'
import {dpFlexRow, preWrapCSS, system} from '../little-rebass'
import {BucketItem} from './BucketItem'
import {onModelBlur} from '../../mst/listy-stores/view-helpers'
import {onModelFocus} from '../../mst/listy-stores/view-helpers'
import {InputWrapper} from './InputWrapper'
import {Input} from './Input'

const BucketItems = observer(function BucketItems({bucket}) {
  return renderKeyedById(BucketItem, 'item', bucket.children)
})

BucketItems.propTypes = {
  bucket: PropTypes.shape({
    children: PropTypes.array.isRequired,
  }).isRequired,
}

const Header = system({
  ...dpFlexRow,
  mb: 2,
  pl: 1,
  colors: 'dim',
  variant: 'default',
  tabIndex: 0,
  textStyle: 'bucketTitle',
})

const Title = system({
  flex: 1,
  css: preWrapCSS,
})

export const Bucket = observer(function Bucket({bucket}) {
  return (
    <Fragment>
      <Header
        id={bucket.headerDOMId}
        onKeyDown={bucket.onHeaderKeydown}
        onFocus={onModelFocus(bucket)}
        onBlur={onModelBlur(bucket)}
        variant={bucket.isEditing ? 'selected' : 'default'}
      >
        {bucket.isEditing ? (
          <InputWrapper>
            <Input
              value={bucket.name}
              onBlur={bucket.onInputBlur}
              onChange={bucket.onNameChange}
              onKeyDown={bucket.onInputKeyDown}
            />
          </InputWrapper>
        ) : (
          <Title>
            {bucket.name || 'I am a Bucket Short and Stout'}
          </Title>
        )}
      </Header>
      <BucketItems bucket={bucket} />
    </Fragment>
  )
})
