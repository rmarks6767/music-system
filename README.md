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
#### Redirects to: 
```http://musicsystem-imagine-rit-music-player.cs.house/callback```
#### This will redirect and authenticate the Spotify Player.  This must be called after the player has been opened and run once, otherwise it will not be able to find the active device.

#### Possible Error Codes:

##### 200 - Success in auth and active device found
##### 404 - Authentication success but no active devices
##### 444 - Authentication failed

### Refresh Token
```
http://musicsystem-imagine-rit-music-player.cs.house/refresh_token
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
##### This is an example of one of the endpoints you can hit.  Each of the pieces is separated using an & and all spaces between things must have %20.

#### Possible Errors and Status Codes:

##### 200 - Success Everything Connected Properly and Song Found
##### 400 - Missing one of the Required Parameters (Type or Query)
##### 401 - Authorization has not occured, please call the '/' endpoint
##### 404 - No songs found by Spotify

### Pause / Resume
```/pause```
#### Pauses the currently playing music

```/resume```
#### Resumes the music that was playing

#### Possible Error Codes:

##### 200 - Success, song paused / played
##### 404 - Authorization not occured / player not found, call the '/' endpoint
### Change (Next / Previous)
```/change?forward=true```
#### Setting the forward parameter will cause the player to go forwards or backwards, given that there are songs in the queue or it is just shuffling music

### Volume
```/volume?volume=69```
#### Calling the volume endpoint and setting the volume parameter equal to a number will cause the player to go to that volume.  If it is over or under it will default to the closest value.
#### Possible Error Codes:

##### 200 - Song Successfully changed
##### 400 - Invalid / missing query parameter
##### 404 - Player not found, call the endpoint '/' to reauthenticate the player
