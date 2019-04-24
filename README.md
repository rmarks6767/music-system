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

## Building Project and Approach


## End Points for NodeJs api:

### Callback
```
http://musicsystem-imagine-rit-music-player.cs.house/
```
#### redirects to:
```
http://musicsystem-imagine-rit-music-player.cs.house/callback
```
#### This will redirect and authenticate the Spotify Player.  This must be called after the player has been opened and run once, otherwise it will not be able to find the active device.

### Refresh
```
http://musicsystem-imagine-rit-music-player.cs.house/refresh
```
#### This will need to be called once every 60 minutes to re authenticate the player.  Calling this will get a new auth token, the item that needs to be refreshed.

### Play

#### q=

#### type=

####

### Pause / Resume

### Change (Next / Previous)

### Volume
