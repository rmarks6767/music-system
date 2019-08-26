var express = require('express'); // Express web server framework
var cors = require('cors');
var cookieParser = require('cookie-parser');

var { Authorize, Callback, Refresh } = require('./handlers/authorize');
var { Change } = require('./handlers/change.js');
var { Pause } = require('./handlers/pause.js');
var { Resume } = require('./handlers/resume.js');
var { Volume } = require('./handlers/volume-change.js');
var { Play } = require('./handlers/play.js');
var { Spotify } = require('./spotify.js');

app = express();
var spotify = new Spotify(process.env.CLIENTKEY, process.env.SECRETKEY, process.env.REDIRECT);
// Definition of the endpoints

// Auth endpoints
app.get('/', (req, res) => {
   Authorize(req, res, spotify)
});
app.get('/refresh_token', (req, res) => {
   Refresh(req, res, spotify)
});
app.get('/callback', (req, res) => {
   Callback(req, res, spotify)
});

// Select Song
app.get('/play', (req, res, spotify) => Play(req, res, spotify));

// Volume
app.get('/volume', (req, res, spotify) => Volume(req, res, spotify));

// Change Song
app.get('/change', (req, res, spotify) => Change(req, res, spotify));

// Pause / Play song
app.get('/pause', (req, res, spotify) => Pause(req, res, spotify));
app.get('/resume', (req, res, spotify) => Resume(req, res, spotify));

var port = 8888;
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())
   .listen(port, console.log(`Listening on ${port}...`));


   