import {observer} from './little-react'
import React, {Component} from 'react'
import {wrapDisplayName} from './recompose'
import {autorun, Disposers, reaction} from './little-mst'
import {compose} from './ramda'

export const disposable = BaseComponent =>
  observer(
    class Disposable extends Component {
      static displayName = wrapDisplayName(BaseComponent, 'Disposable')
      disposers = Disposers()
      addDisposer = disposer => {
        this.disposers.push(disposer)
        return disposer
      }
      autorun = (...a) => compose(this.addDisposer, autorun)(...a)
      reaction = (...a) => compose(this.addDisposer, reaction)(...a)

      componentWillUnmount() {
        this.disposers.dispose()
      }

      render() {
        return (
          <BaseComponent
            addDisposer={this.addDisposer}
            autorun={this.autorun}
            reaction={reaction}
            {...this.props}
          />
        )
      }
    },
  )
