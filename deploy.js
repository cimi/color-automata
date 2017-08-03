var ghpages = require('gh-pages');
var path = require('path');

ghpages.publish('build', {
  branch: 'gh-pages',
  message: 'Auto-publish to GitHub pages',
  user: {
    name: 'Alex Ciminian',
    email: 'alex.ciminian@gmail.com'
  }
}, function(err) {
  if (err) {
    console.log(err);
  }
});
