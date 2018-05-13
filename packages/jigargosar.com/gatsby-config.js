module.exports = {
  siteMetadata: {
    title: `JigarGosar`,
  },
  plugins: [
    `gatsby-plugin-react-next`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-glamor`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/data`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-embed-snippet',
            options: {
              // Class prefix for <pre> tags containing syntax highlighting;
              // defaults to 'language-' (eg <pre class="language-js">).
              // If your site loads Prism into the browser at runtime,
              // (eg for use with libraries like react-live),
              // you may use this to prevent Prism from re-processing syntax.
              // This is an uncommon use-case though;
              // If you're unsure, it's best to use the default value.
              classPrefix: 'language-',

              // Example code links are relative to this dir.
              // eg examples/path/to/file.js
              directory: `${__dirname}/data/blog/`,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              // Class prefix for <pre> tags containing syntax highlighting;
              // defaults to 'language-' (eg <pre class="language-js">).
              // If your site loads Prism into the browser at runtime,
              // (eg for use with libraries like react-live),
              // you may use this to prevent Prism from re-processing syntax.
              // This is an uncommon use-case though;
              // If you're unsure, it's best to use the default value.
              classPrefix: 'language-',
            },
          },
        ],
      },

    },
    {
      resolve: 'gatsby-plugin-klipse',
      options: {
        // Class prefix for <pre> tags containing code examples
        // defaults to empty string
        // if you use PrimsJS for example then add `language-` as the prefix
        // classPrefix: 'language-',
        classPrefix: 'language-',
        // Klipse config, you can check it here
        // https://github.com/viebel/klipse#configuration
        // klipseSettings: {},
        // To load any external scripts you need, pass an array of URLs. The plugin will always load them before the klipse plugin
        // defaults to an empty Array
        externalScripts: [],
      }
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typo.js`,
      },
    },
  ],
}
