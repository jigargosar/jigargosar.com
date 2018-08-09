import React, {Component, Fragment} from 'react'
import store from './store'
import {cn, FocusTrap, observer, wrapSP} from './lib/little-react'
import EventListener from 'react-event-listener'
import {Btn} from './lib/tachyons-components'
import {fWord} from './lib/fake'

@observer
class App extends Component {
  render() {
    return <View store={store} />
  }

  componentDidCatch(error, info) {
    console.log(info, error)
    return <div>Error</div>
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
            <h2 className={cn('dib mh2')}>One Do</h2>
            <Btn onClick={() => store.reset()}>reset</Btn>
            <Btn disabled={!store.canSync} onClick={() => store.sync()}>
              {store.isSyncing ? 'syncing' : 'sync'}
            </Btn>
          </header>
          <main className={cn('flex-auto overflow-hidden', 'flex')}>
            <aside
              className={cn(
                'w-33 overflow-scroll',
                'ba br-0 b--moon-gray',
              )}
            >
              <MyLists store={store} />
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
class MyLists extends Component {
  render({store} = this.props) {
    return (
      <Fragment>
        <h3 className={cn('ma2', 'flex items-center')}>
          <div className={cn('flex-auto')}>My Lists</div>
          <Btn onClick={wrapSP(() => store.addList({name: fWord()}))}>
            ADD
          </Btn>
        </h3>
        {store.lists.map(list => (
          <Fragment key={list.id}>
            <ListName store={store} list={list} />
          </Fragment>
        ))}
      </Fragment>
    )
  }
}

@observer
class ListName extends Component {
  render({store, list} = this.props) {
    return (
      <div
        className={cn(
          'pa2',
          'flex items-center ttu',
          store.isSelected(list) ? 'bg-black-10' : '',
        )}
        onClick={wrapSP(() => store.selectList(list))}
        onDoubleClick={wrapSP(() =>
          store.updateList({name: fWord()}, list),
        )}
      >
        <div className={cn('flex-auto', 'flex items-center')}>
          <div>{`${list.name}`}</div>
          <div className={cn('ph1 gray self-start', 'f6')}>
            {`${list.tasks.length}`}
          </div>
        </div>
        {list.isDirty && <div>*</div>}
        <Btn
          onClick={wrapSP(() => store.deleteList(list))}
          disabled={!store.canDeleteList}
        >
          X
        </Btn>
      </div>
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
          <div className={cn('flex-auto')}>
            <input
              className={cn('w-100 pa1 ttu')}
              type="text"
              value={list.name}
              onChange={e =>
                store.updateList({name: e.target.value}, list)
              }
            />
          </div>
          <Btn onClick={wrapSP(() => store.addTask({name: fWord()}))}>
            ADD
          </Btn>
        </div>
        {store.tasks.map(task => (
          <Fragment key={task.id}>
            <div className={cn('pa2', 'flex items-center')}>
              <input
                className={cn('mh2')}
                checked={task.isDone}
                onChange={e =>
                  store.updateTask({isDone: e.target.checked}, task)
                }
                type="checkbox"
              />
              {/*<div className={cn('flex-auto')}>{task.name}</div>*/}
              <div className={cn('flex-auto')}>
                <input
                  className={cn('w-100 pa1')}
                  type="text"
                  value={task.name}
                  onChange={e =>
                    store.updateTask({name: e.target.value}, task)
                  }
                />
              </div>
              {task.isDirty && <div>*</div>}
              <Btn onClick={wrapSP(() => store.deleteTask(task))}>X</Btn>
            </div>
          </Fragment>
        ))}
      </Fragment>
    )
  }
}
