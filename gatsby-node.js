const slash = require(`slash`);
const _ = require('lodash');
const path = require('path');

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;
  return (
    graphql(`
      {
        allWordpressPost {
          edges {
            node {
              id
              slug
              modified
              categories {
                name
              }
            }
          }
        }
      }
    `)
      .then(result => {
        if (result.errors) {
          result.errors.forEach(e => console.error(e.toString()));
          return Promise.reject(result.errors);
        }

        const postTemplate = path.resolve(`./src/templates/blog-post.js`);

        // Build a list of categories and tags
        const categories = [];
        const tags = [];

        // Iterate over the array of posts
        _.each(result.data.allWordpressPost.edges, edge => {
          // Add this post's categories and tags to the global list
          _.each(edge.node.tags, tag => {
            tags.push(tag);
          });
          _.each(edge.node.categories, category => {
            categories.push(category);
          });

          // Create the Gatsby page for this WordPress post
          createPage({
            path: `/${edge.node.slug}/`,
            component: slash(postTemplate),
            context: {
              id: edge.node.id,
            },
          });
        });

        const tagsTemplate = path.resolve(`./src/templates/tag.js`);
        const categoriesTemplate = path.resolve(`./src/templates/category.js`);

        // Create a unique list of categories and tags
        const uniqueCategories = _.uniqBy(categories, 'slug');
        const uniqueTags = _.uniqBy(tags, 'slug');

        // For each category and tag, create a Gatsby page
        _.each(uniqueCategories, cat => {
          createPage({
            path: `/categories/${cat.slug}/`,
            component: categoriesTemplate,
            context: {
              name: cat.name,
              slug: cat.slug,
            },
          });
        });
        _.each(uniqueTags, tag => {
          createPage({
            path: `/tags/${tag.slug}/`,
            component: tagsTemplate,
            context: {
              name: tag.name,
              slug: tag.slug,
            },
          });
        });
      })
  );
};