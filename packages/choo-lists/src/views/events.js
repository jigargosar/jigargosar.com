const R = require('ramda')

export const updateTitle = R.curry(function updateTitle(
  TITLE,
  state,
  emit,
) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
})
