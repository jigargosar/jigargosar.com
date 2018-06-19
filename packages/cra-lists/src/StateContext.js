/*eslint-disable*/
import React from 'react'
import './index.css'
import {observer, Observer} from 'mobx-react'

const R = require('ramda')

const StateContext = React.createContext(null)

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export const StateProvider = StateContext.Provider

// export const injectState = c => {
//   return R.compose(
//     BaseComponent =>
//       function StateInjector(props) {
//         return (
//           <StateContext.Consumer>
//             {state => (
//               <BaseComponent
//                 {...{
//                   s: state,
//                   fire: state.fire,
//                   auth: state.fire.auth,
//                 }}
//                 {...props}
//               />
//             )}
//           </StateContext.Consumer>
//         )
//       },
//     observer,
//   )(c)
// }

export const M = observer(
  class M extends React.Component {
    render() {
      return (
        <StateContext.Consumer>
          {state => (
            <Observer>
              {() =>
                this.r({
                  s: state,
                  fire: state.fire,
                  auth: state.fire.auth,
                  ...this.props,
                })
              }
            </Observer>
          )}
        </StateContext.Consumer>
      )
    }

    r(props) {
      return props.render ? props.render(this.props) : null
    }
  },
)

export class C extends React.Component {
  render() {
    return this.r(this.props)
  }

  r(props) {
    return props.render ? props.render(this.props) : null
  }
}

export {Observer as O}
