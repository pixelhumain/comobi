import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Mongo } from 'meteor/mongo';

import { Citoyens } from '../../../api/citoyens.js';

import './follows.html';

Template.listFollows.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  self.autorun(function(c) {
    Session.set('scopeId', Router.current().params._id);
  });

  self.autorun(function(c) {
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
  'click .followperson-link' (evt) {
    evt.preventDefault();
    Meteor.call('followEntity', this._id._str, 'citoyens');
  },
  'click .unfollowperson-link' (evt) {
    evt.preventDefault();
    Meteor.call('disconnectEntity', this._id._str, 'citoyens');
  },
});
