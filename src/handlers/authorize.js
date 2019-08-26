var { MakeString } = require('./generate-random-string');
var request = require('request'); // "Request" library
var querystring = require('querystring');

module.exports = {
  Authorize: function(req, res, spotify) {
    console.log("YYYEETETT")
    var state = MakeString(16);
    res.cookie(spotify.stateKey, state);
    var pp = req.cookies ? req.cookies[spotify.stateKey] : null;
    console.log(pp)
    // your application requests authorization
    res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + spotify.client_id +
      (spotify.scopes ? '&scope=' + encodeURIComponent(spotify.scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(spotify.redirect_uri));
  },
  // After the main / happens, it redirects to here
  Callback: function(req, res, spotify) {
    // your application requests refresh and access tokens
    // after checking the state parameter
    spotify.code = req.query.code || null;
    console.log("This is the code: " + spotify.code)
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[spotify.stateKey] : null;
    /*if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {*/
      res.clearCookie(spotify.stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: spotify.code,
          redirect_uri: spotify.redirect_uri,
          grant_type: 'authorization_code',
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer.alloc(spotify.client_id + ':' ).toString('base64'))
        },
        json: true
      };
      console.log("Yeet")
      console.log(authOptions)
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            spotify.auth = true;
            spotify.access_token = body.access_token,
            spotify.refresh_token = body.refresh_token;
  
          var toptions = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + spotify.access_token },
            json: true
          };
          // use the access token to access the spotify Web API
          request.get(toptions, function(error, response, body) {
            console.log(body);
  
            // we can also pass the token to the browser to make requests from there
            //get the device id that just opened that site
            const options = {
              url: 'https://api.spotify.com/v1/me/player/devices',
              headers: { 
                'Accept':'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer ' + 
                spotify.access_token },
              json: true
            };
               request.get(options, function(error, response, body) {
                if (body != null){
                  console.log(body)
                  console.log(response.statusCode);
                  if (response.statusCode >= 400){
                    const resp = {
                      status_code : response.statusCode,
                      error: 'No active Devices! (click play on your spotify account to register it)', 
                    }
                    res.json(resp);
                  } else {
                    const resp = {
                      status_code : 200,
                      message: 'Device found and auth successful', 
                    }
                    res.json(resp);
                  }
                } else {
                  const resp = {
                    status_code : 444,
                    message: 'Authentication failed: ' + body, 
                  }
                  res.json(resp);
                }
            });
          });
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    //}
  },
  //Refreshes the token that is required
  Refresh: function(req, res, spotify) {
  
    // requesting access token from refresh token
    spotify.refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(spotify.client_id + ':' + spotify.client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: spotify.refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        spotify.access_token = body.access_token;
        res.send({
          'access_token': spotify.access_token
        });
      }
    });
  }
} 