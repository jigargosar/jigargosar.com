import React from 'react'
import Helmet from 'react-helmet'
import g from 'glamorous'
import {rhythm} from '../utils/typography'
import {ExternalLink, InternalLink, ListLink} from '../components/Link'

const renderHeader = function(data) {
  return <g.Header
    marginBottom={`1.5em`}
    display={`flex`}
    alignItems={`center`}
  >
    <g.Div flex="1">
      <InternalLink to="/">
        <h3 style={{display: `inline`}}>{`${data.site.siteMetadata.title}`}</h3>
      </InternalLink>
    </g.Div>

    <g.Div>
      <InternalLink to="/blog/">BLOG</InternalLink>
      <ExternalLink href="https://medium.com/@jigargosar">
        MEDIUM
      </ExternalLink>
      <ExternalLink href="https://twitter.com/@jigargosar">
        TWITTER
      </ExternalLink>
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
