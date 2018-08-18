export function targetRole(e) {
  return e.target.getAttribute('role')
}

export function targetTagName(e) {
  return e.target.tagName
}

export function isTargetRoleButton(e) {
  return 'button' === targetRole(e)
}

export function isTargetTagButton(e) {
  return 'BUTTON' === targetTagName(e)
}

export function isTargetButton(e) {
  return isTargetTagButton(e) || isTargetRoleButton(e)
}
export function isTargetAnyInput(e) {
  return (
    isTargetRoleButton(e) ||
    ['BUTTON', 'INPUT', 'TEXTAREA'].includes(targetTagName(e))
  )
}

export function tryFocusDOMId(id) {
  const el = document.getElementById(id)
  if (el) {
    el.focus()
  } else {
    console.warn('[focus] id not found', id)
  }
}

export function clearLSAndReload() {
  localStorage.clear()
  window.location.href = `${window.location.href}`
}
