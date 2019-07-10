var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var cookieParser = require('cookie-parser');

export class Spotify {
  app = express()
  client_id = process.env.CLIENTKEY; 
  client_secret = process.env.SECRETKEY;
  redirect_uri = process.env.REDIRECT;
  code = 'null';
  access_token = 'null';
  refresh_token = 'null';
  device = [];
  scope = 'user-modify-playback-state';
  track = 'null';
  volume = 100;
  queue = [];
  auth = false
  stateKey = 'spotify_auth_state';

  constructor() { }
}

var port = 8888;
Spotify.app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())
   .listen(port, x => console.log(`Listening on ${port}...`));