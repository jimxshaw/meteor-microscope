/*
This config file tells our accounts system that we
want users to log-in via a username.
By adding the accounts package, Meteor has created
a special new collection, which can be accessed at
Meteor.users.METHOD(); .
*/
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
});