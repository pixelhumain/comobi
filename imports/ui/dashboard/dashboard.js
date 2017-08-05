import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// submanager
import { dashboardSubs, scopeSubscribe } from '../../api/client/subsmanager.js';

import position from '../../api/client/position.js';

import { geoId } from '../../api/client/reactive.js';

import './dashboard.html';

Template.dashboard.onCreated(function () {
  scopeSubscribe(this, dashboardSubs, 'geo.dashboard', 'dashboard');
});


Template.dashboard.helpers({
  city () {
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
