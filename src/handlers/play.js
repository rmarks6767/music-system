import Spotify from './spotify-player';

const play = (req, res) => {
    const what_to_play = req.query.play;
    console.log(what_to_play);
    console.log(req.query);

    // player.connect().then(success => {
    //     if (success) {
    //       console.log('Connected to Player');
    //     }
    //   })
};

export default {
    play
}