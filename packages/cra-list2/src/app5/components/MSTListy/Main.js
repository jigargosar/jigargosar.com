/* eslint-disable no-func-assign*/
import PropTypes from 'prop-types'
import React, {Fragment} from 'react'
import {StyleRoot} from '../styled'
import {whenKey, withKeyEvent} from '../utils'
import {Dashboard} from './Dashboard'
import {oInject} from './utils'
import {_} from '../../little-ramda'
import {
  Inspector,
  ObjectName,
  ObjectRootLabel,
  ObjectValue,
} from 'react-inspector'
import {Domain} from '../../mst/listy-stores/collection-stores'
// import {Domain} from '../../mst/listy-stores/collection-stores'

class KeyboardShortcuts extends React.Component {
  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = e => {
    const store = this.props.store
    return withKeyEvent(
      whenKey('d')(store.onDeleteSelected),
      whenKey('down')(store.onSelectNext),
      whenKey('up')(store.onSelectPrev),
    )(e)
  }
  render() {
    return null
  }
}

const ObjectLabel = ({name, data, isNonenumerable}) => {
  const object = data

  return (
    <span>
      <ObjectName name={name} dimmed={isNonenumerable} />
      <span>: </span>
      {typeof object === 'function' ? (
        object.toString()
      ) : (
        <ObjectValue object={object} />
      )}
    </span>
  )
}

ObjectLabel.propTypes = {
  data: PropTypes.any,
  isNonenumerable: PropTypes.bool,
  name: PropTypes.any,
}

ObjectLabel.defaultProps = {
  isNonenumerable: false,
}

const defaultNodeRenderer = ({
  depth,
  name,
  data,
  isNonenumerable,
}) => {
  console.log(`data`, data)

  return depth === 0 ? (
    <ObjectRootLabel name={name} data={data} />
  ) : (
    <ObjectLabel
      name={name}
      data={data}
      isNonenumerable={isNonenumerable}
    />
  )
}

function INS() {
  return (
    <Fragment>
      <Inspector
        name={'Domain'}
        data={Domain}
        showNonenumerable
        expandLevel={2}
        nodeRenderer={defaultNodeRenderer}
      />
      <Inspector
        expandLevel={1}
        data={{
          a1: 1,
          a2: 'A2',
          a3: true,
          a4: undefined,
          a5: {
            'a5-1': null,
            'a5-2': ['a5-2-1', 'a5-2-2'],
            'a5-3': {},
          },
          a6: function() {
            console.log('hello world')
          },
          a7: new Date('2005-04-03'),
        }}
        nodeRenderer={defaultNodeRenderer}
      />
    </Fragment>
  )
}

function ListyMain({store}) {
  return (
    <StyleRoot>
      <KeyboardShortcuts store={store} />
      <Dashboard dashboard={store} />
      <INS />
    </StyleRoot>
  )
}

export default oInject(_.identity)(ListyMain)
