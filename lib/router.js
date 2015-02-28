/* 
Iron Router's waitOn function provides some visual feedback 
that something is happening, and that the user should
wait a moment for the subscription.
*/
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() { 
    return [Meteor.subscribe('notifications')]
  }
});

/*
A route controller is an useful aspect of Meteor's Iron Router package. 
It is simply a way to group routing features together in a nifty 
reusable package of which any route can inherit. Because our 
controller is called PostsListController and our route is named 
postsList, Iron Router will automatically use the controller.

Ultimately, what we're doing with this controller is that if we ask 
for n posts and we get n back, we'll keep showing the "load more" 
button as specified in client/templates/posts/posts_list.html . If we 
ask for n and we get fewer than n back then it means we've hit the 
limit and the button won't show.
*/

PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5, 
  postsLimit: function() { 
    return parseInt(this.params.postsLimit) || this.increment; 
  },
  findOptions: function() {
    return {sort: {submitted: -1}, limit: this.postsLimit()};
  },
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },
  posts: function() {
    return Posts.find({}, this.findOptions());
  },
  data: function() {
    var hasMore = this.posts().count() === this.postsLimit();
    var nextPath = this.route.path({postsLimit: this.postsLimit() + this.increment});
    return {
      posts: this.posts(),
      ready: this.postsSub.ready,
      nextPath: hasMore ? nextPath : null
    };
  }
});

Router.route('/:postsLimit?', {
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
  waitOn: function() {
    return [
      Meteor.subscribe('singlePost', this.params._id),
      Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/posts/:_id/edit', {
  name: 'postEdit',
  waitOn: function() { 
    return Meteor.subscribe('singlePost', this.params._id);
  },
  data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/submit', {
  name: 'postSubmit'
});


var requireLogin = function() {
  if (! Meteor.user()) {
    // Displays the loading template 
    // while we're waiting to see if the user has access or not.
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    }
    else {
      this.render('accessDenied');
    }
  }
  else {
    this.next();
  }
};

/*
This tells Iron Router to show the "not found" page not just for 
invalid routes but also for the postPage route, whenever the data
function returns a "false-y" object (e.g. null, false, undefined, or empty).
*/
Router.onBeforeAction('dataNotFound', {
  only: 'postPage'
});

/*
The following functions as a route hook. A hook intercepts the routing 
process and potentially changes the action that the router takes. 
We are checking users are logged in, based on the requireLogin 
variable's value. Non-logged in users will be shown the accessDenied template 
instead of the expected postSubmit template.
*/
Router.onBeforeAction(requireLogin, {
  only: 'postSubmit'
});

