import {observer} from './little-react'
import React, {Component} from 'react'
import {wrapDisplayName} from './recompose'
import {Disposers} from './little-mobx'
import {pick} from './exports-ramda'

/**
 * @deprecated
 * */
export const disposable = BaseComponent =>
  observer(
    class Disposable extends Component {
      static displayName = wrapDisplayName(BaseComponent, 'Disposable')
      disposers = Disposers()

      componentWillUnmount() {
        this.disposers.dispose()
      }

      render() {
        return (
          <BaseComponent
            {...pick([
              'addDisposer',
              'autorun',
              'reaction',
              'setInterval',
            ])(this.disposers)}
            disposers={this.disposers}
            {...this.props}
          />
        )
      }
    },
  )
