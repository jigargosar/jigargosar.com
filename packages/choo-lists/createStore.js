function createStore(opts) {
  var {storeName, initialState, events} = opts || {}

  if (!storeName) throw new Error('storeName required')
  if (!initialState) throw new Error('initialState required')
  if (!events) throw new Error('events required')

  var props = Object.assign({}, opts, {actions: {}})

  // API ref: https://github.com/choojs/choo#appusecallbackstate-emitter-app
  function store(state, emitter, app) {
    state[storeName] = Object.assign({}, initialState)
    state.events[storeName] = {}

    // add reset event if undefined
    if (!props.events.reset) {
      props.events.reset = ({data, store, emitter}) => {
        var {render} = data || {}
        state[storeName] = Object.assign({}, initialState)
        if (render) emitter.emit('render')
      }

    }
    if (!props.events.render) {
      props.events.render = ({state, emitter}) => {
        emitter.emit(state.events.RENDER)
      }
    }


    Object.keys(events).forEach(event => {
      var eventName = `${storeName}:${event}`

      // attach events to emitter
      emitter.on(eventName, data => {
        events[event]({data, store: state[storeName], emitter, state, app, actions: props["actions"]})
      })

      // add event names to state.events
      state.events[storeName][event] = eventName

      // add action method
      props.actions[event] = data => emitter.emit(eventName, data)
    })

    const domContentLoadedAction = props.actions["DOMContentLoaded"];
    if (domContentLoadedAction) {
      emitter.on("DOMContentLoaded", () => {
        domContentLoadedAction()
      })
    }
  }

  Object.assign(store, props)
  store.storeName = storeName
  return store
}

module.exports = createStore