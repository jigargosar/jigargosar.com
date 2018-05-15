import React from 'react'
import Helmet from 'react-helmet'
import {CommonHeader} from '../components/CommonHeader'
import graphql from 'graphql'
import 'prismjs/themes/prism.css'
import {NavLinks} from '../components/NavLinks'

function Layout({location, children, data}) {
  return <div style={{margin: `0 auto`, maxWidth: 650, padding: `1.25rem 1rem`}}>
    <Helmet title={`${data.site.siteMetadata.title}`}/>
    {location.pathname === '/' ||
    <CommonHeader title={data.site.siteMetadata.title}>
      <NavLinks location={location}/>
    </CommonHeader>}
    {/*{!!console.log(location)}*/}
    {children()}
  </div>
}
export default Layout

export const query = graphql`
  query LayoutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
