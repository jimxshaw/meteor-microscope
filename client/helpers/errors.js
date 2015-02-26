/*
The following is a collection to store errors. It is
to be a local collection as errors are only 
relevant to the current session and don't need 
to persist in any way. The collection will only 
exist in the browser and won't attempt to sync back 
to the server. To achieve this, Errors is created in 
the client directory with its collection name set to 
null (since this collection's data will never be 
saved into the server-side database). 
*/
Errors = new Mongo.Collection(null);

/*
The throwError function adds errors when called. 
Security concerns such as allow or deny are not needed 
as this collection is "local" to the current user. 
Having a local collection to store errors is advantageous 
in that, like all collections, it's reactive. Errors 
are displayed reactively in the same way any other 
collection data are displayed.
*/
throwError = function(message) {
  Errors.insert({message: message});
};