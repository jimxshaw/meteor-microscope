Posts = new Mongo.Collection('posts');

/* 
Posts.allow() specifies a set of circumstances under which 
clients are allowed to do things to the Posts collection. 
In this case, clients need a userId to insert posts. 
*/
Posts.allow({
  insert: function (userId, doc) {
    return !! userId;
  }
});