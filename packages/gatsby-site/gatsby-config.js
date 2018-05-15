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
        path: `${__dirname}/data/`,
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
            resolve: 'gatsby-remark-code-repls',
            options: {
              // Optional default link text.
              // Defaults to "REPL".
              // eg <a href="...">Click here</a>
              // defaultText: 'Click here',

              // Optional runtime dependencies to load from NPM.
              // This option only applies to REPLs that support it (eg CodeSandbox).
              // eg ['react', 'react-dom'] or ['react@15', 'react-dom@15']
              // dependencies: ["assertion"],

              // Example code links are relative to this dir.
              // eg examples/path/to/file.js
              directory: `${__dirname}/data/examples/`,

              // Optional externals to load from a CDN.
              // This option only applies to REPLs that support it (eg Codepen).
              // eg '//unpkg.com/react/umd/react.development.js'
              // externals: [],

              // Optional HTML contents to inject into REPL.
              // Defaults to `<div id="root"></div>`.
              // This option only applies to REPLs that support it (eg Codepen, CodeSandbox).
              // eg '<div id="root"></div>'
              // html: '',

              // Optional path to a custom redirect template.
              // The redirect page is only shown briefly,
              // But you can use this setting to override its CSS styling.
              // redirectTemplate: `${__dirname}/src/redirect-template.js`,

              // Optional link target.
              // Note that if a target is specified, "noreferrer" will also be added.
              // eg <a href="..." target="_blank" rel="noreferrer">...</a>
              target: '_blank',
            },
          },
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
              directory: `${__dirname}/data/examples/`,
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
    // {
    //   resolve: 'gatsby-plugin-klipse',
    //   options: {
    //     // Class prefix for <pre> tags containing code examples
    //     // defaults to empty string
    //     // if you use PrimsJS for example then add `language-` as the prefix
    //     // classPrefix: 'language-',
    //     classPrefix: 'language-',
    //     // Klipse config, you can check it here
    //     // https://github.com/viebel/klipse#configuration
    //     // klipseSettings: {},
    //     // To load any external scripts you need, pass an array of URLs. The plugin will always load them before the
    // klipse plugin // defaults to an empty Array externalScripts: [], } },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typo.js`,
      },
    },
  ],
}
