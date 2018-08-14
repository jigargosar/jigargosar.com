import {mapProps, setDisplayName, withProps} from 'recompose'
import cn from 'classnames'
import {compose} from 'ramda'

const withMergedClassName = (...cns) =>
  withProps(({className}) => ({className: cn(className, ...cns)}))

const withCN = compose(
  setDisplayName('withCN'),
  mapProps(({cn: cnArray = [], className, ...other}) => ({
    className: cn(className, ...cnArray),
    ...other,
  })),
)

export const FlexRow = compose(
  setDisplayName('FlexRow'),
  withCN,
  withMergedClassName('frc'),
)('div')

FlexRow.propTypes = {}

export const Div = withCN('div')

Div.propTypes = {}
