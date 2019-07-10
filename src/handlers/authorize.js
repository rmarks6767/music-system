var { Spotify } = require('../index');
var { MakeString } = require('./generate-random-string');
var request = require('request'); // "Request" library

Spotify.app.get('/', function(req, res) {

    var state = MakeString(16);
    res.cookie(Spotify.stateKey, state);
  
    // your application requests authorization
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: Spotify.client_id,
        scope: Spotify.scope,
        redirect_uri: Spotify.redirect_uri,
        state: state
      }));
  });
  
  //After the main / happens, it redirects to here
  Spotify.app.get('/callback', function(req, res) {
  
    // your application requests refresh and access tokens
    // after checking the state parameter
  
    Spotify.code = req.query.code || null;
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
          code: Spotify.code,
          redirect_uri: Spotify.redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(Spotify.client_id + ':' + Spotify.client_secret).toString('base64'))
        },
        json: true
      };
  
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            Spotify.auth = true;
            Spotify.access_token = body.access_token,
            Spotify.refresh_token = body.refresh_token;
  
          var toptions = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + Spotify.access_token },
            json: true
          };
  
          // use the access token to access the Spotify Web API
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
                Spotify.access_token },
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
  });
  
  //Refreshes the token that is required
  Spotify.app.get('/refresh_token', function(req, res) {
  
    // requesting access token from refresh token
    Spotify.refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(Spotify.client_id + ':' + Spotify.client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: Spotify.refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        Spotify.access_token = body.access_token;
        res.send({
          'access_token': Spotify.access_token
        });
      }
    });
  });