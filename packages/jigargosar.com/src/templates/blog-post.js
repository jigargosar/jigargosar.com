import React from 'react'
import {Helmet} from 'react-helmet'
import g from 'glamorous'
import {Link} from '../components/Link'

export default ({data}) => {
  const post = data.markdownRemark
  return (
    <g.Div>
      <Helmet title={`${post.frontmatter.title} - ${data.site.siteMetadata.title}`}/>
      <g.H1>
        <Link to={post.fields.slug}>
          {post.frontmatter.title}
        </Link>
        <g.Div style={{color: 'rgb(165, 164, 164)'}}>
          <g.Span style={{fontSize: '0.5em'}}>
            {post.frontmatter.date}
          </g.Span>
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
        date(formatString: "DD MMM 'YY")
      }
    }
  }
`
