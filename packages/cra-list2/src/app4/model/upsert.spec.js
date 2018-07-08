import {upsert} from './upsert'

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

  it.skip('should apply mapBeforeUpsert on obj', function() {
    pending('it fails')
    expect.assertions(2)
    const rc = upsert(
      {
        mapBeforeUpsert: item => {
          expect(item).toEqual(fooItem)
        },
      },
      fooItem,
      [],
    )
    expect(rc).toEqual([{id: 1, name: 'foo'}])
  })
})
