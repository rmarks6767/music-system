import express from 'express';

import {connect} from './handlers';
import {refresh} from './handlers';
import {callback} from './handlers';
import {login} from './handlers';


let client_id = process.env.CLIENTKEY; // Your client id
let client_secret = process.env.SECRETKEY; // Your secret
let redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

const app = express();
const port = 8888;

app.get('/', function(req,res) {
    let stateKey = 'spotify_auth_state';
    app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());
});
app.get('/login', login(client_id, redirect_uri, res));
app.get('/callback', callback(client_id, client_secret, redirect_uri, req, res));
app.get('/refresh_token', refresh(client_id, client_secret, req, res));

console.log('Listening on ${port}');
app.listen(8888);

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
    };
