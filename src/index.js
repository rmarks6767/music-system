import Spotify from 'spotify-web-api-node';
import Express from 'express';
import {exampleget} from './handlers';

// const spotifyApi = Spotify({
//     clientId: secret,

// });


const app = Express();
const port = 3000;

app.get('/', );
app.get('/queue', exampleget.sample);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

