/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

  // You can delete this file if you're not using it

const {createFilePath} = require(`gatsby-source-filesystem`)
const path = require('path')

exports.createPages = ({graphql, boundActionCreators}) => {
  const {createPage} = boundActionCreators
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `).then(result => {
      result.data.allMarkdownRemark.edges.forEach(({node}) => {
        createPage({
          path: node.fields.slug,
          component: path.resolve(`./src/templates/blog-post.js`),
          context: {
            slug: node.fields.slug,
          },
        })
      })
      resolve()
    })
  })
}

exports.onCreateNode = ({node, getNode, boundActionCreators}) => {
  const {createNodeField} = boundActionCreators
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({node, getNode})
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }

  if (node.internal.type === `MarkdownRemark`) {
    const fileNode = getNode(node.parent)
    console.log(`\n`, fileNode.relativePath)
  }
}
