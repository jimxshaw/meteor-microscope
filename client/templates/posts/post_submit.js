/*
We'll use the Session to store a postSubmitErrors object containing 
any potential error message. As the user interacts with the form, 
this object will change, which in turn will reactively update the 
form's markup and contents.

First, we initialize the object whenever the postSubmit template is 
created. This ensures that the user won't see old error messages 
left over from a previous visit to this page.

We then define two template helpers. They both look at the field 
property of Session.get('postSubmitErrors') , where field is either 
url or title depending on where we're calling the helper. So 
errorMessage simply returns the message itself, while errorClass 
checks for the presence of a message and returns has-error if 
such a message exists.
*/
Template.postSubmit.created = function() {
  Session.set('postSubmitErrors', {});
};

Template.postSubmit.helpers({
  errorMessage: function(field) {
    return Session.get('postSubmitErrors') [field];
  },
  errorClass: function(field) {
    return !! Session.get('postSubmitErrors') [field] ? 'has-error' : '';
  }
});

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
If for whatever reason the error argument exists, we'll notify the 
user by using return to execute the throwError function in 
client/helpers/errors.js . If all is working as it should then 
we'll redirect the user to the freshly created post's discussion page.
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
        return throwError(error.reason);
      }
      if (result.postExists) {
        throwError('This link has already been posted.');
      }
      Router.go('postPage', {
        _id: result._id
      });
    })
  }
});