/*
On post_page.html we put {{#each comments}} block inside 
the template, so THIS is a post within the comments helper. 
To find the relevant comments, we check those that are 
linked to that post via the postId attribute.
*/
Template.postPage.helpers({
  comments: function () {
    return Comments.find({postId: this._id});
  }
});