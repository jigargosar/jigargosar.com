export function targetRole(e) {
  return e.target.getAttribute('role')
}

export function targetTagName(e) {
  return e.target.tagName
}

export function isTargetRoleButton(e) {
  console.log(`isTargetTagButton(e)`, isTargetTagButton(e))
  return 'button' === targetRole(e)
}

export function isTargetTagButton(e) {
  return 'BUTTON' === targetTagName(e)
}

export function isTargetButton(e) {
  return isTargetTagButton(e) || isTargetRoleButton(e)
}
