import React from 'react'
import store from './mst-models/store'
import {observer} from './lib/little-react'
import {mergeAll} from './lib/exports-ramda'

const StoreContext = React.createContext(store)
const StoreContentConsumer = StoreContext.Consumer

export const withStore = BaseComponent => {
  const ObserverBaseComponent = observer(BaseComponent)
  return function withStoreProps(props) {
    return (
      <StoreContentConsumer>
        {store => (
          <ObserverBaseComponent {...mergeAll([{store}, props])} />
        )}
      </StoreContentConsumer>
    )
  }
}

export function StoreContextProvider({children}) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  )
}
