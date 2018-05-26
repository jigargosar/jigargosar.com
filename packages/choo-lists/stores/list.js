const assert = require('assert')
const R = require('ramda')
const RA = require('ramda-adjunct')
const log = require('nanologger')('stores:list')
const G = require('../models/grain')
const EM = require('../models/edit-mode')
const yaml = require('js-yaml')
const PouchDB = require('pouchdb-browser')
const LocalStorageItem = require('./local-storage-item')
const PD = require('../models/pouch-db')

const viewLS = LocalStorageItem('choo-list:view', {editMode: EM.idle})

module.exports = store

function store(state, emitter) {
  state.list = R.times(() => G.createNew(), 10)
  state.editMode = EM.idle

  state.events.list_add = 'list:add'
  state.events.list_edit = 'list:edit'
  state.events.list_edit_onTextChanged = 'list:edit:onTextChange'
  state.events.list_edit_onYAMLUpdate = 'list:edit:onYAMLUpdate'
  state.events.list_edit_discard = 'list:edit:discard'
  state.events.list_edit_save = 'list:edit:save'
  state.events.list_delete = 'list:delete'

  function emitRender() {
    emitter.emit(state.events.RENDER)
  }

  emitter.on('DOMContentLoaded', function() {
    const listPD = new PouchDB('choo-list:list')
    const info = async function() {
      log.info('listPD', await listPD.info())
    }
    info().catch(log.error)

    listPD
      .allDocs({include_docs: true})
      .then(
        R.compose(
          R.tap(grains => log.debug('grains', ...grains)),
          R.map(R.compose(G.fromPouchDBDoc, R.prop('doc'))),
          R.tap(rows => log.debug('all docs result', ...rows)),
          R.prop('rows'),
          R.tap(res => log.debug('all docs result', res)),
        ),
      )
      .then(grains => state.list.splice(0, state.list.length, ...grains))
      .then(emitRender)

    Object.assign(state, pickViewState(viewLS.load()))

    emitter.on(state.events.list_add, async function() {
      const newGrainText = prompt('New Grain', 'Get Milk!')
      log.debug('newGrainText', newGrainText)
      if (R.isNil(newGrainText)) return
      const newGrain = G.createNew({text: newGrainText})

      PD.put(G.toPouchDBDoc(newGrain), listPD).then(function(res) {
        log.info('listPD:add:res', res)
        assert(res.ok)
        assert(res.id === G.getId(newGrain))
        const newGrainWithRev = G.setRevision(res.rev, newGrain)
        state.list.unshift(newGrainWithRev)
        // listLS.save(state.list)
        emitRender()
      })
    })

    function dumpYAML(obj) {
      return yaml.dump(obj, {noCompatMode: true, lineWidth: 60})
    }

    emitter.on(state.events.list_edit, function(grain) {
      assert(state.editMode === EM.idle)
      assert(R.isNil(state.editState))
      state.editMode = EM.editing
      state.editState = {
        grainId: G.getId(grain),
        form: R.clone(grain),
        yaml: dumpYAML(grain),
      }
      persistViewState()
      emitRender()
    })

    emitter.on(state.events.list_edit_onTextChanged, function(text) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editState.form.text = text
      state.editState.yaml = dumpYAML(
        R.merge(state.editState.form, {text: R.trim(text)}),
      )

      persistViewState()
      emitRender()
    })

    emitter.on(state.events.list_edit_onYAMLUpdate, function(yamlString) {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))

      state.editState.yaml = yamlString

      const parseYAMLForm = R.compose(
        R.pick(['text']),
        R.tryCatch(yaml.safeLoad, R.always({})),
      )
      const updatedForm = parseYAMLForm(yamlString)
      if (!R.isEmpty(updatedForm)) {
        Object.assign(state.editState.form, updatedForm)
        persistViewState()
        emitRender()
      }
    })

    emitter.on(state.events.list_edit_discard, function() {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))
      state.editMode = EM.idle
      state.editState = null
      persistViewState()
      emitRender()
    })

    emitter.on(state.events.list_edit_save, function() {
      assert(state.editMode === EM.editing)
      assert(!R.isNil(state.editState))

      const grain = R.find(R.propEq('id', state.editState.grainId), state.list)
      assert(!R.isNil(grain))

      const updatedGrain = G.setText(state.editState.form.text, grain)

      listPD.put(G.toPouchDBDoc(updatedGrain)).then(function(res) {
        log.info('listPD:edit_save:res', res)
        assert(res.ok)
        assert(res.id === G.getId(updatedGrain))
        const updatedGrainWithRev = G.setRevision(res.rev, updatedGrain)

        state.list.splice(R.indexOf(grain, state.list), 1, updatedGrainWithRev)

        state.editMode = EM.idle
        state.editState = null
        persistViewState()

        // listLS.save(state.list)
        emitRender()
      })
    })

    emitter.on(state.events.list_delete, function(grain) {
      const deletedGrain = G.setDeleted(grain)

      listPD.put(G.toPouchDBDoc(deletedGrain)).then(res => {
        log.info('listPD:delete:res', res)
        assert(res.ok)
        assert(res.id === G.getId(deletedGrain))

        const idx = R.findIndex(G.eqById(deletedGrain), state.list)
        assert(idx !== -1)
        state.list.splice(idx, 1)
        // listLS.save(state.list)
        emitRender()
      })
    })

    function persistViewState() {
      viewLS.save(pickViewState(state))
    }

    function pickViewState(state) {
      return R.pick(['editState', 'editMode'], state)
    }
  })
}
