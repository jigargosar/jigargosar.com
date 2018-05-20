const faker = require('faker')
faker.seed(123)

let nextId = 1

exports.createFakeNote = function createFakeNote() {
  const note = {
    id: `${nextId}`,
    title: faker.lorem.words(),
    body: faker.lorem.text(),
  }
  nextId++
  return note
}
