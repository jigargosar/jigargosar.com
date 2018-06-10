import firebase from 'firebase/app'

const log = require('nanologger')('UpdateFirestore')
const R = require('ramda')

function hasLocalAppActorId({pdbDoc, localAppActorId}) {
  return R.equals(pdbDoc.actorId, localAppActorId)
}

const isRemotelyModifiedDoc = R.complement(hasLocalAppActorId)

function docRef({pdbDoc, collectionRef}) {
  return collectionRef.doc(pdbDoc._id)
}

function runTransaction(fn, {collectionRef}) {
  return collectionRef.firestore.runTransaction(fn)
}

function getDocForFirestore({pdbDoc}) {
  log.trace('getDocForFirestore')
  return R.compose(R.merge(pdbDoc))({
    _rev: null,
    fireStoreServerTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
  })
}

function setPouchDoc(transaction, dependencies) {
  return transaction.set(docRef, getDocForFirestore(dependencies))
}

function isNewerThanPouchDoc(fireDoc, {pdbDoc}) {
  return fireDoc.modifiedAt > pdbDoc
}

function updateEmptyDoc(transaction, dependencies) {
  log.debug('empty transaction update')
  return transaction.update(docRef(dependencies), {})
}

export async function updateFirestoreFromPDBChange(dependencies) {
  log.debug('updateFirestoreFromPouchDoc', dependencies.pdbDoc)
  if (isRemotelyModifiedDoc(dependencies)) return

  return runTransaction(async transaction => {
    const snapshot = await transaction.get(docRef(dependencies))
    log.debug('snapshot', snapshot)
    if (!snapshot.exists) {
      return setPouchDoc(transaction, dependencies)
    }
    const fireDoc = snapshot.data()
    if (isNewerThanPouchDoc(fireDoc, dependencies)) {
      return updateEmptyDoc(transaction, dependencies)
    }

    throw new Error('Abort Transaction')
  }, dependencies)
}
