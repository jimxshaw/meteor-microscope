/*
Since the insecure package was removed, all client-side 
modifications are denied. The app's permission rules must be 
fixed in order to allow users to edit or delete their posts.

The following ensures the permissions logic loads first and is
available in both environments.  
*/
ownsDocument = function(userId, doc) {
  return doc && doc.userId === userId;
};