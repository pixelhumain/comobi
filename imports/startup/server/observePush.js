import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Push } from 'meteor/raix:push';
import { ActivityStream } from '../../api/activitystream.js';

import { notifyDisplay } from '../../api/helpers.js';

if (Meteor.isDevelopment) {
  Push.debug = true;
}

const pushUser = (title, text, payload, query, badge) => {
  const notId = Math.round(new Date().getTime() / 1000);
  // console.log(payload);
  const payloadStringify = {};
  /* 
  for (const key in payload) {
    if (_.isString(payload[key])) {
      payloadStringify[key] = payload[key];
    }else {
      payloadStringify[key] = JSON.stringify(payload[key]);
    }
  } */
  payloadStringify.custom_key1 = JSON.stringify(payload);
  //console.log(payloadStringify);
  Push.send({
    from: 'push',
    title,
    text,
    payload: payloadStringify,
    sound: 'default',
    query,
    badge,
    apn: {
      sound: 'default',
    },
    contentAvailable: 1,
    androidChannel: 'PushPluginChannel',
    notId,
  });
};

Meteor.startup(function() {
  const query = {};
  query.created = { $gt: new Date() };
  const options = {};
  options.sort = { created: 1 };
  console.log(query);
  var initNotifystart = ActivityStream.find(query, options).observe({
    added(notification) {
      if (!initNotifystart) return;
      // le serveur start donc la date est fixe on recupre les notifs qui sont créer aprés
      // mais ensuite
      // console.log(JSON.stringify(notification));
      if (notification && notification.notify && notification.notify.id && notification.notify.displayName) {
        const title = 'notification';
        // const text = notification.notify.displayName;

        const notifsId = _.map(notification.notify.id, function(ids, key) {
          return key;
        });
        // verifier que présent dans Meteor.users
        const notifsIdMeteor = Meteor.users.find({ _id: { $in: notifsId } }, { fields: { _id: 1 } }).map(user => user._id);
        // console.log(notifsIdMeteor);
        if (notifsIdMeteor && notifsIdMeteor.length > 0) {
          _.each(notifsIdMeteor, function(value) {
            const query = {};
            query.userId = value;
            const lang = Meteor.users.findOne({ _id: value }, { fields: { 'profile.language': 1 } });
            const text = lang && lang.profile.language ? notifyDisplay(notification.notify, lang.profile.language) : notifyDisplay(notification.notify, 'en');
            const payload = JSON.parse(JSON.stringify(notification));
            const badge = ActivityStream.api.queryUnseen(value).count();
            // console.log({ value, badge });
            //console.log(payload);
            pushUser(title, text, payload, query, badge);
          }, title, notification);
        }
      }
    },
    changed(notification, oldNotification) {
        if (!initNotifystart) return;
        console.log(JSON.stringify(notification));
    }
  },
  );
});
