import {Grain, GrainsStore} from '../grains-store'
import {getSnapshot} from 'mobx-state-tree'

const log = require('nanologger')('grain.test')

// noinspection SpellCheckingInspection
jest.mock('nanoid', () => jest.fn(() => 'BitYkpcz~i4qTWDlMgGbS'))
jest.spyOn(Date, 'now').mockImplementation(() => 1527958482904)

beforeEach(() => {
  jest.resetModules()
})

describe('Grain', function() {
  it('should get created without any arguments', function() {
    const grain = Grain.create()
    expect(grain.toJSON()).toMatchSnapshot()
  })

  it('should have text prop', function() {
    const grain = Grain.create()
    expect(grain.getText()).toEqual('')
    grain.userPatchProps({text: 'foo'})
    expect(grain.getText()).toEqual('foo')
  })
})

describe('GrainStore', function() {
  it('should get created without any arguments', function() {
    const grainStore = GrainsStore.create()
    expect(grainStore.toJSON()).toMatchSnapshot()
  })

  it('should put new grain', function() {
    const grainStore = GrainsStore.create()
    grainStore.put({text: 'lol'})
    expect(grainStore.toJSON()).toMatchSnapshot()
    expect(grainStore.getList().map(getSnapshot)).toMatchSnapshot()
  })

  it('should putAll new grains', function() {
    const grainStore = GrainsStore.create()
    grainStore.putAll([{text: 'lol'}])
    expect(grainStore.toJSON()).toMatchSnapshot()
    expect(grainStore.getList().map(getSnapshot)).toMatchSnapshot()
  })
})
