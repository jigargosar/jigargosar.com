import {Grain, GrainsStore} from '../grains-store'
import {getSnapshot, getType} from 'mobx-state-tree'
import {inspect} from 'util'

const R = require('ramda')
const RA = require('ramda-adjunct')

const assert = require('assert')
const log = require('nanologger')('grain.test')

const serializedGrain = (overrides = {}) =>
  R.merge(
    {
      createdAt: expect.any(Number),
      modifiedAt: expect.any(Number),
      id: expect.any(String),
      deleted: false,
      text: '',
    },
    overrides,
  )
const serialize = R.compose(R.clone, getSnapshot)

describe('Grain', () => {
  describe('.create()', () => {
    it('should return MST Node of type Grain', () => {
      const grain = Grain.create()
      expect(getType(grain)).toEqual(Grain)
    })

    it('should have empty text', function() {
      const grain = Grain.create()
      expect(grain.getText()).toEqual('')
    })
  })
  describe('.userPatchProps', function() {
    it(`should be able update 'text'`, function() {
      const grain = Grain.create()
      grain.userPatchProps({text: 'foo'})
      expect(grain.getText()).toEqual('foo')
    })
  })
})

describe('GrainStore', function() {
  describe('.create()', function() {
    it('should return MST Node of type GrainStore', function() {
      const grainStore = GrainsStore.create()
      expect(getType(grainStore)).toBe(GrainsStore)
    })
  })

  describe('.put', function() {
    it('should create new grain with text prop', function() {
      const grainStore = GrainsStore.create()
      grainStore.put({text: 'lol'})
      const list = grainStore.getList()
      expect(list.length).toBe(1)
      expect(list[0]).toEqual(serializedGrain({text: 'lol'}))
    })
  })

  describe('.putAll', function() {
    it('should add Array of grains with text prop', function() {
      const grainStore = GrainsStore.create()
      grainStore.putAll([{text: 'lol'}])
      const list = grainStore.getList()
      expect(list.length).toBe(1)
      expect(list[0]).toEqual(serializedGrain({text: 'lol'}))
    })
  })

})
