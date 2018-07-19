import {Box, Row, withClassNames} from '../ui/tui'
import {cn} from '../utils'
import {_} from '../../little-ramda'
import * as rc from 'recompose'

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

ListPane.Item = ListPaneItem
ListPane.Item.Text = ListPaneItemText
