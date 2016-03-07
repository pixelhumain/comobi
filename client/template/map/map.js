
Template.map.onCreated(function () {

});

Template.map.onRendered(function () {
  var self = this;
  L.mapbox.accessToken = 'pk.eyJ1IjoiY29tbXVuZWN0ZXIiLCJhIjoiY2lreWRkNzNrMDA0dXc3bTA1MHkwbXdscCJ9.NbvsJ14y2bMWWdGqucR_EQ';
  let map = L.mapbox.map('map','mapbox.streets');
  var marker;
  this.autorun(function(c) {
    let city = pageSession.get('city') || AutoForm.getFieldValue('city');
    let latitude = pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
    let longitude = pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
    console.log(`${city} ${latitude} ${longitude}`);
    if (latitude && longitude) {
      console.log('recompute');
      map.setView(new L.LatLng(parseFloat(latitude), parseFloat(longitude)), 13);
      if(marker){
        map.removeLayer(marker);
      }
      marker = L.marker(new L.LatLng(parseFloat(latitude), parseFloat(longitude))).bindPopup('Vous êtes ici :)').addTo(map);
    }
    //c.stop();
  });

});
