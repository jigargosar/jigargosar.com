/*eslint-disable*/
import React from 'react'
import styled from 'styled-components'
import {cx as cn} from 'ramda-extension'
import {PropTypes} from '../utils'
import {Add, AddCircleOutline, Edit, Error, ModeEdit} from '@material-ui/icons'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export {Error, Add, Edit, ModeEdit, AddCircleOutline}

export const CenterLayout = styled.div.attrs({
  className: 'center mw7',
})``

export const Title = styled.div.attrs({
  className: 'f4 lh-title mh3',
})``

export const Section = styled.div.attrs({
  className: 'mv3',
})``

export const Text = styled.span.attrs({
  className: 'mr2',
})``

const paperCN = 'bg-white shadow-1 ma0 ns-ma3'
export const Paper = styled.div.attrs({
  className: paperCN,
})``

export const List = styled.div.attrs({
  className: ({m = 'mh0 mh3-ns', shadow = 'shadow-1'}) =>
    cn('bg-white ', m, shadow),
})``

export const ListItem = styled.div.attrs({
  className: ({p = 'ph3 pv2', b = 'bb bw1 b--black-05'}) =>
    cn(b, p, 'debug_'),
})`
  :last-child {
    border-width: 0;
  }
  //min-height: 42px;
`

export const Btn = styled.button.attrs({
  className: ({disabled}) =>
    cn('button-reset link mr2 inline-flex b--light-silver', {
      'pointer blue': !disabled,
      'light-silver': disabled,
    }),
})`
  user-select: none;
`

Btn.propTypes = {
  onClick: PropTypes.func,
}

export const Lnk = styled.a.attrs({
  className: ({color = 'blue', m = 'mr2'}) =>
    cn('input-reset link inline-flex pointer', color),
})``
