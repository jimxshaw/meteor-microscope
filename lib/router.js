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
    return {sort: this.sort, limit: this.postsLimit()};
  },
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },
  posts: function() {
    return Posts.find({}, this.findOptions());
  },
  data: function() {
    var self = this;
    return {
      posts: self.posts(),
      ready: self.postsSub.ready,
      nextPath: function() {
        if (self.posts().count() === self.postsLimit())
          return self.nextPath();
      }
    };
  }
});

NewPostsController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});

BestPostsController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});

ClickedPostsController = PostsListController.extend({
  sort: {clicks: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.clickedPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});

Router.route('/', {
  name: 'home',
  controller: NewPostsController
});

Router.route('/new/:postsLimit?', {name: 'newPosts'});

Router.route('/best/:postsLimit?', {name: 'bestPosts'});

Router.route('/clicked/:postsLimit?', {name: 'clickedPosts'});

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

Router.route('/submit', {name: 'postSubmit'});

/*
Below is using our router to create a RSS feed. 
*/
Router.route('/feed.xml', {
  where: 'server',
  name: 'rss',
  action: function() {
    var feed = new RSS({
      title: "New Microscope Posts",
      description: "The latest posts from Microscope, the smallest news aggregator."
    });
    Posts.find({}, {sort: {submitted: -1}, limit: 20}).forEach(function(post) {
      feed.item({
        title: post.title,
        description: post.body,
        author: post.author,
        date: post.submitted,
        url: '/posts/' + post._id
      })
    });
    this.response.write(feed.xml());
    this.response.end();
  }
});

/*
We can use the same technique for our RSS feed to create a simple 
GET API. In the real world, it wouldn't be practical to return ALL 
posts for every API request and it doesn't make sense to return 
every single property of each post. A limiting paramter is added to 
restrict the output data.

First, we get the current request's parameters with this.request.query . 
Then we use shorthand "if/else" syntax (a ? b : c) to check if 
parameters.limit is set. If it is, we use this as our limit 
variable and if not, we default to 20. Finally, we use that limit 
variable along with a field specifier object to build our find() query.  
*/
Router.route('/api/posts', {
  where: 'server',
  name: 'apiPosts',
  action: function() {
    var parameters = this.request.query,
        limit = !!parameters.limit ? parseInt(parameters.limit) : 20,
        data = Posts.find({}, {limit: limit, fields: 
          {title: 1, author: 1, url: 1, submitted: 1, }}).fetch();
    this.response.write(JSON.stringify(data));
    this.response.end();
  }
});

/*
The below is an API extension to handle requests for a specific post. 

We look up the post and return it if we find it. If we don't, we return 
a 404 header along with a "Post not found" message.
*/
Router.route('/api/posts/:_id', {
  where: 'server',
  name: 'apiPost',
  action: function() {
    var post = Posts.findOne(this.params._id);
    if(post){
      this.response.write(JSON.stringify(post));
    } 
    else {
      this.response.writeHead(404, {'Content-Type': 'text/html'});
      this.response.write("Post not found.");
    }
    this.response.end();
  }
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

if (Meteor.isClient) {
/*
This tells Iron Router to show the "not found" page not just for 
invalid routes but also for the postPage route, whenever the data
function returns a "false-y" object (e.g. null, false, undefined, or empty).
*/
  Router.onBeforeAction('dataNotFound', {only: 'postPage'});

/*
The following functions as a route hook. A hook intercepts the routing 
process and potentially changes the action that the router takes. 
We are checking users are logged in, based on the requireLogin 
variable's value. Non-logged in users will be shown the accessDenied template 
instead of the expected postSubmit template.
*/
  Router.onBeforeAction(requireLogin, {only: 'postSubmit'});
}

