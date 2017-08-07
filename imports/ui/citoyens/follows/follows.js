import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';

import { Citoyens } from '../../../api/citoyens.js';

import './follows.html';

Template.listFollows.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  self.autorun(function() {
    const handle = Meteor.subscribe('listFollows', Router.current().params._id);
    self.ready.set(handle.ready());
  });
});

Template.listFollows.helpers({
  citoyens () {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
  },
  onlineFollows () {
    const user = Meteor.users.findOne({ _id: this._id._str });
    return user && user.profile && user.profile.online;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listFollows.events({
  'click .followperson-link' (event) {
    event.preventDefault();
    Meteor.call('followEntity', this._id._str, 'citoyens');
  },
  'click .unfollowperson-link' (event) {
    event.preventDefault();
    Meteor.call('disconnectEntity', this._id._str, 'citoyens');
  },
});
