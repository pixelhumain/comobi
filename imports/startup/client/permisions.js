import { Meteor } from 'meteor/meteor';

import position from '../../api/client/position.js';

Meteor.startup(() => {
  if (Meteor.isCordova && !Meteor.isDesktop) {
    const permissions = cordova.plugins.permissions;

    const list = [
      permissions.ACCESS_COARSE_LOCATION,
      permissions.ACCESS_FINE_LOCATION,
      permissions.CAMERA,
      permissions.RECORD_AUDIO,
      permissions.MODIFY_AUDIO_SETTINGS,
      permissions.READ_CONTACTS,
    ];

    Tracker.autorun((c) => {
      const error = () => {
        console.warn('Camera, record audio and audio setting is not turned on');
      };

      const success = (status) => {
      // console.log(JSON.stringify(status));
        if (!status.hasPermission) {
          permissions.requestPermissions(
            list,
            (status) => {
            // console.log(JSON.stringify(status));
              if (!status.hasPermission) {
                error();
              } else {
                position.setPermissions(true);
                c.stop();
              }
            },
            error);
        } else {
          position.setPermissions(true);
        }
      };

      permissions.checkPermission(list, success, null);
    });
  } else {
    position.setPermissions(true);
  }
});
