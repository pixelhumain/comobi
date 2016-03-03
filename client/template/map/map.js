
Template.map.onCreated(function () {

});

Template.map.onRendered(function () {
  var self = this;
  L.Icon.Default.imagePath = '/packages/bevanhunt_leaflet/images';
  let map = L.map('map', {
    doubleClickZoom: false
  });
  L.tileLayer.provider('Thunderforest.Outdoors').addTo(map);
  var marker;
  self.autorun(function(c) {
    let city = pageSession.get('city') || AutoForm.getFieldValue('city');
    let latitude = pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
    let longitude = pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
    console.log(`${city} ${latitude} ${longitude}`);
    if (city && latitude && longitude) {
      console.log('recompute');
      map.setView([latitude, longitude], 13);
      if(marker){
        map.removeLayer(marker);
      }
      marker = L.marker([latitude, longitude]).addTo(map);
    }
    //c.stop();
  });

});
