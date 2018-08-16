export function targetRole(e) {
  return e.target.getAttribute('role')
}

export function isTargetRoleButton(e) {
  return 'button' === targetRole(e)
}
