import React, {Fragment} from 'react'
import {Link} from 'react-router-dom'
import {renderKeyedByProp} from '../src/app5/components/utils'
import {Inspector} from '../src/little-exports'
import {SidebarLayout} from '@compositor/x0/components'

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
  render() {
    const {render, routes} = this.props
    console.debug(`this.props`, this.props)

    return (
      <Fragment>
        <SidebarLayout {...this.props} title={'Listy X0X0'}>
          {render()}
        </SidebarLayout>
        {renderKeyedByProp(NavLink, 'route', 'path', routes)}
        <Inspector data={this.props} expandLevel={1} />
        {/*<Inspector data={this.props.render()} expandLevel={1} />*/}
        {render()}
      </Fragment>
    )
  }
}
console.clear()
