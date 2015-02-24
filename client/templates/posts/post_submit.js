/*
This function uses jQuery to parse out the values of our various
form fields and populates a new post object from the result.
The preventDefault() method has to be attached to the event
argument to make sure the browser doesn't go and try to submit
the form.
Finally, we can route to our new post's page. The insert()
method on a collection returns the generated _id for the 
object that has been inserted into the database, which then 
the Router's go() method will use to construct a URL for us 
to browse.
The net result is the user hits submit, a post is created and 
the user is instantly taken to the discussion page for a new post.
*/
Template.postSubmit.events({
  'submit form': function(e) {
    e.preventDefault();

    var post = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    };

    post._id = Posts.insert(post);
    Router.go('postPage', post);
  }
});