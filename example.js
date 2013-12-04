var mdb = require('./lib/wrapper');

mdb.findMovieByImdb("tt1727388", function(err, res){
	console.log(res);
});