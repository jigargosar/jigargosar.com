import React from 'react'
import store from './store'
import {observer} from './lib/little-react'

const StoreContext = React.createContext(store)
const StoreContentConsumer = StoreContext.Consumer

export function withStore(BaseComponent) {
  const BaseComponentObserver = observer(BaseComponent)
  return function withStore(props) {
    return (
      <StoreContentConsumer>
        {store => <BaseComponent {...props} store={store} />}
      </StoreContentConsumer>
    )
  }
}

export function StoreContextProvider({children}) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  )
}
