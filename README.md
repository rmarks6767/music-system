# Futurustic Car Music System
Imagine RIT project that takes Google DialogueFlow requests through query data passed locally into a Node.js application.  The application establishes a connection to Spotify by sending the Client Id and the Client Secret that is associated with the app.  This request returns an access token that can be used to access Spotify's library and play songs that the user requests.

## Installation
```
git clone https://github.com/rmarks6767/music-system.git
sudo dnf install nodejs
npm i -g babelrc-install
npm install express
npm install request
npm install cors
npm install querystring
npm install cookie-parser
npm install play-sound
```
## End Points for NodeJs api:

### Initial Call

```http://musicsystem-imagine-rit-music-player.cs.house/```
#### Redirects to: ```http://musicsystem-imagine-rit-music-player.cs.house/callback```
#### This will redirect and authenticate the Spotify Player.  This must be called after the player has been opened and run once, otherwise it will not be able to find the active device.

### Refresh
```
http://musicsystem-imagine-rit-music-player.cs.house/refresh
```
#### This will need to be called once every 60 minutes to re authenticate the player.  Calling this will get a new auth token, the item that needs to be refreshed.

### Play
#### Base Endpoint and Example:
##### Base: ```http://musicsystem-imagine-rit-music-player.cs.house/play?```
##### In this example, we are searching for the artist Jon Bellion and we specify this with the track.  The extra is used to specify either a 
#### Query Parameter
```q={track}{artist}{album}```
```q=jon%20bellion```
##### The query takes either an artist, track, or album.  This type is then specificed with the type.
#### Type parameter
```type=track/artist/album```
```type=artist```
##### The type parameter is responsible for specifying the above query parameter, so it can be played properly.  To default the type, send track as the type param.
#### Extra Parameter 
```extra=album:/artist:{album}{artist}```
```extra=album:the%20human%20condition```
##### The extra parameter is an optional parameter that may be used to specify a track or album using an artist or album.  If this is not included it will get the default that is returned from Spotify.
#### All together:
```http://musicsystem-imagine-rit-music-player.cs.house/play?q=jon%20bellion&type=artist&extra=album:the%20human%20condition```
##### This is an example of one of the endpoints you can hit.  Each of the pieces is separated using a & and all spaces between things must have %20.
### Pause / Resume

### Change (Next / Previous)

### Volume
