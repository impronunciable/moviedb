var mdb = require('./lib/moviedb');

var m = new mdb('yout api key');

m.searchMovie({query: 'alien'}, function(err, res){
 console.log(res);
});
