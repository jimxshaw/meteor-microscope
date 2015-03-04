/*
Npm.depends() is key because it tells Meteor that we 
want to include the RSS NPM package.

Our package will make use of a single file named rss.js 
and this file's code should only be executed on the 
server.

Once the package is included, we load it with Npm.require() 
to make it globally available at the RSS namespace.
*/
Package.describe({
  name: "rss",
  summary: "RSS feed generator",
  version: '0.1.0'
});

Npm.depends({rss: '1.0.0'});

Package.onUse(function (api) {
  api.versionsFrom('0.9.4');
  api.addFiles('rss.js', 'server');
  api.export('RSS');
});