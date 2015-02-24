/*
This function uses jQuery to parse out the values of our various
form fields and populates a new post object from the result.
The preventDefault() method has to be attached to the event
argument to make sure the browser doesn't go and try to submit
the form.
The Meteor.call function calls a Meteor Method by its first argument. 
You can provide arguments to the call, such as the post object we 
constructed from the form, and finally attach a callback, which will 
execute when the server-side Method is done.
Meteor Method callbacks always have two arguments, error and result. 
If for whatever reason the error argument exists, we'll alert the 
user by using return to abort the callback. If all is working as it 
should then we'll redirect the user to the freshly created post's 
discussion page.
*/
Template.postSubmit.events({
  'submit form': function(e) {
    e.preventDefault();

    var post = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    };

    Meteor.call('postInsert', post, function(error, result) {
      if (error) {
        return alert(error.reason);
      }
      if (result.postExists) {
        alert('This link has already been posted.');
      }
      Router.go('postPage', {
        _id: result._id
      });
    })
  }
});