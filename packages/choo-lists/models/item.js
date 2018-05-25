const R = require('ramda')
const nanoid = require('nanoid')

const faker = require('faker')
faker.seed(123)

export function createNew({text} = {}) {
  return {
    id: nanoid(),
    text: R.isNil(text) ? `${faker.lorem.words()}` : text,
  }
}

export function updateText(text, item) {
  item.text = text
  return item
}

export function text(item) {
  return item.text
}

export function id(item) {
  return item.id
}
