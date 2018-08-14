import React from 'react'
import store from './mst-models/store'
import {observer} from './lib/little-react'
import {always, mergeAll} from './lib/ramda'

const StoreContext = React.createContext(store)
const StoreContentConsumer = StoreContext.Consumer

export const withStoreProps = propsFn => BaseComponent => {
  const BaseComponentObserver = observer(BaseComponent)
  return function withStore(props) {
    return (
      <StoreContentConsumer>
        {store => (
          <BaseComponentObserver
            {...mergeAll([{store}, props, propsFn(store, props)])}
          />
        )}
      </StoreContentConsumer>
    )
  }
}
export const withStore = withStoreProps(always({}))

export function StoreContextProvider({children}) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  )
}
