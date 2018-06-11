import firebase from 'firebase/app'

const log = require('nanologger')('UpdateFirestore')
const R = require('ramda')

function isLocallyModified(doc, appActorId) {
  return R.equals(doc.actorId, appActorId)
}

const isRemotelyModified = R.complement(isLocallyModified)

function getDocRef(doc, cRef) {
  return cRef.doc(doc._id)
}

function runTransaction(fn, cRef) {
  return cRef.firestore.runTransaction(fn)
}

function docToFirestoreData(doc) {
  const firestoreData = R.merge(doc, {
    _rev: null,
    fireStoreServerTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
  })
  log.trace('docToFirestoreData', doc, firestoreData)
  return firestoreData
}

function transactionSet(docRef, data, transaction) {
  log.debug('transactionSet', data)
  return transaction.set(docRef, data)
}

function isNewer(fireData, doc) {
  return fireData.modifiedAt > doc.modifiedAt
}

function transactionUpdateEmpty(docRef, transaction) {
  log.debug('transactionUpdateEmpty')
  return transaction.update(docRef, {})
}
function transactionUpdate(docRef, data, transaction) {
  log.debug('transactionUpdate', data)
  return transaction.update(docRef, data)
}

// function transactionSetInHistoryCollection(docRef, doc, transaction) {
//   log.debug('transactionSetInHistoryCollection')
//   transaction.set(
//     docRef.collection('history').doc(`${doc.modifiedAt}`),
//     doc,
//   )
// }

// function incrementVersion(data) {
//   const version = data.version + 1
//   log.debug('incrementVersion to:', version, 'from:', data.version)
//   return R.merge(data, {version})
// }

function shouldIgnoreFirebaseUpdate(doc) {
  return doc.ignoreFirebaseUpdate
}

export async function updateFirestoreFromPouchDoc({
  doc,
  appActorId,
  cRef,
}) {
  log.debug('updateFirestoreFromPouchDoc', doc)
  if (shouldIgnoreFirebaseUpdate(doc)) return
  if (isRemotelyModified(doc, appActorId)) return

  return runTransaction(async transaction => {
    const docRef = getDocRef(doc, cRef)
    const snapshot = await transaction.get(docRef)
    if (!snapshot.exists) {
      return transactionSet(
        docRef,
        docToFirestoreData(doc),
        transaction,
      )
    }
    const fireData = snapshot.data()
    log.debug('fireData', fireData)

    if (isNewer(fireData, doc)) {
      return transactionUpdateEmpty(docRef, transaction)
    }

    if (isRemotelyModified(fireData, appActorId)) {
      // transactionSetInHistoryCollection(docRef, fireData, transaction)
    }

    return transactionUpdate(
      docRef,
      docToFirestoreData(doc),
      transaction,
    )
  }, cRef)
}
