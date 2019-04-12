import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Router } from 'meteor/iron:router';
import i18n from 'meteor/universe:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import Howl from 'howler';
import { VideoCallServices } from 'meteor/elmarti:video-chat';

import { pageVideo } from '../../api/client/reactive.js';

Meteor.startup(() => {
  pageVideo.set('showChat', false);
  pageVideo.set('showCaller', false);
  pageVideo.set('showTarget', false);

  VideoCallServices.init({
    iceServers: [{
      urls: 'turn:numb.viagenie.ca',
      credential: 'codjab974',
      username: 'thomas.craipeau@gmail.com',
    }],
  });

  const sound = new Howl.Howl({
    src: ['sounds/highbell.mp3'],
    mobileAutoEnable: true,
    usingWebAudio: true,
    html5: true,
  });


  Tracker.autorun((c) => {
    if (Meteor.userId() && Meteor.user()) {
      VideoCallServices.onReceiveCall = (callerId) => {
        Meteor.call('getUser', callerId, (error, user) => {
          if (!error) {
            pageVideo.set('showChat', user._id._str);
            sound.play();
            IonPopup.confirm({
              title: `<i class="icon fa fa-video-camera"></i> ${i18n.__('You are receiving a phone call')}`,
              template: (user.profilThumbImageUrl ? `<div class="list card"><div class="item item-avatar"><img src="${Meteor.settings.public.urlimage}${user.profilThumbImageUrl}"> <h2>${user.name}</h2></div></div>` : `<div class="list card"><div class="item"><h2>${user.name}</h2></div></div>`),
              onOk() {
                pageVideo.set('showTarget', true);
                Router.go('videoRTC');
              },
              okText: '<i class="icon fa fa-phone"></i>',
              okType: 'button-balanced',
              cancelText: '<i class="icon fa fa-times"></i>',
              cancelType: 'button-assertive',
              onCancel() {
                pageVideo.set('showChat', false);
                pageVideo.set('showTarget', false);
                // VideoCallServices.rejectCall()
                VideoCallServices.endCall();
              },
            });
          }
        });
      };
      c.stop();
    }
  });
});
