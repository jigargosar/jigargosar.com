/* eslint-disable no-func-assign*/
import React, {Fragment} from 'react'
import {renderKeyedById} from '../utils'
import {Delete, PlaylistAdd} from '@material-ui/icons'
import {observer} from 'mobx-react'
import {Box, Btn, Flex, FlexRow, IconBtn} from '../little-rebass'

const BucketItem = observer(function BucketItem({item}) {
  return (
    <Flex id={item.id} pl={2} onFocus={item.onFocus}>
      {item.text || 'I am a hard core TODo'}
    </Flex>
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
      <Btn id={`add-item-${bucket.id}`} pl={2} width={1}>
        {`Add Item`}
      </Btn>
    </Fragment>
  )
}

Bucket = observer(Bucket)

export {Bucket}
