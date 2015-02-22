/* 
Iron Router's waitOn function provides some visual feedback 
that something is happening, and that the user should
wait a moment for the subscription.
*/
Router.configure({
  layoutTemplate: 'layout', // layout.html
  loadingTemplate: 'loading', // loading.html
  notFoundTemplate: 'notFound', // not_found.html
  waitOn: function() {
    return Meteor.subscribe('posts');
  }
});

Router.route('/', {
  name: 'postsList'
});

/*
Dynamic routing: 
:_id tells the router, to match any route of the form /posts/xyz/, 
where xyz can be anything at all, and to put whatever it finds in 
this xyz spot inside an _id property in the router's params array.

The data function specifies a template's data context, which can 
be thought of as the filling inside a pie made of templates and
layouts. this corresponds to the currently matched route, and we 
can use this.params to access the named parts of the 
route (which we prefixed with : inside our path).
*/
Router.route('/posts/:_id', {
  name: 'postPage',
  data: function() {
    return Posts.findOne(this.params._id);
  }
});

/*
This tells Iron Router to show the "not found" page not just for 
invalid routes but also for the postPage route, whenever the data
function returns a "false-y" object (e.g. null, false, undefined, or empty).
*/
Router.onBeforeAction('dataNotFound', {
  only: 'postPage'
});