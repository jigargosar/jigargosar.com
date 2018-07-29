import {componentFromProp, compose, defaultProps} from 'recompose'

export const cfp = dp =>
  compose(defaultProps(dp), componentFromProp('comp'))
