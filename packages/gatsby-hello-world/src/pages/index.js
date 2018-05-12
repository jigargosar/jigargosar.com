import React from 'react'
import g from 'glamorous'
import {rhythm} from '../utils/typography'
import {ExternalLink, InternalLink, ListLink} from '../components/Link'

const Pages = ({data}) =>
    <g.Div display="flex" alignItems="center" justifyContent="center" height="100%">
      <g.H1 fontSize="4em" flex="1">
        Jigar Gosar
      </g.H1>
      <g.H2 flex="1" display="flex" flexDirection="column" alignItems="center">
        <InternalLink to="/blog/">BLOG</InternalLink>
        <ExternalLink href="https://medium.com/@jigargosar">
          MEDIUM
        </ExternalLink>
        <ExternalLink href="https://twitter.com/@jigargosar">
          TWITTER
        </ExternalLink>
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
