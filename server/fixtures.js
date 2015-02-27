if (Posts.find().count() === 0) {
  var now = new Date().getTime();

  var tomId = Meteor.users.insert({
    profile: {name: 'Tom Coleman'}
  });
  var tom = Meteor.users.findOne(tomId);

  var sachaId = Meteor.users.insert({
    profile: {name: 'Sacha Greif'}
  });
  var sacha = Meteor.users.findOne(sachaId);

  var telescopeId = Posts.insert({
    title: 'Introducing Telescope',
    userId: sacha._id,
    author: sacha.profile.name,
    url: 'http://sachagreif.com/introducing-telescope/',
    submitted: new Date(now - 7 * 3600 * 1000)
  });

  Comments.insert({
    postId: telescopeId,
    userId: tom._id,
    author: tom.profile.name,
    submitted: new Date(now - 5 * 3600 * 1000),
    body: 'Great project Sacha, can I join in?'
  });

  Comments.insert({
    postId: telescopeId,
    userId: sacha._id,
    author: sacha.profile.name,
    submitted: new Date(now - 3 * 3600 * 1000),
    body: 'You sure can Tom!'
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