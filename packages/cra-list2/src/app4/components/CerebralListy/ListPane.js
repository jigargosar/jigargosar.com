import {Box, Btn, Row, withClassNames} from '../ui/tui'
import {cn} from '../utils'
import {_} from '../../little-ramda'
import * as rc from 'recompose'
import React from 'react'

export const ListPane = withClassNames(
  cn(
    'w-100 w-50-m w-third-l fl',
    'pv1',
    'bg-white',
    'bb br b--moon-gray',
  ),
)(Box)

const ListPaneItem = _.compose(
  rc.defaultProps({
    tabIndex: 0,
    colors: 'black-80 hover-black hover-bg-black-10',
  }),
  rc.withProps(({className, colors}) => ({
    className: cn('w-100 ph2 link', colors, className),
  })),
)(Row)

const ListPaneItemText = _.compose(
  rc.defaultProps({
    pv: 2,
    ph: 2,
  }),
  withClassNames('flex-auto'),
)(Row)

function ListPaneItemsecondaryAction({className, Icon, ...others}) {
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

ListPane.ItemsecondaryAction = ListPaneItemsecondaryAction
