var redirect_uri = ""; // add your local machines url for webapp.html

// add spotify developer credintials here
var client_id = "";
var client_secret = "";

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const TRACKS =
  "https://api.spotify.com/v1/tracks/1rDQ4oMwGJI7B4tovsBOxc?si=1cf3079642304fd2&nd=1";

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

function refreshTrack() {
  callApi("GET", TRACKS, null, handleTrackResponse);
}

function handleTrackResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

// OPENWEATHER API

// This variable will hold the user searched city
var city = "";

// Defining my variables
var searchCity = $("#searchCity");
var searchButton = $("#searchButton");
var clearButton = $("#clearHistory");
var currentCity = $("#currentCity");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var savedCities = [];

// This loop searches the city to see if it exists in the "saved city search"
function find(c) {
  for (var i = 0; i < savedCities.length; i++) {
    if (c.toUpperCase() === savedCities[i]) {
      return -1;
    }
  }
  return 1;
}

// API Key
var APIKey = "3f4c7d14daab872155f896009f745a0a";

// Get the city inputted by the user
function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    currentWeather(city);
  }
}

// Get the current weather conditions by city
function currentWeather(city) {
  var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}&units=imperial`;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    for (i = 0; i < 5; i++) {
      var date = new Date(
        response.list[(i + 1) * 8 - 1].dt * 1000
      ).toLocaleDateString();
      var temp = response.list[(i + 1) * 8 - 1].main.temp_max;
      var humidity = response.list[(i + 1) * 8 - 1].main.humidity;
      var iconcode = response.list[(i + 1) * 8 - 1].weather[0].icon;
      var iconurl = `http://openweathermap.org/img/wn/${iconcode}.png`;
    }
    console.log(response);
    var lat = response.city.coord.lat;
    var lon = response.city.coord.lon;
    var weatherIcon = response.list[0].weather[0].icon;
    var iconurl = `http://openweathermap.org/img/wn/${weatherIcon}.png`;
    var date = new Date(response.list[0].dt * 1000).toLocaleDateString();
    $(currentCity).html(response.city.name + "<img src=" + iconurl + ">");
    var temp = response.list[0].main.temp;
    $(currentTemperature).html(temp.toFixed(2) + "&#8457");
    $(currentHumidity).html(response.list[0].main.humidity + "%");
    if (response.cod == 200) {
      savedCitiies = JSON.parse(localStorage.getItem("cityname"));
      if (savedCitiies == null) {
        savedCitiies = [];
        savedCitiies.push(city.toUpperCase());
        localStorage.setItem("cityname", JSON.stringify(savedCitiies));
        addToList(city);
      } else {
        if (find(city) > 0) {
          savedCitiies.push(city.toUpperCase());
          localStorage.setItem("cityname", JSON.stringify(savedCitiies));
          addToList(city);
        }
      }
    }
  });
}

// Add city to search history
function addToList(city) {
  var listEl = $("<li>" + city.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", city.toUpperCase());
  $(".list-group").append(listEl);
}

// Display past search items
function pastSearch(event) {
  var liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

// start function
function previousCity() {
  $("ul").empty();
  var savedCities = JSON.parse(localStorage.getItem("cityname"));
  if (savedCities !== null) {
    savedCities = JSON.parse(localStorage.getItem("cityname"));
    for (i = 0; i < savedCities.length; i++) {
      addToList(savedCities[i]);
    }
    city = savedCities[i - 1];
    currentWeather(city);
  }
}

// Clear previous search history
function clearHistory(event) {
  event.preventDefault();
  savedCities = [];
  localStorage.removeItem("cityname");
  document.location.reload();
}

$("#searchButton").on("click", displayWeather);
$(document).on("click", pastSearch);
$(window).on("load", previousCity);
$("#clearHistory").on("click", clearHistory);
