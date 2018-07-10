/*eslint-disable*/
import React from 'react'
import styled from 'styled-components'
import {cx as cn} from 'ramda-extension'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export const CenterLayout = styled.div.attrs({
  className: 'center mw7',
})``

export const RootContainer = styled.div.attrs({
  className: 'sans-serif f5 lh-solid',
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
  className: ({m = 'mh0 mh3-ns'}) => cn(paperCN, m),
})``

export const ListItem = styled.div.attrs({
  className: ({p = 'ph3 pv2'}) => cn('bb bw1 b--black-05', p),
})`
  :last-child {
    border-width: 0;
  }
  min-height: 42px;
`

export const Button = styled.button.attrs({
  className:
    'input-reset link mr2 blue inline-flex pointer b--light-silver',
})`
  user-select: none;
`
export const Link = styled.a.attrs({
  className: 'input-reset link mr2 blue inline-flex pointer',
})``
