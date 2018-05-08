import React from 'react'
import g from 'glamorous'
import Link from 'gatsby-link'
import {rhythm} from '../utils/typography'
import {css} from 'glamor'

const linkStyle = css({
  textDecoration:"underline"
})

// const StyledLinkTo = g``

export default ({data}) => {
  return (
    <div>
      <h4>{data.allMarkdownRemark.totalCount} Posts</h4>
      {data.allMarkdownRemark.edges.map(({node}) => (
        <div key={node.id}>
          <Link
            className={linkStyle}
            to={node.fields.slug}
          >
            <g.H3 marginBottom={rhythm(1 / 4)}>
              {node.frontmatter.title}{' '}
            </g.H3>
          </Link>
          <g.Small color="#AAA" textAlign="right">{node.frontmatter.date}</g.Small>
          <p>{node.excerpt}</p>
        </div>
      ))}
    </div>
  )
};


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
