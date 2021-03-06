import {observer} from 'mobx-react'
import React, {Component} from 'react'
import {wrapDisplayName} from 'recompose'
import {Disposers} from './little-mobx'
import {pick} from 'ramda'

export const disposable = module => BaseComponent =>
  observer(
    class Disposable extends Component {
      static displayName = wrapDisplayName(BaseComponent, 'Disposable')
      disposers = Disposers(module)

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
