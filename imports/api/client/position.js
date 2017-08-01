import { Meteor } from 'meteor/meteor';
import { Location } from 'meteor/djabatav:geolocation-plus';
import { Session } from 'meteor/session';

export const position = {
  config() {

    Session.setDefault('geolocate', true);
    Session.setDefault('radius', 10000);
    Session.setDefault('oldRadius', 10000);
    Session.setDefault('GPSstart', false);

    function success(state) {
      if (state === 'Enabled') {
        console.log('GPS Is Enabled');
        Session.set('GPSstart', true);
      }
    }

    function failure() {
      console.log('Failed to get the GPS State');
      Session.set('GPSstart', false);
    }

    const options = {
      dialog: false,
    };

    //Location.debug = true;
    Location.getGPSState(success, failure, options);
    Location.enableDistanceFilter(5);
    Location.enableTimeFilter(60);
    this.locateNoFilter();
  },
  start() {
    Location.startWatching((pos) => {
       console.log('start Got a position!', pos);
    }, (err) => {
      if (err.code == err.PERMISSION_DENIED){
        Session.set('GPSstart', false);
      }
    });
  },
  stop() {
    Location.stopWatching();
  },
  setMockLocation(latlng){
  if(latlng && latlng.latitude){
  Location.setMockLocation({
            latitude : parseFloat(latlng.latitude),
            longitude : parseFloat(latlng.longitude),
            updatedAt : new Date()
          });
        }
},
locate(){
  Location.locate(function(pos){
 console.log("Got a position!", pos);
}, function(err){
 console.log("Oops! There was an error", err);
});
},
locateNoFilter(){
  Location.locateNoFilter(function(pos){
 console.log("Got a position!", pos);
}, function(err){
  if (err.code == err.PERMISSION_DENIED){
    Session.set('GPSstart', false);
  }
 console.log("Oops! There was an error", err);
});
},
    getRadius() {
      const radius = Session.get('radius');
      return radius;
    },
    getOldRadius() {
      const radius = Session.get('oldRadius');
      return radius;
    },
    getLatlng() {
      const reactivePosition = Location.getReactivePosition();
      const lastPosition = Location.getLastPosition();
      const latlng = reactivePosition || lastPosition;
      return latlng;
    },
    getReactivePosition() {
      const reactivePosition = Location.getReactivePosition();
      return reactivePosition;
    },
    getLatlngObject() {
      const latlng = this.getLatlng();
      if(latlng && latlng.latitude){
      return {
        latitude: parseFloat(latlng.latitude),
        longitude: parseFloat(latlng.longitude)
      };
    }
    },
    getLatlngArray() {
      const latlng = this.getLatlng();
      if(latlng && latlng.latitude){
      return [parseFloat(latlng.longitude), parseFloat(latlng.latitude)];
    }
    },
    getNear() {
      const radius = this.getRadius();
      const latlngArray = this.getLatlngArray();
      if(radius && latlngArray){
    return {
      geoPosition: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: latlngArray
          },
          $maxDistance: radius
        }
      }
    };
  }
  }
};
