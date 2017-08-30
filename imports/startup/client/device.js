import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

Meteor.startup(() => {
  Tracker.autorun((c) => {
    if (Meteor.isCordova && !Meteor.isDesktop && Meteor.userId() && Meteor.user() && Meteor.user().profile) {
      Meteor.call('userDevice', device);
      c.stop();
    }
  });
});
