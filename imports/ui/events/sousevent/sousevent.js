import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Counts } from 'meteor/tmeasday:publish-counts';

// collections
import { Events } from '../../../api/events.js';

// submanager
import { listSousEventsSubs } from '../../../api/client/subsmanager.js';

import { pageSession } from '../../../api/client/reactive.js';
import './sousevent.html';

Template.listeventSous.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  self.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
  });

  // sub listEvents
  self.autorun(function() {
    const handle = listSousEventsSubs.subscribe('listeventSous', Router.current().params._id);
    self.ready.set(handle.ready());
  });
});

Template.listeventSous.helpers({
  events () {
    return Events.find({ parentId: Router.current().params._id });
  },
  countEvents () {
    return Counts.get(`countSous.${Router.current().params._id}`);
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
