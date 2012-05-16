
/*
 * Exports the constructor
 */

module.exports = function MovieDB(api_key){
  if(api_key) this.api_key = api_key;
  else throw new Error('Bad api key');
};

/*
 * API auth
 */

require('./auth');

/*
 * API request
 */

require('./request');
