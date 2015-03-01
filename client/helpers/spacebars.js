/*
The following helper differentiates between singular (1 Vote, 1 comment) 
and plural (2 Votes, 2 comments) labels and "pluralizes" them accordingly. 
In general, helpers are tied to the template of which they apply. 
By using UI.registerHelper, a global help is created that can be 
used within any template.  
*/
Template.registerHelper('pluralize', function(n, thing) {
  if (n === 1) {
    return '1 ' + thing;
  }
  else {
    return n + ' ' + thing + 's';
  }
});