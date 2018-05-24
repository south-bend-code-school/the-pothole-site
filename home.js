
$(document).ready(initialize);
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyC1VDe_BNdttvS8hrk-s7aRjCCPIGAPtew",
    authDomain: "pothole-site.firebaseapp.com",
    databaseURL: "https://pothole-site.firebaseio.com",
    projectId: "pothole-site",
    storageBucket: "pothole-site.appspot.com",
    messagingSenderId: "1096900880599"
  };


  var map;
   var lat = 0;
   var long = 0;
   var current_location;
   // var x = document.getElementById("demo");

   function initialize(){
     firebase.initializeApp(config);
     $('#submitbutton').on('click',saveData);
     $('.modal').modal();
     findlocation();
   }

   function initMap(){
     map = new google.maps.Map(document.getElementById('map'), {
           zoom: 13,
           center: {lat:lat, lng:long}
         });
   }

   function saveData(){
     var description = $('#description').val();

     var entry ={
       description: description,
       lat: lat,
       long: long,
     }

     var newEntryKey = firebase.database().ref().child('Entry').push().key;
     var updates = {};
     updates['/Entry/' + newEntryKey] = entry;

     firebase.storage().ref().child('images/entry/' + newEntryKey).put($('#uploadfile')[0].files[0]).then(function(snapshot){
       return firebase.database().ref().update(updates).then(function(){
         window.location.replace('./index.html');
       });
     }).catch(function(error){
       console.log(error);
     });
   }

   function findEntriesNearMe() {
     console.log('finding entries near me');
     // $('#story').empty();
     firebase.database().ref('Entry').once('value', function(snapshot){
       var entry = snapshot.val();

       for(var i in entry){
         var lat = entry[i].lat;
         var long = entry[i].long;
         var description = entry[i].description;
         var location = {lat : lat, lng : long};
         // this is where we send the entry location to the haersine formula to
         // be compared against the current location of the user.

         firebase.storage().ref().child("images/entry/" + i).getDownloadURL().then(function(url) {

           if (url != null){
             var contentString = '<div id="content">'+
                '<div id="siteNotice">'+
                '<h6>'+description+'</h6>'+
                '<img style="width: 100%" src="'+url+
                '">'+
                '</div>'+
                '</div>';
          } else{
            var contentString = '<div id="content">'+
               '<div id="siteNotice">'+
               '<h6>'+description+'</h6>'+
               '</div>'+
               '</div>';
          }
          var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 320
          });

          var marker = new google.maps.Marker({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP,
            title: description,
          });

          marker.addListener('click', function() {
            infowindow.open(map, marker);
          });
         }).catch(function(error) {
           console.log(error);
         });
       }
     });
   }

 //=====all of this is geolocation
   function findlocation(){
     var options = {
       enableHighAccuracy: true,
       timeout: 5000,
       maximumAge: 0
     };

     function error(err) {
       console.warn(`ERROR(${err.code}): ${err.message}`);
     };

     function success(pos) {
       var crd = pos.coords;
       lat = crd.latitude;
       long = crd.longitude;
       current_location = {lat, long};
       initMap();
       findEntriesNearMe();
     };
     navigator.geolocation.watchPosition(success, error, options);
   }
 //=============================
