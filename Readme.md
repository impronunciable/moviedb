MovieDB
=======
[![Build Status](https://travis-ci.org/impronunciable/moviedb.svg?branch=master)](https://travis-ci.org/impronunciable/moviedb)
[![NPM version](https://badge.fury.io/js/moviedb.svg)](http://badge.fury.io/js/moviedb)
[![Dependency Status](https://img.shields.io/david/impronunciable/moviedb.svg)](https://david-dm.org/impronunciable/moviedb)
[![npm](https://img.shields.io/npm/dm/moviedb.svg?maxAge=2592000)]()

node.js library that makes the interaction with themoviedb.org V3 API easy.

## Installation

```bash
npm install moviedb --save
```

## Usage

Require the module and instantiate the class with your themoviedb.org API KEY.

```js
const MovieDb = require('moviedb')
const moviedb = new MovieDb('your api key')
```

All api methods return a Promise. Use the api methods as you want, for example:

```js
moviedb.searchMovie({ query: 'Alien' }).then(res => {
  console.log(res)
}).catch(console.error)
```

or

```js
moviedb.movieInfo({ id: 666 }).then(res => {
  console.log(res)
}).catch(console.error)
```

Some endpoints, such as watchlist endpoints, have an optional account id parameter. If you have a [session id](https://developers.themoviedb.org/3/authentication/how-do-i-generate-a-session-id), you don't need to provide that parameter.

```js
// This is the same as calling it as
// moviedb.accountMovieWatchlist({ id: '{account_id}' })
moviedb.sessionId = 'my-cached-session-id'
moviedb.accountMovieWatchlist().then(res => {
  // Your watchlist items
  console.log(res)
}).catch(console.error)

// Creating a session id would look something like this
moviedb.requestToken().then(token => {
  // Now you need to visit this url to authorize
  const tokenUrl = `https://www.themoviedb.org/authenticate/${token}`
}).catch(console.error)

// After that has been authorized, you can get the session id
moviedb.session().then(sessionId => {
  // Probably cache this id somewhere to avoid this workflow
  console.log(sessionId)

  // This can be called now because sessionId is set
  moviedb.accountMovieWatchlist().then(res => {
    // Your watchlist items
    console.log(res)
  }).catch(console.error)
}).catch(console.error)
```

## Available methods

All themoviedb.org API v3 methods are included. Endpoint methods can be seen on the [wiki page](https://github.com/impronunciable/moviedb/wiki/Library-endpoints).
