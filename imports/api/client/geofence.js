import { SessionGeo } from './reactive.js';

// https://github.com/cowbell/cordova-plugin-geofence
// meteor add cordova:cordova-plugin-geofence@https://github.com/cowbell/cordova-plugin-geofence/tarball/master

/*
iOS - 20 geofences
Android - 100 geofences

TransitionType.ENTER = 1
TransitionType.EXIT = 2
TransitionType.BOTH = 3

window.geofence.initialize(onSuccess, onError)
window.geofence.addOrUpdate(geofences, onSuccess, onError)
window.geofence.remove(geofenceId, onSuccess, onError)
window.geofence.removeAll(onSuccess, onError)
window.geofence.getWatched(onSuccess, onError)

UNKNOWN
PERMISSION_DENIED
GEOFENCE_NOT_AVAILABLE
GEOFENCE_LIMIT_EXCEEDED

{
    id:             String, //A unique identifier of geofence
    latitude:       Number, //Geo latitude of geofence
    longitude:      Number, //Geo longitude of geofence
    radius:         Number, //Radius of geofence in meters
    transitionType: Number, //Type of transition 1 - Enter, 2 - Exit, 3 - Both
    notification: {         //Notification object
        id:             Number, //optional should be integer, id of notification
        title:          String, //Title of notification
        text:           String, //Text of notification
        smallIcon:      String, //Small icon showed in notification area, only res URI
        icon:           String, //icon showed in notification drawer
        openAppOnClick: Boolean,//is main app activity should be opened after clicking on notification
        vibration:      [Integer], //Optional vibration pattern - see description
        data:           Object  //Custom object associated with notification
    }
}


*/

const geofenceApi = {
  limit: { Android: 100, iOS: 20 },
  geofence: window.geofence,
  debug: true,
  congig(platform) {
    SessionGeo.setDefault('geofenceInitialize', null);
    SessionGeo.setDefault('geofenceError', null);
    SessionGeo.setDefault('geofencePlatform', null);
    SessionGeo.setDefault('geofenceCount', 0);
    this.setPlatform(platform);
    return this.initialize();
  },
  setError(error) {
    SessionGeo.set('geofenceError', error);
  },
  async initialize () {
    try {
      const initialize = await this.geofence.initialize();
      if (initialize) {
        if (this.debug === true) {
          console.log('Successful initialization');
        }
        SessionGeo.set('geofenceInitialize', true);
        return true;
      }
      return null;
    } catch (error) {
      if (this.debug === true) {
        console.log(error.code);
        console.log(error.message);
      }
      this.setError(error);
      return error;
    }

    /* this.geofence.initialize().then(() => {
      if (this.debug === true) {
        console.log('Successful initialization');
      }
      SessionGeo.set('geofenceInitialize', true);
    }, this.onError); */
  },
  async addOrUpdate(geofences) {
    try {
      const addOrUpdate = await this.geofence.addOrUpdate(geofences);
      if (addOrUpdate === 'OK') {
        if (this.debug === true) {
          console.log(addOrUpdate);
          console.log('Geofence successfully added');
        }
      }
      return true;
    } catch (error) {
      if (this.debug === true) {
        console.log('Adding geofence failed', error);
      }
      SessionGeo.set('geofenceError', error);
      return error;
    }
    /* this.geofence.addOrUpdate(geofences).then(() => {
      if (this.debug === true) {
        console.log('Geofence successfully added');
      }
    }, (error) => {
      if (this.debug === true) {
        console.log('Adding geofence failed', error);
      }
      SessionGeo.set('geofenceError', error);
    }); */
  },
  setGeofences(geofences) {
    // count limit
    if (geofences && SessionGeo.get('geofenceInitialize') === true) {
      return this.addOrUpdate(geofences);
    }
  },
  async remove(geofenceId) {
    try {
      const remove = await this.geofence.remove(geofenceId);
      if (remove) {
        if (this.debug === true) {
          console.log('Geofence sucessfully removed');
        }
        return true;
      }
      return null;
    } catch (error) {
      if (this.debug === true) {
        console.log('Removing geofence failed', error);
      }
      return error;
    }

    /* this.geofence.remove(geofenceId)
      .then(() => {
        if (this.debug === true) {
          console.log('Geofence sucessfully removed');
        }
      }
        , (error) => {
        if (this.debug === true) {
          console.log('Removing geofence failed', error);
        }
      }); */
  },
  async  removeAll() {
    try {
      const removeAll = await this.geofence.removeAll();
      if (removeAll) {
        if (this.debug === true) {
          console.log(removeAll);
          console.log('All geofences successfully removed.');
        }
        return true;
      }
      return null;
    } catch (error) {
      if (this.debug === true) {
        console.log('Removing geofences failed', error);
      }
      return error;
    }
    /* this.geofence.removeAll()
      .then(() => {
        if (this.debug === true) {
          console.log('All geofences successfully removed.');
        }
      }
        , (error) => {
        if (this.debug === true) {
          console.log('Removing geofences failed', error);
        }
      }); */
  },
  async getWatched() {
     try {
      const geofencesJson = await this.geofence.getWatched();
        const geofences = JSON.parse(geofencesJson);
        console.log(JSON.stringify(geofences));
        return geofences;
    } catch (error) {
      if (this.debug === true) {
        console.log('getWatcheds failed', error);
      }
      return error;
    }
  },
  setPlatform(platform) {
    if (platform === 'Android' || platform === 'iOS') {
      SessionGeo.set('geofencePlatform', platform);
    }
    SessionGeo.set('geofencePlatform', null);
  },
  getPlatform() {
    return SessionGeo.get('geofencePlatform');
  },
  getLimit() {
    const platform = this.getPlatform();
    if (platform) {
      return this.limit[platform];
    }
    return null;
  },
  onTransitionReceived() {
    this.geofence.onTransitionReceived = (geofences) => {
      geofences.forEach(function (geo) {
        console.log(JSON.stringify(geo));
        if (geo.transitionType === 1) {
          console.log('ENTER');
        } else if (geo.transitionType === 2) {
          console.log('EXIT');
        }
        console.log('Geofence transition detected');
      });
    };
  },
  onNotificationClicked() {
    this.geofence.onNotificationClicked = (notificationData) => {
      console.log(JSON.stringify(notificationData));
      console.log('App opened from Geo Notification!');
    };
  },
};

/* const initialize = geofenceApi.initialize();
if (initialize) {

  //const removeAll = geofenceApi.removeAll();
  //if (removeAll) {
    const addOrUpdate = geofenceApi.addOrUpdate({
      id: '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb',
      latitude: 50.2980,
      longitude: 18.6594,
      radius: 10000,
      transitionType: TransitionType.BOTH,
      notification: {
        id: 1,
        title: 'test home',
        text: 'test home',
        icon: 'res://ic_launcher',
        openAppOnClick: true,
      },
    });
    console.log(JSON.stringify(addOrUpdate));
    if (addOrUpdate) {
      const geofencesJson = await geofenceApi.getWatched();
      if(geofencesJson){
        console.log(JSON.stringify(geofencesJson));
      }
    }
  //}

  geofenceApi.onTransitionReceived();
  geofenceApi.onNotificationClicked();
} */

export { geofenceApi as default };
