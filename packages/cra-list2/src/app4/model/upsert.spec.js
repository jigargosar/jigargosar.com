import {upsert} from './upsert'
import {_} from '../utils'

describe('upsert', function() {
  it('should not throw', function() {
    const rc = upsert({}, {name: 'foo'}, [])
    expect(upsert.displayName).toBe('upsert')
    expect(upsert.length).toBe(3)
  })
  const fooItem = {name: 'foo'}
  it('should insert obj in empty arr', function() {
    const rc = upsert({}, fooItem, [])
    expect(rc).toEqual([{name: 'foo'}])
  })

  const addIdConfig = {
    mapBeforeUpsert: item => {
      return _.merge(item, {id: 1})
    },
    equals: _.eqProps('id'),
  }

  it('should apply mapBeforeUpsert on obj', function() {
    // pending('it fails')
    const rc = upsert(addIdConfig, fooItem, [])
    expect(rc).toEqual([{id: 1, name: 'foo'}])
  })

  it('should not add duplicates', function() {
    // pending('it fails')
    const rc = _.compose(
      upsert(addIdConfig, fooItem),
      upsert(addIdConfig, fooItem),
    )([])
    expect(rc).toEqual([{id: 1, name: 'foo'}])
  })
})
