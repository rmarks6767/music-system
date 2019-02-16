const play = (req, res) => {
    const what_to_play = req.query.play;
    console.log(what_to_play);
};

export default {
    play
}