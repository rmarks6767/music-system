

 module.exports = {
    Spotify: class {
        constructor(client_id, client_secret, redirect_uri){
           this.client_id = client_id;
           this.client_secret = client_secret;
           this.redirect_uri = redirect_uri;
           this.code = 'null';
           this.refresh_token = 'null';
           this.access_token = 'null';
           this.device = [];
           this.scopes = 'user-modify-playback-state';
           this.track = 'null';
           this.volume = 100;
           this.queue = [];
           this.auth = false
           this.stateKey = 'spotify_auth_state';
        }
     }
 }