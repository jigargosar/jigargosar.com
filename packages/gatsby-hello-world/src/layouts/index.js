import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'

import {rhythm} from '../utils/typography'
import {ListLink, ListLinkExternal} from '../components/ListLink'

const renderHeader = function(data) {
  return <header style={{marginBottom: `1.5rem`}}>
    <Link to="/">
      <h3 style={{display: `inline`}}>{`${data.site.siteMetadata.title}`}</h3>
    </Link>
    <ul style={{listStyle: `none`, float: `right`}}>
      <ListLink to="/blog/">BLOG</ListLink>
      <ListLinkExternal href="https://medium.com/@jigargosar">
        MEDIUM
      </ListLinkExternal>
      <ListLinkExternal href="https://twitter.com/@jigargosar">
        TWITTER
      </ListLinkExternal>
    </ul>
  </header>
}
export default ({location,children, data}) =>
  <div style={{margin: `0 auto`, maxWidth: 650, padding: `1.25rem 1rem`}}>
    <Helmet title={`${data.site.siteMetadata.title}`}/>
    {location.pathname === "/" || renderHeader(data)}
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
