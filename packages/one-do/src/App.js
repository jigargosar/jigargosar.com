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
              <ListNames store={store} />
            </aside>
            <div
              className={cn(
                'flex-auto overflow-scroll',
                'ba b--moon-gray',
              )}
            >
              <Tasks store={store} />
            </div>
          </main>
        </div>
      </FocusTrap>
    )
  }
}

@observer
class ListNames extends Component {
  render({store} = this.props) {
    return (
      <Fragment>
        <h3 className={cn('ma2', 'flex items-center')}>
          <div className={cn('flex-auto')}>My Lists</div>
          <Btn onClick={wrapSP(() => store.addList({name: 'foo'}))}>
            ADD
          </Btn>
        </h3>
        {store.lists.map(l => (
          <Fragment key={l.id}>
            <div
              className={cn(
                'pa2',
                'flex items-center ttu',
                store.isSelected(l) ? 'bg-black-10' : '',
              )}
              onClick={wrapSP(() => store.selectList(l))}
            >
              <div className={cn('flex-auto')}>{l.name}</div>
              <Btn
                onClick={wrapSP(() => store.deleteList(l))}
                disabled={!store.canDelete}
              >
                X
              </Btn>
            </div>
          </Fragment>
        ))}
      </Fragment>
    )
  }
}
@observer
class Tasks extends Component {
  render({store} = this.props) {
    const list = store.selectedList
    return (
      <Fragment>
        <div className={cn('pa2')}>
          <Btn onClick={wrapSP(() => list.add({name: 'task foo'}))}>
            ADD
          </Btn>
        </div>
        {list.tasks.map(t => (
          <Fragment key={t.id}>
            <div
              className={cn(
                'pa2',
                'flex items-center',
                // store.isSelected(t) ? 'bg-black-10' : '',
              )}
              // onClick={wrapSP(() => store.selectList(t))}
            >
              <div className={cn('flex-auto')}>{t.name}</div>
              <Btn onClick={wrapSP(() => list.delete(t))}>X</Btn>
            </div>
          </Fragment>
        ))}
      </Fragment>
    )
  }
}
