import {componentFromProp, compose, defaultProps} from 'recompose'
import {merge} from 'ramda'
import {observer} from './little-react'
import React, {Component} from 'react'
import {wrapDisplayName} from './recompose'
import {autorun, Disposers} from './little-mst'

export const cfp = dp =>
  compose(
    defaultProps(merge({comp: 'div'}, dp)),
    componentFromProp('comp'),
  )
export const disposable = BaseComponent =>
  observer(
    class Disposable extends Component {
      static displayName = wrapDisplayName(BaseComponent, 'Disposable')
      disposers = Disposers()
      addDisposer = disposer => this.disposers.push(disposer)
      autorun = (view, opts = {}) => this.addDisposer(autorun(view, opts))

      componentWillUnmount() {
        this.disposers.dispose()
      }

      render() {
        return (
          <BaseComponent
            addDisposer={this.addDisposer}
            autorun={this.autorun}
            {...this.props}
          />
        )
      }
    },
  )
