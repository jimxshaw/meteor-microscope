/*
This is the collection that stores comments. It 
ties directly to the functions in server/fixtures.js .

Just like the previously set up post server-side 
Meteor Method, we'll set up a comment Meteor Method 
to create comments, check that everything is legit and 
finally insert the new comment into the comments 
collection.
*/

Comments = new Mongo.Collection('comments');

Meteor.methods({
  commentInsert: function(commentAttributes) {
    check(this.userId, String);
    check(commentAttributes, {
      postId: String,
      body: String
    });

    var user = Meteor.user();
    var post = Posts.findOne(commentAttributes.postId);

    if (!post) {
      throw new Meteor.Error('invalid-comment', 'You must comment on a post');
    }

    comment = _.extend(commentAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    // updates the post with the number of comments
    Posts.update(comment.postId, {
      $inc: {commentsCount: 1}
    });
    
    // create the comment, save the id
    comment._id = Comments.insert(comment);
    // now create a notification, informing the user that there's been a comment
    createCommentNotification(comment);
    return comment._id;
  }
});