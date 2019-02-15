import Spotify from 'spotify-web-api-node';
import Express from 'express';
import {exampleget} from './handlers';
import {login} from './handlers';

const app = Express();
const port = 3000;

// const spotifyApi = Spotify({
//      clientId: process.env.CLIENTKEY,
//      clientSecret: process.env.SECRETKEY
// });

app.get('/login', login.connect);
app.get('/queue', );
app.get('/play',);
app.get('/pause',);
app.get('/skip',);
app.get('/volume',)

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

