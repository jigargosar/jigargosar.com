import React, {Component, Fragment} from 'react'
import store from './store'
import {cn, FocusTrap, observer} from './lib/little-react'
import EventListener from 'react-event-listener'

@observer
class App extends Component {
  render() {
    return <View store={store} />
  }
}

export default App

@observer
class View extends Component {
  render({store} = this.props) {
    return (
      <FocusTrap focusTrapOptions={{fallbackFocus: document}}>
        <EventListener target={'document'} onKeyDown={store.onKeyDown} />
        <div className={cn('vh-100 overflow-hidden', 'flex flex-column')}>
          <header className={cn('w-100')}>
            <h1>One Do</h1>
          </header>
          <main className={cn('flex-auto overflow-hidden', 'flex')}>
            <aside
              className={cn(
                'w-33 overflow-scroll',
                'ba br-0 b--moon-gray',
              )}
            >
              <h3 className={cn('ma2')}>My Lists</h3>
              {store.taskLists.map(l => (
                <Fragment key={l.id}>
                  <div className={cn('pa2')}>{l.name}</div>
                </Fragment>
              ))}
            </aside>
            <div className={cn('flex-auto flex', 'ba b--moon-gray')}>
              task list
            </div>
          </main>
        </div>
      </FocusTrap>
    )
  }
}
