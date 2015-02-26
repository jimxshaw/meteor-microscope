Template.errors.helpers({
  errors: function () {
    return Errors.find();
  }
});

/*
Multiple errors triggered by the user will be stacked 
on top of one another in the DOM despite them disappearing 
visually. The errors need to be removed from the actual 
Errors collection. 

The rendered callback triggers, after 3 seconds (3000 milliseconds), 
once our template has been rendered in the browser. The this in 
the callback refers to the current template instance and 
this.data lets us access the data of the object that is 
currently being rendered (in our case, an error). 
*/

Template.error.rendered = function() {
  var error = this.data;
  Meteor.setTimeout(function() {
    Errors.remove(error._id);
  }, 3000);
};