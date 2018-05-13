import Typography from 'typography'
import fairyGateTheme from 'typography-theme-fairy-gates'

const typography = new Typography(fairyGateTheme)

if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const {rhythm} = typography
