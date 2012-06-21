var mdb = require('./lib/moviedb');

var m = new mdb('dc4940972c268b026150cf7be6f01d11');

m.searchMovie({query: 'alien'}, function(err, res){
  console.log(err);
 console.log(res);
});
