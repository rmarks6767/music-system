import Spotify from 'spotify-web-api-node';
import Express from 'express';


// const spotifyApi = Spotify({
//     clientId: secret,

// });


const app = Express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

