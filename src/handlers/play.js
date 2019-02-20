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

    const response = playme.get('https://api.spotify.com/'
    + index.access_token
    + '/v1/me/player/devices'); 
    console.log(response);

    console.log('https://api.spotify.com/'
    + index.access_token
    + '/v1/me/player/devices');

    //play the audio


};

export default {
    play
}