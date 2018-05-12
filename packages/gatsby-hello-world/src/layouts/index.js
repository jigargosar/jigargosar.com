import React from 'react'
import Helmet from 'react-helmet'
import g from 'glamorous'
import {rhythm} from '../utils/typography'
import {Link} from '../components/Link'

const renderHeader = function(data) {
  return <g.Header
    marginBottom={`1.5em`}
    display={`flex`}
    alignItems={`center`}
  >
    <g.Div flex="1">
      <Link to="/">
        <h3 style={{display: `inline`}}>{`${data.site.siteMetadata.title}`}</h3>
      </Link>
    </g.Div>

    <g.Div>
      <Link to="/blog/">BLOG</Link>
      <Link href="https://medium.com/@jigargosar">
        MEDIUM
      </Link>
      <Link href="https://twitter.com/@jigargosar">
        TWITTER
      </Link>
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
