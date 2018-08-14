import React from 'react'
import store from './mst-models/store'
import {observer} from './lib/little-react'
import {always, compose, mergeAll} from './lib/ramda'
import {setDisplayName, wrapDisplayName} from './lib/recompose'

const StoreContext = React.createContext(store)
const StoreContentConsumer = StoreContext.Consumer

export const withStoreProps = propsFn => BaseComponent => {
  return function withStoreProps(props) {
    return (
      <StoreContentConsumer>
        {store => (
          <BaseComponent
            {...mergeAll([{store}, props, propsFn(store, props)])}
          />
        )}
      </StoreContentConsumer>
    )
  }
}
export const withStore = BaseComponent =>
  compose(
    setDisplayName(wrapDisplayName(BaseComponent, 'withStore')),
    withStoreProps(always({})),
  )(BaseComponent)

export function StoreContextProvider({children}) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  )
}
