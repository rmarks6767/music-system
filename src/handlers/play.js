var request = require('request'); // "Request" library

//Things to add:
// *** Add working queue and checking to see what is currently playing -- Talk to Owen about this after all the above is done
function Play(req, res, spotify){  
    if (spotify.auth) {
      //Both the q and the type must be satisfied, otherwise we will throw an error
      var playme = null;
      var extra = '';
      //The default will be a track if the user specifies nothing
      var type = 'track';
      //Make sure that either of the required queries are filled
      if (req.query.q && req.query.type) {
  
        playme = req.query.q;
        type = req.query.type;
        //Used so we can be more specific if the user specifies the album or artist
        if (req.query.extra){
          extra = '%20';
          extra = extra + req.query.extra;
          extra = extra.replace(' ',"\%20");
          extra = extra.replace(':',"\%3a");
        }
        var requestUrl = '';    
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
            spotify.access_token},
            json: true
            };
            
            //Make the request to spotify to recieve data
            request.get(options, function(error, response, body) {
              if (!error && response.statusCode === 200) {
                //Assign the variables
                var randSong = 0;
                var position = Math.floor(Math.random() * body.albums.items.length);
                var songUri = '';
  
                //If the extra is actually assigned and the type is an album
                if (extra.search('\%3a') == '\%3a' && type == 'album') {
                  var albist = extra.split('\%3a')
                  albist[1] = albist[1].replace('%20',' ');
                  songUri = body.albums.items[position].uri;
                  var counter = 0;
                  while(albist[1] != body.albums.items[position].artists[0].name.toLowerCase() || counter > 20){
                    //Randomly chooses one of the albums that was returned to play
                    position = Math.floor(Math.random() * body.albums.items.length);
                    randSong = Math.floor(Math.random() * body.albums.items[position].total_tracks);
                    songUri = body.albums.items[position].uri;
                    counter++;
                  }   
                  console.log('Found the ' + type + ' with name ' + body.albums.items[position].artists[0].name);
                  console.log('and the uri of ' + body.albums.items[position].uri);          
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
                  spotify.access_token},
                  json: true
                  };
                  
                request.put(albumOptions, function(error, response, body){
                  if (!error && response.statusCode === 204) {
                    console.log('Playing ' + type + ': ' + playme);
                    const resp = {
                      status_code: 200,
                      message: 'Playing ' + type + ' ' + playme,
                    }
                    res.json(resp);
                  } else {
                    console.log('No songs were found by spotify');
                    const resp = {
                      status_code: 404,
                      message: 'No songs were found by spotify',
                    }
                    res.json(resp);
                  }
                });
              } else {
                //The request returned nothing so we must return that
                const resp = {
                  status_code: 404,
                  message: 'No songs were found by spotify',
                }
                res.json(resp);
              }
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
            spotify.access_token },
            json: true
            };
            //Make the request to spotify to recieve data
            request.get(options, function(error, response, body) {
              if (body.tracks.items.length > 0){
                var songToPlay = [];
                //loop through all the items of the item list to find the track to play
                for (var i = 0; i < body.tracks.items.length; i++){
                  //Check to see if any of the items in the list have that name
                  if (body.tracks.items[i].name.toLowerCase() == playme){  //&& body.tracks.items[i].explicit == 'false'){
                    console.log('Found the ' + type + ' with name ' + body.tracks.items[i].name );
                    console.log('and the uri of ' + body.tracks.items[i].uri);            
  
                    //If the extra is actually assigned
                    if (extra.search('\%3a')) {
                      const albist = extra.split('\%3a')
                      if ('album' == extra.search('album')){
                        //If the specified album is not associated with the current URI we will continue
                        if(albist[1] != body.tracks.items[i].album.name){
                          continue;
                        }            
                      } else if ('artist' == extra.search('artist')) {
                        //If the specified artist is not associated with the current URI we will continue
                        if(albist[1] != body.tracks.items[i].album.artists[0].name){
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
                      spotify.access_token},
                      json: true
                      };
                    request.put(trackOptions, function(error, response, body){
                      console.log('Playing the song: ' + playme);
                      const resp = {
                        status_code: 200,
                        message: 'Playing ' + type + ' ' + playme,
                      }
                      res.json(resp)
                    });
                    break;
                  }
                }
              } else {
                //The request returned nothing so we must return that
                const resp = {
                  status_code: 404,
                  message: 'No songs were found by spotify',
                }
                res.json(resp);
              }
            });
          } else {
            console.log('You shouldn"t be here uh-oh');
          }
      } else {
        //If it's null we will return with a 400 error and say that a song or artist or album is required
        const response = {
          status_code: 400,
          message: 'Missing a Query Parameter',
        }
        res.json(response);
      }
    } else {
      const resp = {
        status_code : 401,
        message: 'Authorization not occurred, please authorize',
      }
      res.json(resp);
    }
  };

  module.exports = {
    Play
  }
  