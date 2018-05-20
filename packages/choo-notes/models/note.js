const faker = require('faker')
faker.seed(123)

var nanoid = require('nanoid')

exports.createFakeNote = function createFakeNote() {
  return {
    id: nanoid(),
    title: faker.lorem.words(),
    body: faker.lorem.text(),
  }
}
