var { Spotify } = require('../index');
var request = require('request'); // "Request" library

//Resumes the current song of the player
Spotify.app.get('/resume', function(req, res, body){
    //get a new auth token only if it needs to 
    if (Spotify.scope != 'user-modify-playback-state')
    {
      Spotify.scope = 'user-modify-playback-state';
      res.redirect('/');
    }
    const options = { 
      url: 'https://api.spotify.com/v1/me/player/play',
      headers: { 
        'Accept':'application/json',
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + 
        Spotify.access_token },
      json: true
    };
  
    request.put(options, function(error, response, body) {
      if (!error && response.statusCode === 204) {
        const resp = {
          status_code : 200,
          message: 'Resuming song', 
        }
        res.json(resp);
      } else {
        const resp = {
          status_code : 404,
          message: 'Song to resume not found', 
        }
        res.json(resp);
      }  });
  });