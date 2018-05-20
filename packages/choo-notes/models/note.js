const faker = require('faker')
faker.seed(123)

exports.createFakeNote = function createFakeNote({
  /*modifiedAt*/
} = {}) {
  return {
    title: faker.lorem.words(),
    body: faker.lorem.text(),
    // modifiedAt: modifiedAt || faker.date.recent(),
  }
}
