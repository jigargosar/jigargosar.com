import React from 'react'
import Helmet from 'react-helmet'
import {CommonHeader} from '../components/CommonHeader'

export default ({location, children, data}) =>
  <div style={{margin: `0 auto`, maxWidth: 650, padding: `1.25rem 1rem`}}>
    <Helmet title={`${data.site.siteMetadata.title}`}/>
    {location.pathname === '/' || <CommonHeader title={data.site.siteMetadata.title}/>}
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
