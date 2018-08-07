import React, {Component, Fragment} from 'react'
import store from './store'
import {cn, FocusTrap, observer, wrapSP} from './lib/little-react'
import EventListener from 'react-event-listener'
import {Btn} from './lib/tachyons-components'

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
              <h3 className={cn('ma2', 'flex items-center')}>
                <div className={cn('flex-auto')}>My Lists</div>
                <Btn onClick={wrapSP(() => store.addList({name: 'foo'}))}>
                  ADD
                </Btn>
              </h3>
              {store.lists.map(l => (
                <Fragment key={l.id}>
                  <div
                    className={cn('pa2', 'flex items-center')}
                    onClick={wrapSP(() => store.setCurrentList(l))}
                  >
                    <div className={cn('flex-auto')}>{l.name}</div>
                    <Btn onClick={wrapSP(() => store.deleteList(l))}>
                      X
                    </Btn>
                  </div>
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
