import React from 'react'
import g from 'glamorous'
import {rhythm} from '../utils/typography'
import {ListLink, ListLinkExternal} from '../components/ListLink'

const Pages = ({data}) =>
    <g.Div display="flex" alignItems="center" justifyContent="center" height="100%">
      <g.H1 fontSize="4em" flex="1">
        Jigar Gosar
      </g.H1>
      <g.H2 flex="1" display="flex" flexDirection="column" alignItems="center">
        <ListLink to="/blog/">BLOG</ListLink>
        <ListLinkExternal href="https://medium.com/@jigargosar">
          MEDIUM
        </ListLinkExternal>
        <ListLinkExternal href="https://twitter.com/@jigargosar">
          TWITTER
        </ListLinkExternal>
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
