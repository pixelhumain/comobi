import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { geolib } from 'meteor/outatime:geolib';

import position from '../../api/client/position.js';

Meteor.startup(() => {
  position.config();

  Template.registerHelper('distance', function (coordinates) {
    const geo = position.getLatlngObject();
    if (geo && geo.latitude && coordinates) {
      const rmetre = geolib.getDistance(
        { latitude: parseFloat(coordinates.latitude),
          longitude: parseFloat(coordinates.longitude) },
        { latitude: parseFloat(geo.latitude),
          longitude: parseFloat(geo.longitude) });
      if (rmetre > 1000) {
        const rkm = rmetre / 1000;
        return `${rkm} km`;
      }
      return `${rmetre} m`;
    }
    return false;
  });
});


Tracker.autorun(() => {
  // if (Meteor.userId() && Meteor.user()) {
  const geolocate = position.getGeolocate();
  if (geolocate) {
    position.start();
  } else {
    position.stop();
  }
  // }
});
