import {_} from '../../little-ramda'
import {inject, observer} from 'mobx-react'

export const oInject = fn =>
  _.compose(
    inject(({store: {store}}, props) => fn({store}, props)),
    observer,
  )
