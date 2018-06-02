import {Grain} from '../grains-store'

const log = require('nanologger')('grain.test')

// noinspection SpellCheckingInspection
jest.mock('nanoid', () => jest.fn(() => 'BitYkpcz~i4qTWDlMgGbS'))
jest.spyOn(Date, 'now').mockImplementation(() => 1527958482904)

beforeEach(() => {
  jest.resetModules()
})

describe('Grain', function() {
  test('should get created without any arguments', function() {
    const grain = Grain.create()
    expect(grain).toMatchSnapshot()
    expect(grain.getText()).toEqual('')
    grain.userPatchProps({text: 'foo'})
    expect(grain.getText()).toEqual('foo')
  })
  test('should have text prop', function() {
    const grain = Grain.create()
    expect(grain.getText()).toEqual('')
    grain.userPatchProps({text: 'foo'})
    expect(grain.getText()).toEqual('foo')
  })
})
