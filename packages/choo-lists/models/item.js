export function updateText(text, item) {
  item.text = text
  return item
}

const nanoid = require('nanoid')
const faker = require('faker')
faker.seed(123)

export function createNew() {
  return {
    id: nanoid(),
    text: `${faker.lorem.words()}`,
  }
}

export function text(item) {
  return item.text
}

export function id(item) {
  return item.id
}
