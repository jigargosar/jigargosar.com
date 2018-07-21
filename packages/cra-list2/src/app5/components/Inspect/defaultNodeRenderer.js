import {
  ObjectName,
  ObjectRootLabel,
  ObjectValue,
} from 'react-inspector'
import React from 'react'
import PropTypes from 'prop-types'

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

export const defaultNodeRenderer = ({
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
