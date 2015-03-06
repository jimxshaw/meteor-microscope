Accounts.onCreateUser(function(options, user) {
  user.intercomHash = IntercomHash(user, '7GZ9JeFtYFye72QerBY2LJTZw1N44Cym2kZTfxMV');

  if (options.profile) {
    user.profile = options.profile;
  }
  return user;
});