/*
Regarding upvotes: if the user is not logged in or has already 
upvoted a post then that user won't be able to vote. To reflect 
this in our UI, we use a helper to conditionally add a disabled 
CSS class to the upvote button.
*/
Template.postItem.helpers({
  ownPost: function() {
    return this.userId === Meteor.userId();
  },
	domain: function() {		
		var a = document.createElement('a');
		a.href = this.url;
		return a.hostname;	
	},
  upvotedClass: function() {
    var userId = Meteor.userId();
    if(userId && !_.include(this.upvoters, userId)) {
      return 'btn-primary upvotable';
    }
    else {
      return 'disabled';
    }
  },
  postUrl: function() {
    return this.shortUrl ? this.shortUrl : this.url;
  }
});

Template.postItem.events({
  'click .upvotable': function(e) {
    e.preventDefault();
    Meteor.call('upvote', this._id);
  }
});