import React from 'react'
import {Helmet} from 'react-helmet'

export default ({data}) => {
  const post = data.markdownRemark
  return (
    <div>
      <Helmet title={`${post.frontmatter.title} - ${data.site.siteMetadata.title}`}/>
      <h1>{post.frontmatter.title}</h1>
      <h4 style={{color: 'rgb(165, 164, 164)'}}>{post.frontmatter.author}
        <span style={{fontSize: '0.8em'}}> -{post.frontmatter.date}</span></h4>
      <div dangerouslySetInnerHTML={{__html: post.html}}/>
    </div>
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
      frontmatter {
        title
        author
        date
      }
    }
  }
`;
