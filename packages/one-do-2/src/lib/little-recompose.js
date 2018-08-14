import {lifecycle} from './recompose'

export function afterMountAndUpdate(fn) {
  return lifecycle({
    componentDidMount() {
      fn(this.props, this)
    },
    componentDidUpdate() {
      fn(this.props, this)
    },
  })
}
