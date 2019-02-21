import Express from 'express';
import index from '../index';

const play = (req, res, access_token) => {
    //take in the user input
    const what_to_play = req.query.play;
    console.log(what_to_play);
    console.log(req.query);

    //translate the user input into the track ids that are to be sent to spotify



    const playme = Express();
    
    //Make a call to spotify with the info to get the audio to play

    console.log(playme.get('g'));

    console.log(index.access_token);


};

export default {
    play
}