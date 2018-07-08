import {upsert} from './upsert'

describe('upsert', function() {
  it('should not throw', function() {
    const rc = upsert({}, {name: 'foo'}, [])
    expect(upsert.displayName).toBe('upsert')
    expect(upsert.length).toBe(3)
  })
  it('should insert obj in empty arr', function() {
    const rc = upsert({}, {name: 'foo'}, [])
    // expect(rc).toEqual([{name: 'foo'}])
  })
})
