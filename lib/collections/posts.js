Posts = new Mongo.Collection('posts');

/*
If the user's post has no title or no url during post submission, 
the following function will display the appropriate message.
*/
validatePost = function(post) {
  var errors = {};
  if (!post.title) {
    errors.title = "Please fill in a headline";
  }
  if (!post.url) {
    errors.url = "Please fill in a URL";
  }
  return errors;
};

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
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

/*
Note that the post argument refers to the existing post. In 
this case, we want to validate the update, which is why we're 
calling validatePost on the contents of the modifier's $set 
property (as in Posts.update({$set: {title: ..., url: ...}})).

This works because modifier.$set contains the same two title 
and url property as the whole post object would. Of course, 
it does mean that any partial update affecting only title 
or only url will fail but in practice that shouldn't be an 
issue. 

When adding multiple deny callbacks, the operation will 
fail if any one of them returns true. In this case, this 
means the update will only succeed if it's only targeting 
the title and url fields, as well as if neither one of these 
fields are empty. 

The upvote method does some defensive checks to ensure that 
the user is logged in and that the post really exists. We 
then double check that the user hasn't already voted for the 
post, if not, we increment the vote's total score and add the 
user to the set of upvoters by using two special Mongo 
operators: $addToSet and $inc. The first adds an item to an 
array property as long as it doesn't already exist. The second 
simply increments an integer field. 
*/
Posts.deny({
  update: function(userId, post, fieldNames, modifier) {
    var errors = validatePost(modifier.$set);
    return errors.title || errors.url;
  }
});

Meteor.methods({
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });

    var errors = validatePost(postAttributes);
    if (errors.title || errors.url) {
      throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");
    }
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
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [],
      votes: 0
    });

    // shorten link URL
    if (Meteor.isServer) {
      var shortUrl = Bitly.shortenURL(post.url);
      if (post.url && shortUrl) {
        post.shortUrl = shortUrl;
      }
    }

    var postId = Posts.insert(post);

    return {
      _id: postId
    };
  },
  upvote: function(postId) {
    check(this.userId, String);
    check(postId, String);

    var affected = Posts.update({
      _id: postId,
      upvoters: {$ne: this.userId}
    },
    {
      $addToSet: {upvoters: this.userId},
      $inc: {votes: 1}
    });

    if (! affected) {
      throw new Meteor.Error('invalid', "You weren't able to upvote that post");
    }
  }
});














