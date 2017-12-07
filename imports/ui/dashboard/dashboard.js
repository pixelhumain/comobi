import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// submanager
import { dashboardSubs, scopeSubscribe } from '../../api/client/subsmanager.js';
import { Highlight } from '../../api/highlight.js';
import { Chronos } from '../../api/client/chronos.js';

import position from '../../api/client/position.js';

import { geoId } from '../../api/client/reactive.js';

import '../components/scope/item.js';
import './dashboard.html';

Template.dashboard.onCreated(function () {
  scopeSubscribe(this, dashboardSubs, 'geo.dashboard', 'dashboard');
});


Template.dashboard.helpers({
  city () {
    // console.log(JSON.stringify(position.getCity()));
    return position.getCity();
  },
  radius () {
    return position.getRadius();
  },
  meteorId () {
    return Meteor.userId();
  },
  geoId (scope) {
    return `countScopeGeo.${geoId.get('geoId')}.${scope}`;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.highlight.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  self.autorun(function () {
    if (position.getCity() && position.getCity()._id._str) {
      const handle = dashboardSubs.subscribe('highlight', position.getCity()._id._str);
      self.ready.set(handle.ready());
    }
  });
});


Template.highlight.helpers({
  listHighlight() {
    if (position.getCity() && position.getCity()._id._str) {
      console.log('listHighlight');
      const inputDate = new Date();
      // const inputDate = Chronos.moment().toDate();
      const query = {};
      // query.startDate = { $lte: inputDate };
      // query.endDate = { $gte: inputDate };
      query.localityId = position.getCity()._id._str;
      return Highlight.find(query);
    }
  },
  listHighlightCount() {
    if (position.getCity() && position.getCity()._id._str) {
      console.log('listHighlight');
      const inputDate = new Date();
      // const inputDate = Chronos.moment().toDate();
      const query = {};
      query.startDate = { $lte: inputDate };
      query.endDate = { $gte: inputDate };
      query.localityId = position.getCity()._id._str;
      return Highlight.find(query).count();
    }
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
