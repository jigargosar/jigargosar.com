import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'
import {css} from 'glamor'

import {rhythm} from '../utils/typography'

const ListLink = props =>
  <li style={{display: `inline-block`, marginRight: `1rem`}}>
    <Link to={props.to}>
      {props.children}
    </Link>
  </li>

export default ({children, data}) =>
  <div style={{margin: `0 auto`, maxWidth: 650, padding: `1.25rem 1rem`}}>
    <Helmet title={`Blog - ${data.site.siteMetadata.title}`}/>
    <header style={{marginBottom: `1.5rem`}}>
      <Link to="/" >
        <h3 style={{display: `inline`}}>{`${data.site.siteMetadata.title}`}</h3>
      </Link>
      <ul style={{listStyle: `none`, float: `right`}}>
        <ListLink to="/">Home</ListLink>
        <ListLink to="/Counter/">Counter</ListLink>
        <ListLink to="/index-t1/">Home Old</ListLink>
        <ListLink to="/counter/">Counter</ListLink>
      </ul>
    </header>
    {children()}
  </div>


const linkStyle = css({float: `right`})


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
