const sample = (req, res) => {
    console.warn(req.query);
    return 'success';
};

export default {
    sample
};