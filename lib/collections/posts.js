Posts = new Mongo.Collection('posts');

/*
Initially, new posts could only be inserted 
via a server Method that bypasses allow() . 
However, users need to be able to edit or delete 
posts via the client, thus the following has to 
be explicitly written out to "allow" such 
functionalities. 
*/
Posts.allow({
  update: function(userId, post) {
    return ownsDocument(userId, post);
  },
  remove: function(userId, post) {
    return ownsDocument(userId, post);
  }
});

/*
Users shouldn't be allowed to create a post and then assign 
it to someone else. Meteor's deny() callback ensures users 
can only edit specific fields.

We take the fieldName array that contains a list of the fields 
being modified and uses the Underscore package's without() 
method to return a sub-array, which contains fields that are 
not url or title. If all is normal, that array should be empty 
and its length should be 0. If users attempt to modify other 
fields, the array's length will return 1 or greater and the 
callback will return true (thus denying the update).
*/
Posts.deny({
  update: function(userId, post, fieldNames) {
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });

    var postWithSameLink = Posts.findOne({
      url: postAttributes.url
    });
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }

    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });
    var postId = Posts.insert(post);

    return {
      _id: postId
    };
  }
});