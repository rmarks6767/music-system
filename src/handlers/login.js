import Spotify from 'spotify-web-api-node';

const connect = (req, res) => {
    const spotify = new Spotify ({
        clientId: process.env.CLIENTKEY,
        clientSecret: process.env.SECRETKEY,
        rederectUri: 'http:localhost/success'
    })

    spotify.setAccessToken('BQDATwjzJzF2CnIk69YcvASHl'
    + 'YFu0yVVWs-W7ixDv8Si0GpWdMwyWGsXcZ62UAifOFAN_BmGbf'
    + 'XR7UmvJxO4KJN_wQrA8_Bl966o8oVVUj4GMqbL9toTJsTRrOD'
    + 'gQkQ0QTIJiuByR8BOR5blEolB3Amzffpw4JiiUCdQoh1y')
};

export default {
    connect
}
