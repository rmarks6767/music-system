var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var player = require('play-sound');
var path = require('path');
var fs = require('fs');
var time = require('moment');

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

//
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

//Refreshes the token that is required
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

//Can update the volume of the current player
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

//Pauses the currently playing song
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

//Resumes the current song of the player
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

//Things to add:
// *** Add working queue and checking to see what is currently playing -- Talk to Owen about this after all the above is done
app.get('/play', function(req, res, body){  
  //Both the q and the type must be satisfied, otherwise we will throw an error
  var playme = null;
  var extra = '%20';
  //The default will be a track if the user specifies nothing
  var type = 'track';
  if (req.query.q != null && req.query.type != null) {
    playme = req.query.q;
    type = req.query.type;
  } else if (req.query.q == null){
    //If it's null we will return with a 400 error and say that a song or artist or album is required
  }

  console.log(req.query.extra);
  //Used so we can be more specific if the user specifies the album or artist
  if (req.query.extra != null){
    extra = extra + req.query.extra;
    extra = extra.replace(' ',"\%20");
    extra = extra.replace(':',"\%3a");
  }

  console.log(playme + extra)
  var requestUrl = '';

  console.log(playme + ' ' + type);
  
  //The artist and album will share similar requests, so we may 
  if (type == 'artist' || type == 'album') {
    if(type == 'album'){
      requestUrl = 'https://api.spotify.com/v1/search?query=' + playme + extra
      + '&type=album';
    } else if (type == 'artist'){
      requestUrl = 'https://api.spotify.com/v1/search?query=artist:' + playme
      + '&type=album';
    }
    
    //Request data to be sent to spotify, returning a json of the track ids and stuff
    const options = {
      url: requestUrl,
      headers: {
      'Accept':'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' +
      spotifyInfo.access_token},
      json: true
      };
      
      //Make the request to spotify to recieve data
      request.get(options, function(error, response, body) {
        //Assign the 
        var randSong = 0;
        var position = Math.floor(Math.random() * body.albums.items.length);
        var songUri = '';

        //If the extra is actually assigned and the type is an album
        if (extra.search('\%3a') == '\%3a' && type == 'album') {
          var albist = extra.split('\%3a')
          console.log(albist);
          albist[1] = albist[1].replace('%20',' ');
          songUri = body.albums.items[position].uri;
          while(albist[1] != body.albums.items[position].artists[0].name.toLowerCase()){
            //Randomly chooses one of the albums that was returned to play
            position = Math.floor(Math.random() * body.albums.items.length);
            randSong = Math.floor(Math.random() * body.albums.items[position].total_tracks);
            songUri = body.albums.items[position].uri;
          }   
          console.log('This is the song uri: ' + songUri);        
        }else {
            //If the album or artist is specified, we'll find a song with that criteria
            //Randomly chooses one of the albums that was returned to play
            position = Math.floor(Math.random() * body.albums.items.length);

            //Randomly chooses a random song off of that album
            randSong = Math.floor(Math.random() * body.albums.items[position].total_tracks);

            //gets the URI of that chosen song
            songUri = body.albums.items[position].uri;
        }

        //Construct the json to send to spotify
        const albumOptions = {
          url: 'https://api.spotify.com/v1/me/player/play',
          body: {
          "context_uri": songUri,
          "offset": {
          "position": randSong
          },
          "position_ms": 0
          },
          headers: {
          'Accept':'application/json',
          'Content-Type' : 'application/json',
          'Authorization': 'Bearer ' +
          spotifyInfo.access_token},
          json: true
          };
          
          request.put(albumOptions, function(error, response, body){
            console.log('We got hereeeeee');
          });
      });

  } else if (type == 'track') {
    //Request data to be sent to spotify, returning a json of the track ids and stuff
    const options = {
      url: 'https://api.spotify.com/v1/search?q=' + playme + extra
      + '&type=track',
      headers: {
      'Accept':'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' +
      spotifyInfo.access_token },
      json: true
      };
      console.log('https://api.spotify.com/v1/search?q=Halloween%20album%3AThe%20Separation&type=track')
      console.log(options.url);
      //Make the request to spotify to recieve data
      request.get(options, function(error, response, body) {
        var songToPlay = [];
        console.log(body);
        //loop through all the items of the item list to find the track to play
        for (var i = 0; i < body.tracks.items.length; i++){
          //Check to see if any of the items in the list have that name
          if (body.tracks.items[i].name.toLowerCase() == playme  && body.tracks.items[i].explicit == 'false'){
            console.log('Found the ' + type + ' with name ' + body.tracks.items[i].name );
            console.log('and the uri of ' + body.tracks.items[i].uri);            

            //If the extra is actually assigned
            if (extra.search('\%3a')) {
              const albist = extra.split('\%3a')
              console.log(albist);
              if ('album' == extra.search('album')){
                if(albist[1] != body.tracks.items[i].album.name){
                  console.log(albist[1] + ' != ' + body.tracks.items[i].album.name + ' album')
                  continue;
                }            
              } else if ('artist' == extra.search('artist')) {
                if(albist[1] != body.tracks.items[i].album.artists[0].name){
                  console.log(albist[1] + ' != ' + body.tracks.items[i].album.artists[0].name + ' artist')
                  continue;
                }
              }
            }

            //Add the song to the array to play
            songToPlay.push(body.tracks.items[i].uri)

            //Tell spotify what song to play
            const trackOptions = {
              url: 'https://api.spotify.com/v1/me/player/play',
              body: {
              "uris" : songToPlay,
              },
              headers: {
              'Accept':'application/json',
              'Content-Type' : 'application/json',
              'Authorization': 'Bearer ' +
              spotifyInfo.access_token},
              json: true
              };
            request.put(trackOptions, function(error, response, body){
              console.log(error);
              console.log('Playing song...');
            });
            break;
          }
        }
      });
  } else {
    console.log('You shouldn"t be here uh-oh');
  }
});

app.get('/change', function(req, res, body){
  if (spotifyInfo.scope != 'user-modify-playback-state')
  {
    spotifyInfo.scope = 'user-modify-playback-state';
    res.redirect('/');
  }

  var seekUrl = 'do nothing and will not do anything to the current playback'

  //if the user wants to go to the next song
  if (req.query.forward == 'true'){
    seekUrl = 'https://api.spotify.com/v1/me/player/next';
    //if the user wants to go to the previous song
  } else if (req.query.forward == 'false') { 
    seekUrl = 'https://api.spotify.com/v1/me/player/previous';
  } else {
    console.log('incorrect user input!');
  }

  const options = { 
    url: seekUrl,
    headers: { 
      'Accept':'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + 
      spotifyInfo.access_token },
    json: true
  };

  request.post(options, function(error, response, body) {
    if (req.query.forward){
      console.log('Went to the next song');
    } else if(!req.query.forward){
      console.log('Went to the previous song');
    } else {
      console.log('We don wrong!!');
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);