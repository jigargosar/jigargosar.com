import React from 'react'
import g from 'glamorous'
import {rhythm} from '../utils/typography'

const Pages = ({data}) =>
  <g.Div>
    <g.H5>{data.allMarkdownRemark.totalCount} Posts</g.H5>
  </g.Div>

export default Pages

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark(sort: {fields: [frontmatter___date], order: DESC}){
      totalCount
      edges {
        node {
          id
          fields{ 
            slug 
          }
          frontmatter {
            title
            date(formatString: "DD MMM 'YY")
          }
          excerpt
        }
      }
    }
  }
`
