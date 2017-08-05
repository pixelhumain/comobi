import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mongo } from 'meteor/mongo';

import { Citoyens } from '../../../api/citoyens.js';
import { Events } from '../../../api/events.js';

import './attendees.html';

Template.listAttendees.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  self.autorun(function(c) {
    Session.set('scopeId', Router.current().params._id);
  });

  self.autorun(function(c) {
    const handle = Meteor.subscribe('listAttendees', Router.current().params._id);
    self.ready.set(handle.ready());
  });
});

Template.listAttendees.helpers({
  events () {
    return Events.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
  },
  onlineAttendees () {
    const user = Meteor.users.findOne({ _id: this._id._str });
    return user && user.profile && user.profile.online;
  },
  isFollowsAttendees (followId) {
    if (Meteor.userId() === followId) {
      return true;
    }
    const citoyen = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { links: 1 } });
    return citoyen.links && citoyen.links.follows && citoyen.links.follows[followId];
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listAttendees.events({
  'click .followperson-link' (evt) {
    evt.preventDefault();
    Meteor.call('followEntity', this._id._str, 'citoyens');
  },
  'click .unfollowperson-link' (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity', this._id._str, 'citoyens');
  },
});
