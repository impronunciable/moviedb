var mdb = require('./moviedb')('dc4940972c268b026150cf7be6f01d11');

function findMovieByImdb(imdb_id, fn){
	mdb.find({id: imdb_id, external_source:"imdb_id"}, function(err, res){
		if (err) console.log(err);
		else {
			if (res["movie_results"] && res["movie_results"][0]) {
				var tmdb_id = res["movie_results"][0]["id"];
				if (tmdb_id) {
					mdb.movieInfo({
						id: tmdb_id, 
						append_to_response: "trailers,credits,reviews"
					}, fn);
				}
				else {
					fn("No id field in the response for " + imdb_id, null);
				}
			}
			else {
				fn("Movie " + imdb_id + " not found!", null);
			}
		}
	});
}

exports.findMovieByImdb = findMovieByImdb;