var { MakeString } = require('./generate-random-string');
var request = require('request'); // "Request" library
var querystring = require('querystring');


const Authorize = function Authorize(req, res, spotify) {

    var state = MakeString(16);
    res.cookie(spotify.stateKey, state);
  
    // your application requests authorization
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: spotify.client_id,
        scope: spotify.scope,
        redirect_uri: spotify.redirect_uri,
        state: state
      }));
  };
  
  //After the main / happens, it redirects to here
const Callback = function Callback(req, res, spotify) {
  
    // your application requests refresh and access tokens
    // after checking the state parameter
  
    const code = req.query.code || null;
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
          code: code,
          redirect_uri: spotify.redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(spotify.client_id + ':' + spotify.client_secret).toString('base64'))
        },
        json: true
      };
  
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
                  console.log(response.statusCode);
                  if (body.length < 1){
                    const resp = {
                      status_code : 404,
                      error: 'Auth successful, but no active devices found', 
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
                    message: 'Authentication failed', 
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
    }
  };
  
  //Refreshes the token that is required
const Refresh = function Refresh(req, res, spotify) {
  
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
  };

module.exports = {
  Authorize, Callback, Refresh
}