var request = require('request'); // "Request" library

//Can update the volume of the current player
function Volume(req, res, spotify){
    if (req.query.volume){
      if (req.query.volume == 'up'){
        //Make sure the volume isn't above 100
        if (spotify.volume >= 100) {
          spotify.volume = 100;
        } else {
          spotify.volume += 10;
        }
      } else if (req.query.volume == 'down') {
        if (0 >= spotify.volume){
          spotify.volume = 0;
        } else{
          spotify.volume -= 10;
        }
      }
    
      const options = { 
        url: 'https://api.spotify.com/v1/me/player/volume?volume_percent=' + spotify.volume,
        headers: { 
          'Accept':'application/json',
          'Content-Type' : 'application/json',
          'Authorization': 'Bearer ' + 
          spotify.access_token },
        json: true
      };
  
      request.put(options, function(error, response, body) {
        if (!error && response.statusCode === 204) {
          const resp = {
            status_code: 200,
            message: 'Changed the Volume to ' + spotify.volume,
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