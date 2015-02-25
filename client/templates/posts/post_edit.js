/*
There are two template event callbacks: one for the form's
submit event and one for the delete link's click event.

The delete callback suppresses the default click event then 
asks for confirmation. If confirmed, it obtains the current 
post ID from the Template's data context, deletes it and 
finally redirects the user to the homepage.

The update callback works like this. After suppressing the 
default event and getting the current post, the page retrieves the 
new form field values and stores them in a postProperties 
object. This object passes to Meteor's Collection.update() Method 
by using the $set operator (which replaces a set of specified 
fields while leaving the others untouched) and uses a callback 
that either displays an error if the update failes or sends 
the user back to the post's page if the update succeeds. 
*/

Template.postEdit.events({
  'submit form': function(e) {
    e.preventDefault();

    var currentPostId = this._id;

    var postProperties = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    }

    Posts.update(currentPostId, {$set: postProperties}, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {
        Router.go('postPage', {_id: currentPostId});
      }
    });
  },

  'click .delete': function(e) {
    e.preventDefault();

    if (confirm("Delete this post?")) {
      var currentPostId = this._id;
      Posts.remove(currentPostId);
      Router.go('postsList');
    }
  }
});