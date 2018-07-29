import {componentFromProp, compose, defaultProps} from 'recompose'
import {merge} from 'ramda'

export const cfp = dp =>
  compose(
    defaultProps(merge({comp: 'div'}, dp)),
    componentFromProp('comp'),
  )
