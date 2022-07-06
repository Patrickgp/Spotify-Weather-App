
var redirect_uri = "http://127.0.0.1:5500/webapp.html"; // add your local machines url for webapp.html

// add spotify developer credintials here
var client_id = "89477f209ae54257864f98520a9135f7"; 
var client_secret = "bde123de50164ed784bf56ffc1c05c6a"; 

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";

let playlistIdentifier = '6nxPNnmSE0d5WlplUsa5L3?si=5804055427cc4e14';
const PLAYLIST = "https://api.spotify.com/v1/playlists/" + playlistIdentifier;


function onPageLoad() {
  localStorage.setItem("client_id", client_id);
  localStorage.setItem("client_secret", client_secret);

  if (window.location.search.length > 0) {
    handleRedirect();
  }
}

function handleRedirect() {
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("", "", redirect_uri);
}

function fetchAccessToken(code) {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secr et=" + client_secret;
  callAuthorizationApi(body);
}

function refreshAccessToken() {
  refresh_token = localStorage.getItem("refresh_token");
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refresh_token;
  body += "&client_id=" + client_id;
  callAuthorizationApi(body);
}

function callAuthorizationApi(body) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader(
    "Authorization",
    "Basic " + btoa(client_id + ":" + client_secret)
  );
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    var data = JSON.parse(this.responseText);
    if (data.access_token != undefined) {
      access_token = data.access_token;
      localStorage.setItem("access_token", access_token);
    }
    if (data.refresh_token != undefined) {
      refresh_token = data.refresh_token;
      localStorage.setItem("refresh_token", refresh_token);
    }
    onPageLoad();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function getCode() {
  let code = null;
  const queryString = window.location.search;
  if (queryString.length > 0) {
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get("code");
  }
  return code;
}

function requestAuthorization() {
  localStorage.setItem("client_id", client_id);
  localStorage.setItem("client_secret", client_secret);

  let url = AUTHORIZE;
  url += "?response_type=code";
  url += "&client_id=" + client_id;
  url +=
    "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
  url += "&show_dialog=true";
  window.location.href = url;
}

function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + access_token);
  xhr.send(body);
  xhr.onload = callback;
}

function pickPlaylist(){

    function refreshPlaylist() {
        callApi("GET", PLAYLIST, null, handlePlaylistResponse);
      }
      
      function handlePlaylistResponse() {
        if (this.status == 200) {
          var data = JSON.parse(this.responseText);
          displaySongs(data);
      
        } else if (this.status == 401) {
      
          refreshAccessToken();
        } else {
      
          console.log(this.responseText);
          alert(this.responseText);
        }
      }
      
    refreshPlaylist();
};

let count = 0;
let songList = document.querySelector('#song-list');

function displaySongs(data){

for (let i = 0; i < 5; i++){

    const playlist = data.tracks.items.length;
    let randomSong = Math.floor(Math.random() * playlist);


    const songListItem = document.createElement("div");
    const albumArt = document.createElement("img");
    const songName = document.createElement("div");
    const artistName = document.createElement("div");
    const trackPlayer = document.createElement("div");
    const songPreview = document.createElement("audio");
    const playPause = document.createElement("button");

    songListItem.setAttribute("id", "song-list-item");
    albumArt.setAttribute("id", "album-art");
    songName.setAttribute("id", "song-name");
    artistName.setAttribute("id", "artist-name");
    trackPlayer.setAttribute("id", "track-player");
    songPreview.setAttribute("id", "song-preview");
    playPause.setAttribute("id", "play-pause");
    playPause.textContent = "Play/Pause";

    songList.appendChild(songListItem);
    songListItem.appendChild(albumArt);
    songListItem.appendChild(songName);
    songListItem.appendChild(artistName);
    songListItem.appendChild(trackPlayer);
    trackPlayer.appendChild(songPreview);
    trackPlayer.appendChild(playPause);
    playPause.onclick = function() {
        if(count == 0){
            count = 1;
            songPreview.play();
        }
        else{
            count = 0;
            songPreview.pause();
        }
    };

    trackPreview = data.tracks.items[randomSong].track.preview_url;

    albumArt.src = data.tracks.items[randomSong].track.album.images[1].url;
    songName.textContent = data.tracks.items[randomSong].track.name;
    artistName.textContent = data.tracks.items[randomSong].track.artists[0].name;
    songPreview.src = trackPreview;

    // checks if track has preview audio, if not remove the song and rerun the loop
    if(trackPreview === null){
        songList.remove(songListItem);
        i--;
    }

}
};


