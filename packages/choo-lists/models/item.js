const nanoid = require('nanoid')
const faker = require('faker')
faker.seed(123)

export function create() {
  return {
    text: `${faker.lorem.words()} (id:${nanoid()})`,
  }
}

export function text(item) {
  return item.text
}
