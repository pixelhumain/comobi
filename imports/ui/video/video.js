import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { TAPi18n } from 'meteor/tap:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import { $ } from 'meteor/jquery';

import { Citoyens } from '../../api/citoyens.js';

import './video.html';

import { pageVideo } from '../../api/client/reactive.js';

Template.videoRTC.onCreated(function() {
  const template = Template.instance();
  template.ready = new ReactiveVar(false);

  this.autorun(function() {
    const handle = Meteor.subscribe('callUsers');
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.videoRTC.onRendered(function() {
  const self = this;
  Meteor.VideoCallServices.onError = (err, data) => {
    console.log(err, data);
  };
  Meteor.VideoCallServices.onTargetAccept = () => {
    console.log('onTargetAccept');
  };

  Meteor.VideoCallServices.onPeerConnectionCreated = () => {
    console.log('onPeerConnectionCreated');
  };

});

Template.videoRTC.events({
  'click .callUser'(event, instance) {
    event.preventDefault();
    const user = Meteor.users.findOne({
      _id: this.user._id._str,
    });
    if (!user || !user.status.online) { throw new Meteor.Error(500, 'user offline'); }
    pageVideo.set('showCaller', true);
    pageVideo.set('showChat', this.user._id._str);
  },
});

Template.videoRTC.helpers({
  listUsers() {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).listFollows();
  },
  onlineUser(userId) {
    const user = Meteor.users.findOne({
      _id: userId,
    });
    if (!user || !user.status.online) {
      return false;
    }
    return true;
  },
  showChat() {
    return pageVideo.get('showChat');
  },
  showTarget() {
    return pageVideo.get('showTarget');
  },
  showCaller() {
    return pageVideo.get('showCaller');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.callTargetRTC.onRendered(function() {
  const self = this;

  this.autorun(function(c) {
    if (pageVideo.get('showTarget') === true) {
      self.caller = self.$('#caller').get(0);
      self.target = self.$('#target').get(0);
      Meteor.VideoCallServices.answerPhoneCall(self.caller, self.target);
      c.stop();
    }
  });

  Meteor.VideoCallServices.onTerminateCall = () => {
    console.log('onTerminateCall');
    IonPopup.alert({
      title: TAPi18n.__('onTerminateCall'),
    });
    Meteor.VideoCallServices.endPhoneCall();
    const stopStreamedVideo = (videoElem) => {
      const stream = videoElem.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        videoElem.srcObject = null;
      }
    };
    stopStreamedVideo(self.caller);
    stopStreamedVideo(self.target);
    pageVideo.set('showChat', false);
    pageVideo.set('showCaller', false);
    pageVideo.set('showTarget', false);
  };
});

Template.callCallerRTC.onRendered(function() {
  const self = this;

  this.autorun(function(c) {
    if (pageVideo.get('showCaller') === true) {
      self.caller = self.$('#caller').get(0);
      self.target = self.$('#target').get(0);
      if (self.caller && self.target) {
        Meteor.VideoCallServices.call(pageVideo.get('showChat'), self.caller, self.target);
        c.stop();
      }
    }
  });

  Meteor.VideoCallServices.onTerminateCall = () => {
    console.log('onTerminateCall');
    IonPopup.alert({
      title: TAPi18n.__('onTerminateCall'),
    });
    Meteor.VideoCallServices.endPhoneCall();
    const stopStreamedVideo = (videoElem) => {
      const stream = videoElem.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        videoElem.srcObject = null;
      }
    };
    stopStreamedVideo(self.caller);
    stopStreamedVideo(self.target);
    pageVideo.set('showChat', false);
    pageVideo.set('showCaller', false);
    pageVideo.set('showTarget', false);
  };
});

Template.callRTC.events({
  'click .endPhoneCall'(event, instance) {
    event.preventDefault();
    Meteor.VideoCallServices.endPhoneCall();
    pageVideo.set('showChat', false);
    pageVideo.set('showCaller', false);
    pageVideo.set('showTarget', false);
  },
});
