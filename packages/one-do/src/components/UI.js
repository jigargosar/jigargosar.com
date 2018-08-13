import {setDisplayName, withProps} from 'recompose'
import cn from 'classnames'
import {compose} from 'ramda'

const withMergedCN = (...cns) =>
  withProps(({className}) => ({className: cn(className, ...cns)}))

export const FlexRow = compose(
  setDisplayName('FlexRow'),
  withMergedCN('frc'),
)('div')
