import {Grain} from './grain'

const log = require('nanologger')('grain.test')


// noinspection SpellCheckingInspection
jest.mock('nanoid', () => jest.fn(() => 'BitYkpcz~i4qTWDlMgGbS'))
jest.spyOn(Date, "now").mockImplementation(() => 1527958482904)

beforeEach(() => {
  jest.resetModules()
})

describe('Grain', function() {
  test('should get created without any arguments', function() {

    // Date.now = jest.fn(() => 1527958482904)
    log.debug(Grain.create())
    expect(Grain.create()).toMatchSnapshot()
  })
})
