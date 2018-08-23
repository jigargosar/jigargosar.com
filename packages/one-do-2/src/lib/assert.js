export function assert(bool, msg) {
  if (!Boolean(bool)) {
    debugger
    throw new Error(`Assertion Failed: ${msg || `msg not provided`}`)
  }
}
