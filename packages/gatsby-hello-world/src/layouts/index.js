import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'

import {rhythm} from '../utils/typography'

const ListLink = props =>
  <li style={{display: `inline-block`, marginRight: `1rem`}}>
    <Link to={props.to} href={props.href} target={props.target}>
      {props.children}
    </Link>
  </li>

const LinkExternal = props =>
  <li style={{display: `inline-block`, marginRight: `1rem`}}>
    <a href={props.href} target={props.target || '_blank'}>
      {props.children}
    </a>
  </li>

export default ({children, data}) =>
  <div style={{margin: `0 auto`, maxWidth: 650, padding: `1.25rem 1rem`}}>
    <Helmet title={`Blog - ${data.site.siteMetadata.title}`}/>
    <header style={{marginBottom: `1.5rem`}}>
      <Link to="/">
        <h3 style={{display: `inline`}}>{`${data.site.siteMetadata.title}`}</h3>
      </Link>
      <ul style={{listStyle: `none`, float: `right`}}>
        <ListLink to="/blog/">BLOG</ListLink>
        <LinkExternal href="https://medium.com/@jigargosar">
          MEDIUM
        </LinkExternal>
        <LinkExternal href="https://twitter.com/@jigargosar">
          TWITTER
        </LinkExternal>
      </ul>
    </header>
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
