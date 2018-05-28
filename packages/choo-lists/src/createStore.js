function createStore(opts) {
  var {namespace, initialState, events} = opts || {}

  if (!namespace) throw new Error('namespace required')
  if (!initialState) throw new Error('initialState required')
  if (!events) throw new Error('events required')
  var storeName = `${namespace}Store`

  var props = Object.assign({}, opts, {actions: {}})

  // API ref: https://github.com/choojs/choo#appusecallbackstate-emitter-app
  function store(state, emitter, app) {
    state[namespace] = Object.assign({}, initialState)
    state.events[namespace] = {}

    // add reset event if undefined
    if (!props.events.reset) {
      props.events.reset = ({data, store, emitter}) => {
        var {render} = data || {}
        state[namespace] = Object.assign({}, initialState)
        if (render) emitter.emit('render')
      }
    }

    function render() {
      emitter.emit(state.events.RENDER)
    }

    props.actions.render = render
    Object.keys(events).forEach(event => {
      var eventName = `${storeName}:${event}`

      // attach events to emitter
      emitter.on(eventName, data => {
        events[event]({
          data,
          store: state[namespace],
          emitter,
          state,
          app,
          actions: props.actions,
          render,
        })
      })

      // add event names to state.events
      state.events[eventName] = eventName

      // add action method
      props.actions[event] = data => emitter.emit(eventName, data)
    })

    const domContentLoadedAction = props.actions['DOMContentLoaded']
    if (domContentLoadedAction) {
      emitter.on('DOMContentLoaded', () => {
        domContentLoadedAction()
      })
    }
  }

  Object.assign(store, props)
  store.storeName = storeName
  return store
}

module.exports = createStore
