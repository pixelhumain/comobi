
import { Meteor } from 'meteor/meteor';
import { Reloader } from 'meteor/jamielob:reloader';

/* Meteor._reload.onMigrate(function() {
return [false];
}); */

/* Tracker.autorun((c) => {
  if (Reload.isWaitingForResume()) {
    IonPopup.alert({ template: TAPi18n.__('Close and reopen the application to get the new version!') });
    c.stop();
  }
}); */

if (Meteor.isDevelopment) {
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
