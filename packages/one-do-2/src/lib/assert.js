export function assert(bool, msg) {
  if (!Boolean(bool)) {
    throw new Error(`Assertion Failed: ${msg}`)
  }
}
