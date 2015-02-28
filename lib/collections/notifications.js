/*
A notification is created when someone comments on your 
post. The createCommentNotification function will insert 
a matching notification for each new comment on one of 
your own posts. Since we'll be updating notifications 
from the client, our allow call has to be solid. Thus, 
we'll check to make sure the user making the update call 
owns the notification being modified, the user is only 
trying to update a single field and that single field 
is the read property of our notification. 
*/

Notifications = new Mongo.Collection('notifications');

Notifications.allow({
  update: function(userId, doc, fieldNames) {
    return ownsDocument(userId, doc) && 
      fieldNames.length === 1 && fieldNames[0] === 'read';
  }
});

createCommentNotification = function(comment) {
  var post = Posts.findOne(comment.postId);
  if (comment.userId !== post.userId) {
    Notifications.insert({
      userId: post.userId,
      postId: post._id,
      commentId: comment._id,
      commenterName: comment.author,
      read: false
    });
  }
};