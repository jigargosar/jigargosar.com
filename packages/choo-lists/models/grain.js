const R = require('ramda')
const nanoid = require('nanoid')

const faker = require('faker')
faker.seed(123)

export function createNew({text} = {}) {
  return {
    id: `grain-${nanoid()}`,
    text: R.isNil(text) ? `${faker.lorem.words()}` : text,
  }
}

export function updateText(text, grain) {
  return R.assoc('text', text, grain)
}

export function text(grain) {
  return grain.text
}

export function id(grain) {
  return grain.id
}
