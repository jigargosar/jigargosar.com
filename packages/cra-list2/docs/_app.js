import React, {Fragment} from 'react'
import {Link} from 'react-router-dom'
import {R} from '../src/app5/little-ramda'
import {
  renderKeyed,
  renderKeyedByProp,
} from '../src/app5/components/utils'
import {Inspector} from '../src/little-exports'

function NavLink({route: {path, name}}) {
  return (
    <div>
      <Link key={path} to={path}>
        {name}
      </Link>
    </div>
  )
}

export default class extends React.Component {
  state = {
    count: 0,
  }

  update = fn => this.setState(fn)

  render() {
    const {render, routes} = this.props
    console.debug(`this.props`, this.props)

    return (
      <Fragment>
        {renderKeyedByProp(NavLink, 'route', 'path', routes)}
        <Inspector data={this.props} expandLevel={1} />
        {/*<Inspector data={this.props.render()} expandLevel={1} />*/}
        {render({
          ...this.state,
          decrement: () => this.update(s => ({count: s.count - 1})),
          increment: () => this.update(s => ({count: s.count + 1})),
        })}
      </Fragment>
    )
  }
}
console.clear()
