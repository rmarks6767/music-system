var request = require('request'); // "Request" library

function Change(req, res, spotify){
    if (req.query.forward 
      && (req.query.forward == 'true' 
      || req.query.forward == 'false'))
    {
      if (spotify.scope != 'user-modify-playback-state')
      {
        spotify.scope = 'user-modify-playback-state';
        res.redirect('/');
      }
  
      var seekUrl = 'do nothing and will not do anything to the current playback'
  
      //if the user wants to go to the next song
      if (req.query.forward == 'true'){
        seekUrl = 'https://api.spotify.com/v1/me/player/next';
        //if the user wants to go to the previous song
      } else if (req.query.forward == 'false') { 
        seekUrl = 'https://api.spotify.com/v1/me/player/previous';
      }
  
      const options = { 
        url: seekUrl,
        headers: { 
          'Accept':'application/json',
          'Content-Type' : 'application/json',
          'Authorization': 'Bearer ' + 
          spotify.access_token },
        json: true
      };
  
      request.post(options, function(error, response, body) {
        if (!error && response.statusCode === 204){
          const resp = {
            status_code : 200,
            message : 'Going to ' + req.query.forward + ' song',
          }
          res.json(resp);
        } else {
          const resp = {
            status_code : 404,
            message : 'Active player not found'
          }
          res.json(resp);
        }
      });
    } else {
      const resp = {
        status_code : 400,
        message : 'Invalid query parameter'
      }
      res.json(resp);
    }
  }

  module.exports = {
    Change
  }