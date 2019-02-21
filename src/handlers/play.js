import Express from 'express';
import index from '../index.js';

const play = (req, res, access_token) => {
    //take in the user input
    const what_to_play = req.query.play;
    console.log(what_to_play);
    console.log(req.query);

    //translate the user input into the track ids that are to be sent to spotify



    const playme = Express();
    
    //Make a call to spotify with the info to get the audio to play

    console.log(playme.get('https://accounts.spotify.com/authorize?client_id='
    + process.env.CLIENTKEY + '&response_type=code&redirect_uri=' +
    'http://localhost:8888/callback&scope=user-read-private%20user-read-email&state=34fFs29kd09'));

    //play the audio


};

export default {
    play
}