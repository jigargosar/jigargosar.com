const nanoid = require('nanoid')
const faker = require('faker')
faker.seed(123)

export function createNew() {
  const id = nanoid()
  return {
    id,
    text: `${faker.lorem.words()} (id:${id})`,
  }
}

export function text(item) {
  return item.text
}

export function id(item) {
  return item.id
}
