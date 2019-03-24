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
  scope : 'user-modify-playback-state',
  track : 'null',
  volume : 100,
  queue : [],
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
              //spotifyInfo.device = body.devices[0]
              //console.log(spotifyInfo.device.id);
              //console.log(body)
              //console.log(spotifyInfo.device);
          });
        
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

app.get('/pause', function(req, res, body){
  //get a new auth token only if it needs to 
  if (spotifyInfo.scope != 'user-modify-playback-state')
  {
    spotifyInfo.scope = 'user-modify-playback-state';
    res.redirect('/');
  }
  const options = { 
    url: 'https://api.spotify.com/v1/me/player/pause',
    headers: { 
      'Accept':'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + 
      spotifyInfo.access_token },
    json: true
  };

  request.put(options, function(error, response, body) {
    console.log('We paused dawg');
  });
});

app.get('/resume', function(req, res, body){
  //get a new auth token only if it needs to 
  if (spotifyInfo.scope != 'user-modify-playback-state')
  {
    spotifyInfo.scope = 'user-modify-playback-state';
    res.redirect('/');
  }
  const options = { 
    url: 'https://api.spotify.com/v1/me/player/play',
    headers: { 
      'Accept':'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + 
      spotifyInfo.access_token },
    json: true
  };

  request.put(options, function(error, response, body) {
    console.log('Resumed');
  });
});

app.get('/volume', function(req, res, body){
 //get a new auth token only if it needs to 
 if (spotifyInfo.scope != 'user-modify-playback-state')
 {
   spotifyInfo.scope = 'user-modify-playback-state';
   res.redirect('/');
 }
 //Make sure the volume isn't above 100
  if (Number(req.query.volume) > 100){
    spotifyInfo.volume = 100;
  }else if (0 > Number(req.query.volume)){
    spotifyInfo.volume = 0;
  } else {
    spotifyInfo.volume = Number(req.query.volume);
  }
 
 
  const options = { 
    url: 'https://api.spotify.com/v1/me/player/volume?volume_percent=' + spotifyInfo.volume,
    headers: { 
      'Accept':'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + 
      spotifyInfo.access_token },
    json: true
  };

  request.put(options, function(error, response, body) {
    console.log('Changed the Volume to ' + spotifyInfo.volume);
  });
});

app.get('/play', function(req, res, body){
  //Make sure the state is correct for the auth token
  if (spotifyInfo.scope != 'user-modify-playback-state')
  {
    spotifyInfo.scope = 'user-modify-playback-state';
    res.redirect('/');
  }
  
  //Assign the constants based on the query data and if nothing is found it will play all star lol
  const playme = req.query.q;
  const type = req.query.type;
  var requestUrl = 'https://api.spotify.com/v1/search?q="all%20star"&type=track';

  console.log(playme + ' ' + type)


  if(type == 'album'){
    requestUrl = 'https://api.spotify.com/v1/search?q="' + playme 
    + '"&type=album';
  } else if (type == 'track'){
    requestUrl = 'https://api.spotify.com/v1/search?q="' + playme 
    + '"&type=track';
  } else if (type == 'artist'){
    requestUrl = 'https://api.spotify.com/v1/search?q=artist:"' + playme 
    + '"&type=album';
  }

  //Request data to be sent to spotify, returning a json of the track ids and stuff
    const options = { 
      url: requestUrl,
      headers: { 
        'Accept':'application/json',
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + 
        spotifyInfo.access_token },
      json: true
    };

    //Make the request to spotify to recieve data
    request.get(options, function(error, response, body) {

      var itemToCheck = '';

      //Check the type in order to accurately check the response stuff
      if (type == 'track'){
        itemToCheck = body.tracks.items;

          //loop through all the items of the item list to find the track to play
        for (var i = 0; i < itemToCheck.length; i++){
          //Check to see if any of the items in the list have that name
          if (itemToCheck[i].name.toLowerCase() == playme || type == 'artist'){

            console.log('Found the ' + type + ' with name ' + itemToCheck[i].name );
            console.log('and the uri of ' + itemToCheck[i].uri);
            var stuff = [];

            //Adds the new song to the queue that is stored locally
            if (type == 'track'){
              stuff.push(itemToCheck[i].uri);
            } else if (type == 'artist'){
                  stuff = itemToCheck[i].uri;
            }

            console.log(stuff);

            var boptions = {};

            if (type == 'track'){
              boptions = {
                url: 'https://api.spotify.com/v1/me/player/play',
                body: {
                  "uris" : stuff,
                },
                headers: { 
                  'Accept':'application/json',
                  'Content-Type' : 'application/json',
                  'Authorization': 'Bearer ' + 
                  spotifyInfo.access_token },
                json: true
              };
            } 
      } else if (type == 'artist' || type == 'album'){
        itemToCheck = body.albums.items;
      }
      else if(type == 'artist') {
            boptions = {
              url: 'https://api.spotify.com/v1/me/player/play',
              body: {
                "context_uri": stuff,
                "offset": {
                  "position": Math.random(0, )
                },
                "position_ms": 0
              },
              headers: { 
                'Accept':'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer ' + 
                spotifyInfo.access_token },
              json: true
            };
          }
          
      
          request.put(boptions, function(error, response, body){

            console.log(body);
          });
          break;
        } else {
          console.log('song not found');
        }
      }

    });

    

});

console.log('Listening on 8888');
app.listen(8888);
