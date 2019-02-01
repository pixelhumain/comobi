import { Meteor } from 'meteor/meteor';
import { Push } from 'meteor/raix:push';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';

// collection
import { Citoyens } from '../citoyens.js';

Accounts.onLogin(function(user) {
// console.log(user.user._id)
  const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(user.user._id) }, { fields: { pwd: 0 } });

  if (!userC) {
  // throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'Communecter Login Failed');
  } else {
  // ok valide
    const userM = Meteor.users.findOne({ _id: userC._id._str });
    // console.log(userM);
    if (userM && userM.profile && userM.profile.pixelhumain) {
    // Meteor.user existe
      const userId = userM._id;
      Meteor.users.update(userId, { $set: { 'profile.pixelhumain': userC } });
    } else {
    // username ou emails
      const userId = userM._id;
      Meteor.users.update(userId, { $set: { 'profile.pixelhumain': userC } });
    }
  }
});

let serviceAccountJson = JSON.parse(Assets.getText('communecter-5647e-firebase-adminsdk-0baqw-4ea1186253.json'));


if (Meteor.isDevelopment) {
  Push.debug = true;
  Push.Configure({
    fcm: {
      serviceAccountJson: serviceAccountJson
    },
    gcm: {
      apiKey: Meteor.settings.pushapiKey,
      projectNumber: 376774334081,
    },
    production: true,
    sound: true,
    badge: true,
    alert: true,
    vibrate: true,
    //sendInterval: null,
    appName: 'main',
  });
} else {
  Push.Configure({
    fcm: {
      serviceAccountJson: serviceAccountJson
    },
    gcm: {
      apiKey: Meteor.settings.pushapiKey,
      projectNumber: 376774334081,
    },
    production: true,
    sound: true,
    badge: true,
    alert: true,
    vibrate: true,
    appName: 'main',
  });
}

/* Push.Configure({
  apn: {
    certData: Assets.getText('apn-production/PushCommunEventCert.pem'),
    keyData: Assets.getText('apn-production/PushCommunEventKey.pem'),
    production: true,
    //gateway: 'gateway.push.apple.com',
  },
  gcm: {
    apiKey: '',
    projectNumber:
  }
   //'production': true,
   //'sound': true,
   //'badge': true,
   //'alert': true,
   //'vibrate': true,
  // 'sendInterval': 15000, Configurable interval between sending
  // 'sendBatchSize': 1, Configurable number of notifications to send per batch
  // 'keepNotifications': false,
//
}); */

Push.allow({
  send(userId, notification) {
    return true;
  },
});
