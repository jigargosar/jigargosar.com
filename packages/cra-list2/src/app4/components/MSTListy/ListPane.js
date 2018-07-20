import {Box, Btn, Row, withClassNames} from '../ui/tui'
import {cn} from '../utils'
import {_} from '../../little-ramda'
import React from 'react'
import {Delete} from '@material-ui/icons'
import {defaultProps, mapProps} from '../recompose-utils'

export const ListPane = withClassNames(
  cn(
    'w-100 w-50-m w-third-l fl',
    'pv1',
    'bg-white',
    'bb br b--moon-gray',
  ),
)(Box)

const kindCn = {
  button: ['link', 'black-80 hover-black hover-bg-black-10'],
  selected: ['link', 'black bg-black-10'],
  header: '',
}
const ListPaneItem = _.compose(
  defaultProps({
    tabIndex: 0,
    kind: 'button',
  }),
  mapProps(({className, kind, ...other}) => ({
    className: cn('w-100 ph2', kindCn[kind], className),
    ...other,
  })),
)(Row)

const ListPaneItemText = _.compose(
  defaultProps({
    pv: 2,
    ph: 2,
  }),
  withClassNames('flex-auto'),
)(Row)

function ListPaneItemSecondaryAction({className, Icon, ...others}) {
  return (
    <Btn
      className={cn(
        'mr1',
        'f4 black-60 hover-black-80 grow',
        className,
      )}
      {...others}
    >
      <Icon fontSize={'inherit'} />
    </Btn>
  )
}

ListPane.Item = ListPaneItem

ListPane.ItemText = ListPaneItemText

ListPane.ItemSecondaryAction = ListPaneItemSecondaryAction

export function renderDeleteIcon(onClick) {
  return (
    <ListPane.ItemSecondaryAction Icon={Delete} onClick={onClick} />
  )
}
