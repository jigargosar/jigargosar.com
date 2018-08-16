export function targetRole(e) {
  return e.target.getAttribute('role')
}

export function targetTagName(e) {
  return e.target.tagName
}

export function isTargetRoleButton(e) {
  // console.log(`isTargetTagButton(e)`, isTargetTagButton(e))
  console.log(`e.target`, e.target)
  console.log(`e.target`, e.target.tagName)
  return 'button' === targetRole(e)
}

export function isTargetTagButton(e) {
  return 'BUTTON' === targetTagName(e)
}
