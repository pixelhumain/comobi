
import { Meteor } from 'meteor/meteor';
import { Reloader } from 'meteor/jamielob:reloader';
import { Tracker } from 'meteor/tracker';
import { Template } from 'meteor/templating';

Meteor.startup(() => {
  if (Meteor.isCordova) {
    Tracker.autorun((c) => {
      if (device.platform === 'Android') {
        if (Reloader.updateAvailable.get()) {
          IonPopup.alert({
            template: 'Fermez et réouvrez l\'application pour obtenir la nouvelle version!',
          });
          c.stop();
        }
      }
    });
  }

  Template.registerHelper('urlApp', () => {
    if (Meteor.isCordova && !Meteor.isDesktop) {
      if (device.platform === 'Android') {
        return 'https://play.google.com/store/apps/details?id=org.communecter.mobile';
      }
      // return 'https://itunes.apple.com/FR/app/xxxxxxxx?mt=8';
    }
  });
});

if (Meteor.isDevelopment) {
  Reloader.configure({
    check: false, // don't check on startup
    refresh: 'instantly', // refresh as soon as updates are available
  });
} else if (Meteor.isCordova) {
  if (Meteor.isDesktop) {
    Reloader.configure({
      check: false, // don't check on startup
      refresh: 'instantly', // refresh as soon as updates are available
    });
  } else {
    Reloader.configure({
      check: 'firstStart', // Only make an additonal check the first time the app ever starts
      checkTimer: 5000, // Wait 5 seconds to see if new code is available on first start
      refresh: 'start', // Only refresh to already downloaded code on a start and not a resume
    });
  }
}
