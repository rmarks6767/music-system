/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var player = require('play-sound');
var path = require('path');
var fs = require('fs');

var app = express();
const router = express.Router();

app.get('/home', function(req,res){
  var token = spotifyInfo.access_token;
  res.sendFile(__dirname + '/index.html');
});



//Store all the important info in a struct to be access by the rest of the program
const spotifyInfo = {
  client_id : process.env.CLIENTKEY, // Your client id
  client_secret : process.env.SECRETKEY, // Your secret
  redirect_uri : process.env.REDIRECT, //The callback uri
  code : 'null',
  access_token : 'null',
  refresh_token : 'null',
  device : [],
  scope : 'user-read-playback-state',
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';



app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: spotifyInfo.client_id,
      scope: spotifyInfo.scope,
      redirect_uri: spotifyInfo.redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  spotifyInfo.code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: spotifyInfo.code,
        redirect_uri: spotifyInfo.redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(spotifyInfo.client_id + ':' + spotifyInfo.client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        spotifyInfo.access_token = body.access_token,
        spotifyInfo.refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + spotifyInfo.access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/home?token=' + spotifyInfo.access_token);
        //res.redirect('/device');
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  spotifyInfo.refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(spotifyInfo.client_id + ':' + spotifyInfo.client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: spotifyInfo.refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      spotifyInfo.access_token = body.access_token;
      res.send({
        'access_token': spotifyInfo.access_token
      });
    }
  });
});

app.get('/device', function(req, res){
  //get the device id that just opened that site
  const options = {
    url: 'https://api.spotify.com/v1/me/player/devices',
    headers: { 
      'Accept':'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + 
      spotifyInfo.access_token },
    json: true
  };

  request.get(options, function(error, response, body) {
    if (body.devices[0] != null){
      spotifyInfo.device = body.devices[0]
      console.log(body)
      console.log(spotifyInfo.device);
      console.log(spotifyInfo.device.id);
       //+ '&id=' + spotifyInfo.device.id);
    } else {
      console.log('It was empty, no active devices!');
    }
  });
});

app.get('/playsong', function(req, res, body){


});
app.get('/playartist', function(req, res, body){
  if (body != null){
    const artist = 'Post Malone'
  
    const options = { 
      url: 'https://api.spotify.com/v1/search?q=' + 'gg%20gg' 
      + '&type=artist',
      headers: { 
        'Accept':'application/json',
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + 
        spotifyInfo.access_token },
      json: true
    };

    request.get(options, function(error, response, body) {
      if (body != null){
        console.log(body)
      } else {
        console.log('Artist not found!');
        return 400;
      }
    });
  }
});
app.get('/volume', function(req, res, body){


});

console.log('Listening on 8888');
app.listen(8888);
