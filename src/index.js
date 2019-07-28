var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var cookieParser = require('cookie-parser');
var { Authorize, Callback, Refresh } = require('./handlers/authorize');
var { Change } = require('./handlers/change.js');
var { Pause } = require('./handlers/pause.js');
var { Resume } = require('./handlers/resume.js');
var { Volume } = require('./handlers/volume-change.js');
var { Play } = require('./handlers/play.js');

app = express();

const client_id = process.env.CLIENTKEY; 
const client_secret = process.env.SECRETKEY;
const redirect_uri = process.env.REDIRECT;
var code = 'null';
var access_token = 'null';
var refresh_token = 'null';
var device = [];
var scope = 'user-modify-playback-state';
var track = 'null';
var volume = 100;
var queue = [];
var auth = false
var stateKey = 'spotify_auth_state';

// Definition of the endpoints

// Auth endpoints
app.get('/', Authorize(req, res));
app.get('/refresh_token', Refresh(req, res))
app.get('/callback', Callback(req, res));

// Select Song
app.get('/play', Play(req, res));

// Volume
app.get('/volume', Volume(req, res));

// Change Song
app.get('/change', Change(req, res));

// Pause / Play song
app.get('/pause', Pause(req, res));
app.get('/resume', Resume(req, res));

var port = 8888;
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())
   .listen(port, c => console.log(`Listening on ${port}...`));