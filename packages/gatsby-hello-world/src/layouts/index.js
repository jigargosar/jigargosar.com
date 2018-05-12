import React from 'react'
import Helmet from 'react-helmet'
import g from 'glamorous'
import {rhythm} from '../utils/typography'
import {Link} from '../components/Link'
import {NavLinks} from '../components/NavLinks'

const renderHeader = function(data) {
  return <g.Header
    marginBottom={`1.5em`}
    display={`flex`}
    alignItems={`center`}
  >
    <g.Div flex="1">
      <g.H3 display="inline">
        <Link to="/">
          {`${data.site.siteMetadata.title}`}
        </Link>
      </g.H3>
    </g.Div>

    <g.Div
      display="grid"
      gridTemplateColumns={`repeat(3, fit-content(100%))`}
      gridGap="0.5em"
    >
      <NavLinks/>
    </g.Div>
  </g.Header>
}
export default ({location, children, data}) =>
  <div style={{margin: `0 auto`, maxWidth: 650, padding: `1.25rem 1rem`}}>
    <Helmet title={`${data.site.siteMetadata.title}`}/>
    {location.pathname === '/' || renderHeader(data)}
    {!!console.log(location)}
    {children()}
  </div>

// noinspection JSUnresolvedVariable
export const query = graphql`
  query LayoutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
