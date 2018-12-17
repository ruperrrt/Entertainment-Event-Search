const express = require('express');
const geohash = require('ngeohash');
const app = express();
const https = require('https');
const path = require('path');
const tmApiKey = 'ROuQKhnmyYA4ggSQPGo3ESonMiSmTZ6r';
const geoCodeApiKey = 'AIzaSyBtJNQWzt50cL-rIUX1g_3PP5qGoHxkI3Y';
const ggSearchApiKey = 'AIzaSyBodsPq_MQbPJP_CIAts4vYKl6J8sfp5yM';
const searhEngineID = '016296161161597227096:a23qkqlkra8';
const songkickApiKey = 'ssognOPYwGmOZTB0';
var moment = require('moment');
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: '3538d81d143041de90bf04ecfec74ac3',
  clientSecret: 'da4fa52526784541818c22312f792ad4',
})


// console.log(expired);

console.log(__dirname + '/../src');

// app.use(express.static(__dirname + '/../dist/hw8'));
// app.get('/*', (req, res) => res.sendFile(path.join(__dirname)));


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Header",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use( "/api/getAutoComplete" , (req, res, next) => {
   console.log(req.query.keyword);
  var input = req.query.keyword;
  https.get('https://app.ticketmaster.com/discovery/v2/suggest?apikey='+tmApiKey+'&keyword='+input , (resp) => {
    let attraction = {};
    let buffer = '';
    let output = [];
    resp.on('data', (d) => {
      buffer += d;
    });

    function processResponse() {
      // console.log(JSON.stringify(JSON.parse(buffer), null, 2));

      if (JSON.parse(buffer)._embedded) {
        attraction = JSON.parse(buffer)._embedded.attractions;
      } else {
        console.log("Embeded not available.");
      }
      if (!attraction.length) {
        console.log("attractions not available");
      }
      // let names = [];
      for (let index = 0; index < attraction.length; index++) {
        //output = attraction[index].name;
        output.push({name: attraction[index].name});
        //names.push(attraction[index].name);
        //console.log(attraction[index].name);
        //console.log(output);
      }
    }
    resp.on('end', () => {

      processResponse();
      //output = names;
      // console.log(output);
      res.status(200).json({
        autocomplete : output
      });
    });
    //console.log(output);

  });
});

app.use('/api/getInfoTab', (req, res, next) => {
  let buffer4 = '';
  let event = {};
  var id = req.query.id;
  var artistAndTeam = '';
  var time = '';
  var category = '';
  var range = '';
  var spotifyRes = '';
  https.get('https://app.ticketmaster.com/discovery/v2/events/'+id+'.json?apikey='+tmApiKey, (resp =>{
  console.log('https://app.ticketmaster.com/discovery/v2/events/'+id+'.json?apikey='+tmApiKey);
  resp.on('data', (d) => {
      buffer4 += d;
    });

    resp.on('end', () => {
      event = JSON.parse(buffer4);
      // console.log(event._embedded.attractions);
      if (event._embedded.attractions) {
        event._embedded.attractions.forEach(element => {
          artistAndTeam += element.name + ' | ';
        });
        if(artistAndTeam.length > 0) {
          artistAndTeam = artistAndTeam.substr(0, artistAndTeam.length-3);
        }
        if(event.dates.start) {
          time = moment(event.dates.start.localDate).format('ll') + ' ' + event.dates.start.localTime;
        }

      }

      let eventDetail = event['classifications'][0];
      if(eventDetail){
          if(eventDetail['genre'] && eventDetail['genre']!='Undefined')
            category += eventDetail['genre']['name'] + ' | ' ;
          if(eventDetail['segment'] && eventDetail['segment']!='Undefined'){
            category += eventDetail['segment']['name'];
          }else{
            category = category.substr(0, category.length-3);
          }

      }

      if(event['priceRanges']){
        range = '$' + event['priceRanges'][0]['min'] + '~$' + event['priceRanges'][0]['max'];
      }

      res.status(200).json({
        artist_team: artistAndTeam,
        venue: (event._embedded && event._embedded.venues) ? event._embedded.venues[0].name : '',
        time: time,
        category: category,
        price_range: range,
        ticket_status: (event.dates && event.dates.status) ? event.dates.status.code : '',
        buy_ticket_at: event.url,
        seat_map: (event.seatmap && event.seatmap.staticUrl) ? event.seatmap.staticUrl : ''
      });
    });

  }))

});

app.use(('/api/getMusicTab'), (req, res, next) => {
  var artist = req.query.artist;

  const getSpotify = function() {
    return new Promise((resolve, reject) => {
      spotifyApi.clientCredentialsGrant().then(
        function(data2) {
          console.log('The access token expires in ' + data2.body['expires_in']);
          console.log('The access token is ' + data2.body['access_token']);
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data2.body['access_token']);
          spotifyApi.searchArtists(artist)
          .then(function(data) {
            console.log('Search artists by "Maroon 5"', data.body.artists);
            spotifyRes = data;
            resolve();
          }, function(err) {
            console.error(err);
          });
        },
        function(err2) {
          console.log('Something went wrong when retrieving an access token', err2);
        },
      );

    })
  };

  getSpotify().then(() =>{
    res.status(200).json ({
      name: spotifyRes.body.artists.items[0].name,
      followers: spotifyRes.body.artists.items[0].followers.total,
      popularity: spotifyRes.body.artists.items[0].popularity,
      url: spotifyRes.body.artists.items[0].external_urls.spotify
    });
  });

});

app.use( '/api/getPhotos', (req, res, next) => {
  var photos = [];
  var q = req.query.q_name;
  https.get('https://www.googleapis.com/customsearch/v1?q='+q
  +'&cx='+searhEngineID+'&imgSize=huge&num=8&searchType=image&key='+ggSearchApiKey, (resp) =>{
    let buffer5 = '';
    resp.on('data', (d) => {
      buffer5 += d;
    });
    resp.on('end', () => {
      if (JSON.parse(buffer5).items){
        JSON.parse(buffer5).items.forEach(element => {
          photos.push(element.link);
        });
      }
      else{
        console.log('items are not available!');
      }
      res.status(200).send(photos);
    })
  })
  ;
});

app.use( '/api/getVenueTab', (req, res, next) => {
  var venue = req.query.venue;
  console.log(venue);
  https.get('https://app.ticketmaster.com/discovery/v2/venues?apikey='+tmApiKey+'&keyword='+venue, (resp) =>{
  let venues = {};
  let buffer6 = '';
    resp.on('data', (d) => {
      buffer6 += d;
    });
    resp.on('end', () => {
      console.log(JSON.parse(buffer6)._embedded);
      if (JSON.parse(buffer6)._embedded && JSON.parse(buffer6)._embedded.venues[0]){
        let temp = JSON.parse(buffer6)._embedded.venues[0];
        venues = {
          name: venue,
          address:  temp.address ? temp['address']['line1'] : '',
          city: temp['city'] ? temp['city']['name'] : '',
          phoneNum: temp['boxOfficeInfo'] ? temp['boxOfficeInfo']['phoneNumberDetail'] : '',
          openHrs: temp['boxOfficeInfo'] ? temp['boxOfficeInfo']['openHoursDetail'] : '',
          generalRule: temp['generalInfo'] ? temp['generalInfo']['generalRule'] : '',
          childRule: temp['generalInfo'] ? temp['generalInfo']['childRule'] : '',
          lat: Number(temp['location']['latitude']),
          lng: Number(temp['location']['longitude'])
        }
      }
      else{
        console.log('venue is not available!');
      }
      res.status(200).send(venues);
    })
  })
  ;
});

app.use( '/api/getUpcoming', (req, res, next) => {
  var venue = req.query.venue;
  var upcoming = [];
  // console.log(venue);

  const get_upcoming = function(venue) {
    return new Promise((resolve, reject) => {
      if(!venue){
        resolve();
        return;
      }
      https.get('https://api.songkick.com/api/3.0/search/venues.json?query='+venue+'&apikey='+songkickApiKey, (resp) =>{
        let buffer7 = '';
        let id = '';
        resp.on('data', (d) => {
          buffer7 += d;
        });
        resp.on('end', () => {
          // console.log(JSON.parse(buffer7).resultsPage.results);
          if (JSON.parse(buffer7).resultsPage && JSON.parse(buffer7).resultsPage.results && JSON.parse(buffer7).resultsPage.results.venue){
            id = JSON.parse(buffer7).resultsPage.results.venue[0].id;
          }
          else{
            console.log('upComingEvent id is not available!');
          }
          resolve(id);
        })
      });
    })
  }

  function upcoming_events(id){
    https.get('https://api.songkick.com/api/3.0/venues/'+id+'/calendar.json?apikey='+songkickApiKey, (resp) =>{
      let buffer8 = '';
      resp.on('data', (d) => {
        buffer8 += d;
      });
      resp.on('end', () => {
        // console.log(JSON.parse(buffer8));
        if (JSON.parse(buffer8).resultsPage.results && JSON.parse(buffer8).resultsPage.results.event){
          let temp2 = JSON.parse(buffer8).resultsPage.results.event;
          temp2.forEach(element => {
            upcoming.push({
              name: element.displayName,
              artist: (element.performance[0] && element.performance[0].artist) ? element.performance[0].artist.displayName : '',
              dateTime: element.start ? moment(element.start.date).format('ll') : '',  // moment(event.dates.start.localDate).format('ll')
              type: element.type,
              url: element.uri
            })
          });
        }
        else{
          console.log(id);
          console.log('upComingEvents are not available!');
        }
        res.status(200).send(upcoming);
      })
    });
  }

  get_upcoming(venue).then((id) => {
    upcoming_events(id);
  }

  )


});

app.use('/api/getEvents', (req, res, next) => {
  // console.log(req.query.lat);
  // console.log(req.query.lng);
  var keyword = req.query.keyword, lat = req.query.lat, lng = req.query.lng, category = req.query.category,
  distance = req.query.distance, location = req.query.location, unit = req.query.unit;

  const get_location = function(location) {
    return new Promise((resolve, reject) => {
      if(!location){
        resolve();
        return;
      }
      // console.log(location);
      const request = https.get('https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key='+geoCodeApiKey, (resp) => {
      let buffer2 = '';
      resp.on('data', (d) => {
        buffer2 += d;
      });

      resp.on('end', () => {
        // console.log(buffer2);
        if (JSON.parse(buffer2)['results'][0]['geometry']['location']) {
          lat = JSON.parse(buffer2)['results'][0]['geometry']['location']['lat'];
          lng = JSON.parse(buffer2)['results'][0]['geometry']['location']['lng'];
        } else {
          console.log("JSON does not have the field");
        }
        resolve({lat: lat, lng: lng});
      });
    });
    })
  };

  function get_event(x, y){
    keyword = encodeURI(keyword);
    var segmentId = '';
    if(category == 'music') segmentId = 'KZFzniwnSyZfZ7v7nJ';
    else if(category == 'sports') segmentId = 'KZFzniwnSyZfZ7v7nE';
    else if(category == 'at') segmentId = 'KZFzniwnSyZfZ7v7na';
    else if(category == 'film') segmentId = 'KZFzniwnSyZfZ7v7nn';
    else if(category == 'miscellaneous') segmentId = 'KZFzniwnSyZfZ7v7n1';
    var geoPoint = geohash.encode(x, y);
    // console.log(x+','+y);
    // console.log('https://app.ticketmaster.com/discovery/v2/events.json?apikey=' + tmApiKey + '&keyword=' + keyword + '&segmentId='
    // + segmentId + '&radius=' + distance + '&unit=' + unit + '&geoPoint=' + geoPoint);
    https.get('https://app.ticketmaster.com/discovery/v2/events.json?apikey=' + tmApiKey + '&keyword=' + keyword + '&segmentId='
    + segmentId + '&radius=' + distance + '&unit=' + unit + '&geoPoint=' + geoPoint, (resp) => {
      let buffer3 = '';
      resp.on('data', (d) => {
        buffer3 += d;
      });
      resp.on('end', () => {
        event_arr = [];
        let event_json = JSON.parse(buffer3);
        if(event_json._embedded && event_json._embedded.events && event_json._embedded.events.length > 0){
          event_json._embedded.events.forEach(element => {
            event_arr.push({date: element['dates']['start']['localDate'] ? element['dates']['start']['localDate'] : '',
                            event: element['name'],
                            category: (element['classifications'][0]['genre'] && element['classifications'][0]['segment']) ? element['classifications'][0]['genre']['name']+'-'+element['classifications'][0]['segment']['name'] : '',
                            venue_info: element['_embedded']['venues'][0] ? element['_embedded']['venues'][0]['name'] : '',
                            event_abbr: '',
                            id: element['id']
                          });
          });
        }
        res.status(200).send(event_arr);
      });
    })
  }

  get_location(location).then((coord) => {
    if(coord){
      get_event(coord.lat, coord.lng);
    }
    else{
      get_event(lat, lng);
    }
  });

});



module.exports = app;
