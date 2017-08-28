import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import { pageVideo } from '../../api/client/reactive.js';

Meteor.startup(() => {
  pageVideo.set('showChat', false);
  pageVideo.set('showCaller', false);
  pageVideo.set('showTarget', false);

  Meteor.VideoCallServices.RTCConfiguration = { iceServers: [{
    urls: 'turn:numb.viagenie.ca',
    credential: 'codjab974',
    username: 'thomas.craipeau@gmail.com',
  }] };

  Tracker.autorun((c) => {
    if (Meteor.userId() && Meteor.user()) {
      Meteor.VideoCallServices.onReceivePhoneCall = (fields) => {
        const callerId = fields.caller;
        Meteor.call('getUser', callerId, (error, user) => {
          if (!error) {
            pageVideo.set('showChat', user._id._str);
            IonPopup.confirm({
              title: TAPi18n.__('You are receiving a phone call'),
              template: (user.profilThumbImageUrl ? `<img src="${Meteor.settings.public.urlimage}${user.profilThumbImageUrl}"> ${user.name}` : `${user.name}`),
              onOk() {
                pageVideo.set('showTarget', true);
                Router.go('videoRTC');
              },
              okText: TAPi18n.__('Answer'),
              cancelText: TAPi18n.__('Ignore'),
              onCancel() {
                pageVideo.set('showChat', false);
                pageVideo.set('showTarget', false);
                Meteor.VideoCallServices.endPhoneCall();
              },
            });
          }
        });
      };
      c.stop();
    }
  });
});
