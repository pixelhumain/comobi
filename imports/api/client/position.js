import { Location } from 'meteor/djabatav:geolocation-plus';
import { SessionGeo } from './reactive.js';

const position = {
  config() {
    SessionGeo.setDefault('geolocate', true);
    SessionGeo.setDefault('radius', 10000);
    SessionGeo.setDefault('oldRadius', 10000);
    SessionGeo.setDefault('GPSstart', false);

    function success(state) {
      if (state === 'Enabled') {
        // console.log('GPS Is Enabled');
        position.setGPSstart(true);
      }
    }

    function failure() {
      // console.log('Failed to get the GPS State');
      position.setGPSstart(false);
    }

    const options = {
      dialog: false,
    };

    // Location.debug = true;
    Location.getGPSState(success, failure, options);
    Location.enableDistanceFilter(5);
    Location.enableTimeFilter(60);
    this.locateNoFilter();
  },
  start() {
    Location.startWatching(() => {
      // console.log('start Got a position!', pos);
    }, (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        position.setGPSstart(false);
      }
    });
  },
  stop() {
    Location.stopWatching();
  },
  setMockLocation(latlng) {
    if (latlng && latlng.latitude) {
      Location.setMockLocation({
        latitude: parseFloat(latlng.latitude),
        longitude: parseFloat(latlng.longitude),
        updatedAt: new Date(),
      });
    }
  },
  setGPSstart(state) {
    SessionGeo.set('GPSstart', state);
  },
  setGeolocate(state) {
    SessionGeo.set('geolocate', state);
  },
  setRadius(radius) {
    SessionGeo.set('radius', radius);
  },
  setOldRadius(oldRadius) {
    SessionGeo.set('oldRadius', oldRadius);
  },
  setCity(city) {
    SessionGeo.set('city', city);
  },
  locate() {
    Location.locate(function() {
      // console.log('Got a position!', pos);
    }, function() {
      // console.log('Oops! There was an error', err);
    });
  },
  locateNoFilter() {
    Location.locateNoFilter(function() {
      // console.log('Got a position!', pos);
    }, function(err) {
      if (err.code === err.PERMISSION_DENIED) {
        position.setGPSstart(false);
      }
      // console.log('Oops! There was an error', err);
    });
  },
  getGPSstart() {
    return SessionGeo.get('GPSstart');
  },
  getGeolocate() {
    return SessionGeo.get('geolocate');
  },
  getRadius() {
    return SessionGeo.get('radius');
  },
  equalsRadius(select) {
    return SessionGeo.equals('radius', select);
  },
  getOldRadius() {
    return SessionGeo.get('oldRadius');
  },
  getCity() {
    return SessionGeo.get('city');
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
    if (latlng && latlng.latitude) {
      return {
        latitude: parseFloat(latlng.latitude),
        longitude: parseFloat(latlng.longitude),
      };
    }
    return undefined;
  },
  getLatlngArray() {
    const latlng = this.getLatlng();
    if (latlng && latlng.latitude) {
      return [parseFloat(latlng.longitude), parseFloat(latlng.latitude)];
    }
    return undefined;
  },
  getNear() {
    const radius = this.getRadius();
    const latlngArray = this.getLatlngArray();
    if (radius && latlngArray) {
      return {
        geoPosition: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: latlngArray,
            },
            $maxDistance: radius,
          },
        },
      };
    }
    return undefined;
  },
};

export { position as default };
