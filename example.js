var mdb = require('./lib/moviedb')('dc4940972c268b026150cf7be6f01d11');

mdb.movieInfo({id: 11}, function(err, res){
  console.log('--------','popular');
  console.log(res);
}).miscPopularMovies({}, function(err, res){
  console.log(err);
  console.log('--------','ninja');
  console.log(res);
});
