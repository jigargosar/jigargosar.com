import React from 'react'
import g from 'glamorous'
import {rhythm} from '../utils/typography'
import {NavLinks} from '../components/NavLinks'

const Pages = ({data}) =>
  <g.Div display="flex" alignItems="center" justifyContent="center" height="100%">
    <g.H1 flex="1" fontSize="4em">
      Jigar Gosar
    </g.H1>
    <g.H2 flex="2" display="flex" flexDirection="column" alignItems="center">
      <NavLinks/>
    </g.H2>
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
