import { Meteor } from 'meteor/meteor';
import { Location } from 'meteor/djabatav:geolocation-plus';
import { Session } from 'meteor/session';

export const position = {
  config() {

    Session.setDefault('geolocate', true);
    Session.setDefault('radius', 10000);
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

  },
  start() {
    Location.startWatching((pos) => {
       console.log('start Got a position!', pos);
    }, (err) => {
      console.log('Oops! There was an error', err);
    });
  },
  stop() {
    Location.stopWatching();
  },
    getRadius() {
      const radius = Session.get('radius');
      return radius;
    },
    getLatlng() {
      const reactivePosition = Location.getReactivePosition();
      const lastPosition = Location.getLastPosition();
      const latlng = reactivePosition || lastPosition;
      return latlng;
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
