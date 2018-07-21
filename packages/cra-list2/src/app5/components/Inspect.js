import {
  Inspector,
  ObjectName,
  ObjectRootLabel,
  ObjectValue,
} from 'react-inspector'
import PropTypes from 'prop-types'
import React, {Fragment} from 'react'
import {Domain} from '../mst/listy-stores/collection-stores'

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
const defaultNodeRenderer = ({
  depth,
  name,
  data,
  isNonenumerable,
}) => {
  // console.log(`data`, data)

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

export function INS() {
  return (
    <Fragment>
      <Inspector
        name={'Domain'}
        data={Domain}
        // showNonenumerable
        expandLevel={2}
        nodeRenderer={defaultNodeRenderer}
      />
      {/*
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
*/}
    </Fragment>
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
