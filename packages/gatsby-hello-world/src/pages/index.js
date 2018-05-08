import React from 'react'
import g from 'glamorous'
import Link from 'gatsby-link'
import {rhythm} from '../utils/typography'

const BlogPostList = ({data}) =>
  <g.Div>
    <g.H5>{data.allMarkdownRemark.totalCount} Posts</g.H5>
    {data.allMarkdownRemark.edges.map(({node}) => (
      <div key={node.id}>
        <g.H3 marginBottom={rhythm(1 / 4)}>
          <Link
            to={node.fields.slug}
          >
            {node.frontmatter.title}
          </Link>
        </g.H3>
        <g.Small color="#AAA" textAlign="right">{node.frontmatter.date}</g.Small>
        <p>{node.excerpt}</p>
      </div>
    ))}
  </g.Div>

export default BlogPostList

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
