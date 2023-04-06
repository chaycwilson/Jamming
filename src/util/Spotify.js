const clientId = '2012ae5e81c2432b97a095ab7ed089f5'
const redirect = 'http://physical-spiders.surge.sh'

let accessToken;
export const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken 
        }
        const tokenMatch = window.location.href.match(/access_token=([^&]*)/)
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/)

        if (tokenMatch && expiresInMatch) {
            accessToken = tokenMatch[1]
            const expiresIn = Number(expiresInMatch[1])
            window.setTimeout(()=> accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/')
            return accessToken;
        } else {
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirect}`
            window.location = accessURL
        }
    },

    search(searchTerm) {
        const accessToken = Spotify.getAccessToken()
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`,
        {headers: {
            Authorization: `Bearer ${accessToken}`
        }}).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return []
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name, 
                uri: track.uri
            }))
        })
        
    },

    savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) {
          return;
        }
    
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        let userId;
    
        return fetch('https://api.spotify.com/v1/me', {headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
          userId = jsonResponse.id;
          return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({name: name})
          }).then(response => response.json()
          ).then(jsonResponse => {
            const playlistId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
              headers: headers,
              method: 'POST',
              body: JSON.stringify({uris: trackUris})
            });
          });
        });
      }
}

//console.log(Spotify.getAccessToken())
//console.log(Spotify.savePlaylist('the weeknd'))
//console.log(Spotify.searchTerm)