var { Spotify } = require('../index');
var request = require('request'); // "Request" library

//Can update the volume of the current player
function Volume(req, res){
    if (req.query.volume){
      if (req.query.volume == 'up'){
        //Make sure the volume isn't above 100
        if (Spotify.volume >= 100) {
          Spotify.volume = 100;
        } else {
          Spotify.volume += 10;
        }
      } else if (req.query.volume == 'down') {
        if (0 >= Spotify.volume){
          Spotify.volume = 0;
        } else{
          Spotify.volume -= 10;
        }
      }
    
      const options = { 
        url: 'https://api.spotify.com/v1/me/player/volume?volume_percent=' + Spotify.volume,
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
            status_code: 200,
            message: 'Changed the Volume to ' + Spotify.volume,
          }
          res.json(resp);
        } else {
          const resp = {
            status_code: 404,
            message: 'No Device active to change volume',
          }
          res.json(resp);
        }
      });
    } else {
      const resp = {
        status_code: 400,
        message: 'No volume amount provided',
      }
      res.json(resp);
    }
  };

  module.exports = {
    Volume
  }