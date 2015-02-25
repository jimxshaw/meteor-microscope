if (Posts.find().count() === 0) {
  Posts.insert({
    author: 'DEFAULT',
    title: 'Introducing Telescope',
    url: 'http://sachagreif.com/introducing-telescope/'
  });

  Posts.insert({
    author: 'DEFAULT',
    title: 'Meteor',
    url: 'http://meteor.com'
  });

  Posts.insert({
    author: 'DEFAULT',
    title: 'The Meteor Book',
    url: 'http://themeteorbook.com'
  });
}