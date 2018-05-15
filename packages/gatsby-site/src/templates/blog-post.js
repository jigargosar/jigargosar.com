import React from 'react'
import {Helmet} from 'react-helmet'
import g from 'glamorous'

export default ({data}) => {
  const post = data.markdownRemark
  return (
    <g.Div>
      <Helmet title={`${post.frontmatter.title} - ${data.site.siteMetadata.title}`}/>
      <g.H1>
        {post.frontmatter.title}
        <g.Div
          style={{color: 'rgb(165, 164, 164)'}}
          textAlign="right"
          fontSize="0.4em"
          // lineHeight="1"
          fontWeight="normal"
        >
          {post.frontmatter.date}
        </g.Div>
      </g.H1>
      <g.Div dangerouslySetInnerHTML={{__html: post.html}}/>
    </g.Div>
  )
};

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields{ 
        slug 
      }
      frontmatter {
        title
        author
        date(formatString: "MMM DD, YYYY")
      }
    }
  }
`
